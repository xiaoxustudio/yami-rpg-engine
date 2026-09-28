import { YamiIpc } from '@app/services/ipc/bridge.ts';
import { Path } from '@app/utils/config';
import { FS, FSP } from '@app/services/file-system/fs-bridge.ts';
import { FileItem, FolderItem } from '@app/services/file-system/file-item.ts';
import type { FileItemHooks } from '@app/services/file-system/file-item.ts';
import { empty as fnEmpty } from '@app/utils/function';

export interface DirectoryTreeHooks {
	onVersionTick?: () => void;
	onReadError?: (error: unknown) => void;
	onManifestUpdate?: () => void;
	onChanged?: () => void;
	getChanges?: () => Array<unknown>;
	onSaved?: (metas: Array<unknown>) => void;
	fileItem: FileItemHooks;
	file: {
		path: (dirPath: string) => string;
		saveFile: (meta: unknown) => Promise<unknown>;
		filterGUID: (name: string) => string;
	};
}

interface ReaddirNode {
	name: string;
	path: string;
	children?: unknown[];
}

export class DirectoryTree {
	inoMap: Record<string, unknown> = {};
	assets: FolderItem | null = null;
	symbol: symbol | null = null;
	reading = false;
	updating: Promise<unknown> | null = null;

	private hooks: DirectoryTreeHooks;
	/**
	 * `focus` 监听器的具名引用——没有它就无法 remove（匿名箭头函数拿不到引用）。
	 *
	 * 原先 `initialize()` 直接 `window.addEventListener('focus', (e) => this.windowFocus(e))`：
	 * 一块匿名函数、注册后永不摘除。只要 `initialize()` 被调用两次（或将来某个流程重新
	 * 初始化目录树），`window` 上就会叠第二份，旧的那份还持有已作废的实例——
	 * 属于 `scripts/migration-ledger.mjs` 里 unremovable-listeners 轴记不到的真实累积泄漏
	 * （那轴把进程级常驻监听和实例级泄漏混在一起，只要求不增，见其注释）。
	 */
	private focusListener: ((event: FocusEvent) => void) | null = null;

	constructor(hooks: DirectoryTreeHooks) {
		this.hooks = hooks;
	}

	initialize() {
		// 幂等：先摘掉上一份再挂新的，保证 `window` 上恒为一份
		if (this.focusListener) {
			window.removeEventListener('focus', this.focusListener);
		}
		this.focusListener = (event: FocusEvent) => this.windowFocus(event);
		window.addEventListener('focus', this.focusListener);
	}

	read(): Promise<unknown> {
		const symbol = (this.symbol = Symbol());
		this.reading = true;
		return FolderItem.create('Assets', this.hooks.fileItem).then((assets) => {
			if (this.symbol === symbol) {
				this.symbol = null;
				this.assets = assets;
				this.hooks.onVersionTick?.();
				return assets
					.update()
					.then(
						async ({ promises }) => {
							this.createInoMap();
							if (promises.length) {
								await Promise.all(promises);
							}
						},
						(error: unknown) => {
							this.hooks.onReadError?.(error);
						}
					)
					.finally(() => {
						this.reading = false;
					});
			}
		});
	}

	close() {
		this.inoMap = {};
		this.assets = null;
		this.symbol = null;
		// 目录树关闭时摘掉 focus 监听：`close()` 会在项目打开/关闭流程里被调用
		// （services/project/open.ts、close.ts），此时再响应 window focus 已无意义。
		if (this.focusListener) {
			window.removeEventListener('focus', this.focusListener);
			this.focusListener = null;
		}
	}

	update(): Promise<unknown> | null {
		if (this.reading) {
			return Promise.resolve().then(() => false);
		}
		const { assets } = this;
		if (assets !== null && this.updating === null) {
			this.hooks.onVersionTick?.();
			this.reading = true;
			this.updating = assets
				.update()
				.then(
					async ({
						changed,
						promises
					}: {
						changed: boolean;
						promises: Promise<unknown>[];
					}) => {
						if (this.assets !== assets) {
							throw new Error('Directory update timeout');
						}
						if (changed) {
							this.createInoMap();
							this.hooks.onManifestUpdate?.();
						}
						if (promises.length) {
							await Promise.all(promises);
						}
						if (changed) {
							this.hooks.onChanged?.();
						}
						return changed;
					}
				)
				.finally(() => {
					this.reading = false;
					this.updating = null;
				});
		}
		return this.updating;
	}

	getFolder(path?: string): FolderItem | null {
		const nodes = (path ?? 'Assets').split('/');
		const length = nodes.length;
		let target = this.assets;
		outer: for (let i = 1; i < length; i++) {
			if (target instanceof FolderItem) {
				const subpath = target.path + '/' + nodes[i];
				for (const item of target.subfolders) {
					if (item.path === subpath) {
						target = item;
						continue outer;
					}
				}
			}
			break;
		}
		return target;
	}

	getFile(path: string): FileItem | undefined {
		const dirname = Path.dirname(path);
		const folder = this.getFolder(dirname);
		if (folder !== null && folder.path === dirname) {
			for (const item of folder.children) {
				if (item.path === path && item instanceof FileItem) {
					return item;
				}
			}
		}
		return undefined;
	}

	readdir(paths: string[]): Promise<Array<ReaddirNode>> {
		const options = { withFileTypes: true } as const;
		const read = (dirPath: string, dir: Array<ReaddirNode>): Promise<Array<ReaddirNode>> => {
			return FSP.readdir(dirPath, options).then(
				async (files: Array<{ name: string; isDirectory(): boolean }>) => {
					const promises: Array<Promise<unknown>> = [];
					for (const file of files) {
						const name = file.name;
						const path = `${dirPath}/${name}`;
						if (file.isDirectory()) {
							const children: unknown[] = [];
							dir.push({ name, path, children });
							promises.push(read(path, children as Array<ReaddirNode>));
						} else {
							dir.push({ name, path });
						}
					}
					if (promises.length !== 0) {
						await Promise.all(promises);
					}
					return dir;
				}
			);
		};
		return (async () => {
			const dir: Array<ReaddirNode> = [];
			const statPromises: Array<Promise<{ isDirectory(): boolean }>> = [];
			const readPromises: Array<Promise<unknown>> = [];
			const length = paths.length;
			for (let i = 0; i < length; i++) {
				statPromises.push(FSP.stat(paths[i]));
			}
			for (let i = 0; i < length; i++) {
				try {
					// oxlint-disable-next-line no-await-in-loop
					const stats = await statPromises[i];
					const path = paths[i];
					const name = Path.basename(path);
					if (stats.isDirectory()) {
						const children: Array<ReaddirNode> = [];
						dir.push({ name, path, children });
						readPromises.push(read(path, children));
					} else {
						dir.push({ name, path });
					}
				} catch (error: unknown) {
					console.error(error);
				}
			}
			await Promise.all(readPromises);
			return dir;
		})();
	}

	searchFiles(
		filters: string[] | null,
		keyword: RegExp,
		items: Array<FileItem | FolderItem>,
		list: Array<FileItem | FolderItem>
	): void {
		search(filters, keyword, items, list);
	}

	existFiles(
		dirPath: string,
		dir: Array<{ name: string; children?: unknown[] }>
	): Promise<boolean> {
		return checkExist(this.hooks.file.path(dirPath), dir).then(
			() => true,
			(_error: unknown) => false
		);
	}

	filterFiles(files: Array<FileItem | FolderItem>): Array<FileItem | FolderItem> {
		files.sort(filterSorter);
		const folders: string[] = [];
		let i = files.length;
		while (--i >= 0) {
			const file = files[i];
			const path = file.path;
			for (const folder of folders) {
				if (path.indexOf(folder) === 0 && path[folder.length] === '/') {
					files.splice(i, 1);
					continue;
				}
			}
			if (file instanceof FolderItem) {
				folders.push(path);
			}
		}
		return files.reverse();
	}

	deleteFiles(files: Array<FileItem | FolderItem>): Promise<unknown> | undefined {
		return trash(this.filterFiles(files), this.hooks);
	}

	moveFiles(dirPath: string, dir: Array<FileItem | FolderItem>): Promise<unknown> | undefined {
		return move(dirPath, this.filterFiles(dir), {});
	}

	saveFiles(files: Array<FileItem | FolderItem>): Promise<unknown> | undefined {
		const metaset: Array<unknown> = [];
		const changes = this.hooks.getChanges?.() ?? [];
		return save(files, changes, metaset, this.hooks).then((result: unknown) => {
			this.hooks.onSaved?.(metaset);
			return result;
		});
	}

	copyFiles(
		dirPath: string,
		dir: Array<FileItem | FolderItem>,
		suffix = ' - Copy'
	): Promise<unknown> | undefined {
		return copy(dirPath, dir, suffix, {}, this.hooks);
	}

	sortFiles(files: Array<FileItem | FolderItem>): Array<FileItem | FolderItem> {
		return files.sort(sortSorter);
	}

	createInoMap(): void {
		const { assets } = this;
		if (assets instanceof FolderItem) {
			registerInoMap((this.inoMap = {}), assets);
		}
	}

	windowFocus(_event: FocusEvent): void {
		setTimeout(() => this.update(), 100);
	}
}

function search(
	filters: string[] | null,
	keyword: RegExp,
	items: Array<FileItem | FolderItem>,
	list: Array<FileItem | FolderItem>
): void {
	const length = items.length;
	for (let i = 0; i < length; i++) {
		const item = items[i];
		if (filters !== null && item instanceof FileItem && !filters.includes(item.type)) {
			continue;
		}
		if (keyword.test(item.name)) {
			list.push(item);
		}
		if (item instanceof FolderItem) {
			search(filters, keyword, item.children, list);
		}
	}
}

async function checkExist(
	dirPath: string,
	dir: Array<{ name: string; children?: unknown[] }>
): Promise<unknown> {
	const promises: Array<Promise<unknown>> = [];
	for (const file of dir) {
		const path = `${dirPath}/${file.name}`;
		promises.push(FSP.stat(path));
		if (file.children?.length) {
			promises.push(
				checkExist(path, file.children as Array<{ name: string; children?: unknown[] }>)
			);
		}
	}
	if (promises.length !== 0) {
		return Promise.any(promises);
	}
}

function filterSorter(a: FileItem | FolderItem, b: FileItem | FolderItem): number {
	if (a instanceof FileItem) {
		if (b instanceof FileItem) {
			return -a.path.localeCompare(b.path);
		} else {
			return -1;
		}
	} else {
		if (b instanceof FileItem) {
			return 1;
		} else {
			return -a.path.localeCompare(b.path);
		}
	}
}

async function trash(
	files: Array<FileItem | FolderItem>,
	hooks: DirectoryTreeHooks
): Promise<unknown> {
	const promises: Array<Promise<unknown>> = [];
	for (const file of files) {
		const path = hooks.file.path(file.path);
		promises.push(YamiIpc.invoke.trashItem(path));
	}
	if (promises.length !== 0) {
		return Promise.all(promises);
	}
}

async function move(
	dirPath: string,
	dir: Array<FileItem | FolderItem>,
	existings: Record<string, boolean>
): Promise<unknown> {
	const promises: Array<Promise<unknown>> = [];
	for (const file of dir) {
		const path = `${dirPath}/${file.name}`;
		if (!existings[path]) {
			existings[path] = true;
			promises.push(FSP.rename(file.path, path));
		}
	}
	if (promises.length !== 0) {
		return Promise.all(promises);
	}
}

async function save(
	files: Array<FileItem | FolderItem>,
	changes: Array<unknown>,
	metaset: Array<unknown>,
	hooks: DirectoryTreeHooks
): Promise<unknown> {
	const promises: Array<Promise<unknown>> = [];
	for (const file of files) {
		if (file instanceof FolderItem) {
			promises.push(save(file.children, changes, metaset, hooks));
		} else if (FileItem.isDataFile(file)) {
			const meta = file.meta;
			if (changes.includes(meta)) {
				promises.push(hooks.file.saveFile(meta));
				metaset.push(meta);
			}
		}
	}
	if (promises.length !== 0) {
		return Promise.all(promises);
	}
}

async function copy(
	dirPath: string,
	dir: Array<FileItem | FolderItem>,
	suffix: string,
	existings: Record<string, boolean>,
	hooks: DirectoryTreeHooks
): Promise<unknown> {
	const promises: Array<Promise<unknown>> = [];
	for (const file of dir) {
		const name = hooks.file.filterGUID(file.name);
		const ext = Path.extname(name);
		const base = Path.basename(name, ext);
		let path = `${dirPath}/${base}${suffix}${ext}`;
		let existed = existings[path];
		existings[path] = true;
		promises.push(
			(existed ? Promise.resolve() : FSP.stat(path))
				.then((_stats: unknown) => {
					for (let i = 2; ; i++) {
						path = `${dirPath}/${base}${suffix} (${i})${ext}`;
						if (existings[path]) {
							continue;
						}
						existings[path] = true;
						if (!FS.existsSync(path)) {
							break;
						}
					}
				}, fnEmpty)
				.finally(() => {
					const children = (file as FolderItem).children;
					if (children) {
						FS.mkdirSync(path);
						if (children.length !== 0) {
							return copy(path, children, suffix, existings, hooks);
						}
					} else {
						return FSP.copyFile(file.path, path);
					}
				})
		);
	}
	if (promises.length !== 0) {
		return Promise.all(promises);
	}
}

function sortSorter(a: FileItem | FolderItem, b: FileItem | FolderItem): number {
	if (a instanceof FileItem) {
		if (b instanceof FileItem) {
			const r1 = a.basename.localeCompare(b.basename);
			if (r1 !== 0) return r1;
			const r2 = a.extname.localeCompare(b.extname);
			if (r2 !== 0) return r2;
			const am = a.meta;
			const bm = b.meta;
			if (am !== null && bm !== null) {
				return am.guid.localeCompare(bm.guid);
			}
			return 0;
		} else {
			return 1;
		}
	} else {
		if (b instanceof FileItem) {
			return -1;
		} else {
			return a.name.localeCompare(b.name);
		}
	}
}

function registerInoMap(map: Record<string, unknown>, item: FileItem | FolderItem): void {
	// 对象键运行期本来就是字符串：`String()` 与原来的隐式转换逐字同键（bigint 也一样）
	map[String(item.stats!.ino!)] = item;
	if (item instanceof FolderItem) {
		const children = item.children;
		const length = children.length;
		for (let i = 0; i < length; i++) {
			registerInoMap(map, children[i]);
		}
	}
}

let directoryTree: DirectoryTree | null = null;

export function registerDirectoryTree(tree: DirectoryTree): DirectoryTree {
	directoryTree = tree;
	return tree;
}

export function getDirectoryTree(): DirectoryTree | null {
	return directoryTree;
}
