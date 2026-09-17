import { Path } from '@app/utils/config';
import { FSP } from '@app/services/file-system/fs-bridge.ts';
import { GUID } from '@app/services/file-system/guid.ts';
import { append } from '@app/utils/array';

export interface FileMetaLike {
	guid: string;
	path: string;
	versionId: number;
	mtimeMs: number | null;
	dataMap: Record<string, unknown> | null;
	redirect(file: FileItem): boolean;
}

export interface FileItemHooks {
	path: (relativePath: string) => string;
	getVersionId: () => number;
	getMetaByGuid: (guid: string) => FileMetaLike | undefined;
	registerMeta: (file: FileItem, guid: string) => FileMetaLike | null;
	deleteMeta: (meta: FileMetaLike) => void;
	redirectMeta: (meta: FileMetaLike, file: FileItem) => boolean;
	onTextureLoad: (guid: string) => void;
	onLoadScript: (file: FileItem) => void;
}

export interface FileItemDisplayHooks {
	request: (callback: () => void) => void;
	localize: (key: string, named?: Record<string, unknown>) => string;
	confirm: (
		options: { message?: string; close?: () => void },
		items: Array<{ label?: string; click?: () => void }>
	) => void;
	maxTexSize: () => number;
}

let display: FileItemDisplayHooks | null = null;

export function configureFileItemDisplay(hooks: FileItemDisplayHooks): void {
	display = hooks;
}

export class FileItem {
	meta: FileMetaLike | null;
	name: string;
	alias: string;
	aliasPath: string;
	basename: string;
	extname: string;
	path: string;
	type: string;
	stats: { isDirectory(): boolean; ino?: string | number; mtimeMs?: number } | null;
	// oxlint-disable-next-line no-explicit-any
	promise?: Promise<any> | null;
	contexts: Map<string, unknown> | null;

	private hooks: FileItemHooks;

	constructor(
		name: string,
		extname: string,
		path: string,
		type: string,
		stats: { isDirectory(): boolean; ino?: string | number; mtimeMs?: number },
		hooks: FileItemHooks
	) {
		let basename = Path.basename(name, extname);
		const match = basename.match(FileItem.guidRegExp);
		if (match) basename = basename.slice(0, match.index! - 1);
		this.meta = null;
		this.name = name;
		this.alias = basename + extname;
		this.aliasPath = Path.dirname(path) + '/' + this.alias;
		this.basename = basename;
		this.extname = extname;
		this.path = path;
		this.type = type;
		this.stats = stats;
		this.contexts = null;
		this.hooks = hooks;

		this.createMeta(match?.[0]);

		switch (type) {
			case 'image':
				hooks.onTextureLoad(this.meta!.guid);
				break;
			case 'script':
				hooks.onLoadScript(this);
				break;
		}
	}

	get data() {
		const { meta } = this;
		const { guid } = meta!;
		if (this.hooks.getMetaByGuid(guid) === meta) {
			return meta!.dataMap?.[guid];
		}
		return undefined;
	}

	createMeta(guid: string | undefined) {
		const stats = this.stats!;
		// 如果GUID不存在或冲突则新建GUID 如果GUID重复则不要修改避免丢失
		if (guid === undefined) {
			do {
				guid = GUID.generate64bit();
			} while (this.hooks.getMetaByGuid(guid));
			this.updateFileName(guid);
		} else {
			const meta = this.hooks.getMetaByGuid(guid);
			// 如果存在元数据并且并未被使用，则重定向或删除该元数据 如果存在元数据并且已经被使用，则文件GUID冲突
			if (meta && meta.versionId !== this.hooks.getVersionId()) {
				if (this.hooks.redirectMeta(meta, this)) {
					this.meta = meta;
					this.updateFileName(guid);
					return;
				}
				this.hooks.deleteMeta(meta);
			} else if (meta) {
				FileItem.addGuidConflictPaths(meta.path, this.path + '(已隐藏)');
				throw new Error(`GUID already exists: ${guid}`);
			}
		}
		this.meta = this.hooks.registerMeta(this, guid);
		if (this.meta !== null) {
			this.meta.mtimeMs = stats.mtimeMs ?? null;
		}
	}

	updateFileName(guid: string) {
		const basename = this.basename;
		const extname = this.extname;
		// 如果代码被修改可能导致批量的错误命名结果 因此进行文件名组成部分类型检查
		if (
			typeof guid !== 'string' ||
			typeof basename !== 'string' ||
			typeof extname !== 'string'
		) {
			throw new Error('Failed to update File Name');
		}
		const name = `${basename}.${guid}${extname}`;
		if (this.name !== name) {
			const dir = Path.dirname(this.path);
			const path = `${dir}/${name}`;
			const sPath = this.hooks.path(this.path);
			const dPath = this.hooks.path(path);
			const promise = this.promise ?? Promise.resolve();
			this.promise = promise.then(() => {
				return FSP.rename(sPath, dPath).then(() => {
					this.name = name;
					this.path = path;
					if (this.meta !== null) {
						this.hooks.redirectMeta(this.meta, this);
					}
				});
			});
		}
	}

	getContext(key: string) {
		let contexts = this.contexts;
		if (contexts === null) {
			contexts = this.contexts = new Map();
		}
		let context = contexts.get(key);
		if (context === undefined) {
			contexts.set(key, (context = {}));
		}
		return context;
	}

	static dataMapNames = {
		actor: 'actors',
		skill: 'skills',
		trigger: 'triggers',
		item: 'items',
		equipment: 'equipments',
		state: 'states',
		event: 'events',
		scene: 'scenes',
		tileset: 'tilesets',
		ui: 'ui',
		animation: 'animations',
		particle: 'particles',
		script: 'scripts'
	};

	static guidRegExp = /(?<=\.)[0-9a-f]{16}$/;

	static guidConflictPaths: string[] = [];
	static oversizeImagePaths: string[] = [];

	static isDataFile(file: { type: string }) {
		return (FileItem.dataMapNames as Record<string, string>)[file.type] !== undefined;
	}

	static addGuidConflictPaths(...paths: string[]) {
		for (const path of paths) {
			append(this.guidConflictPaths, path);
		}
		// oxlint-disable-next-line unbound-method
		display?.request(this.warnGuidConflicts);
	}

	static warnGuidConflicts() {
		const hooks = display;
		if (hooks === null) {
			FileItem.guidConflictPaths.length = 0;
			return;
		}
		const warnings = [hooks.localize('confirmation.guidConflict')];
		hooks.confirm(
			{
				message: warnings.concat(FileItem.guidConflictPaths).join('\n')
			},
			[
				{
					label: 'Confirm'
				}
			]
		);
		FileItem.guidConflictPaths.length = 0;
	}

	static addOversizeImagePaths(...paths: string[]) {
		for (const path of paths) {
			append(this.oversizeImagePaths, path);
		}
		// oxlint-disable-next-line unbound-method
		display?.request(this.warnOversizeImages);
	}

	static warnOversizeImages() {
		const hooks = display;
		if (hooks === null) {
			FileItem.oversizeImagePaths.length = 0;
			return;
		}
		const warnings = [
			hooks.localize('confirmation.oversizeImage', {
				size: hooks.maxTexSize().toString()
			})
		];
		hooks.confirm(
			{
				message: warnings.concat(FileItem.oversizeImagePaths).join('\n')
			},
			[
				{
					label: 'Confirm'
				}
			]
		);
		FileItem.oversizeImagePaths.length = 0;
	}
}

interface FolderUpdateContext {
	changed: boolean;
	promises: Promise<unknown>[];
}

interface FolderContext {
	expanded: boolean;
}

export class FolderItem {
	name: string;
	path: string;
	stats: { isDirectory(): boolean; ino?: string | number; mtimeMs?: number } | null;
	parent: FolderItem | null;
	children: FileItem[];
	subfolders: FolderItem[];
	contexts: Map<string, FolderContext> | null;

	private hooks: FileItemHooks;

	constructor(name: string, path: string, parent: FolderItem | null, hooks: FileItemHooks) {
		this.name = name;
		this.path = path;
		this.stats = null;
		this.parent = parent;
		this.children = [] as unknown as FileItem[];
		this.subfolders = [] as unknown as FolderItem[];
		this.contexts = null;
		this.hooks = hooks;
	}

	getContext(key: string): FolderContext {
		let contexts = this.contexts;
		if (contexts === null) {
			contexts = this.contexts = new Map();
		}
		let context = contexts.get(key);
		if (context === undefined) {
			contexts.set(
				key,
				(context = {
					expanded: false
				})
			);
		}
		return context;
	}

	async update(context: FolderUpdateContext = { changed: false, promises: [] }) {
		const bigint = FolderItem.bigint;
		const path = this.hooks.path(this.path);
		const pStat = FSP.stat(path, bigint);
		const pReaddir = this.readdir(context);
		const stats = await pStat;
		if (this.stats?.mtimeMs !== stats.mtimeMs) {
			context.changed = true;
		}
		this.stats = stats;
		await pReaddir;
		return context;
	}

	async readdir(context: FolderUpdateContext) {
		const map: Record<string, FileItem | FolderItem> = {};
		const nodes = this.children;
		if (nodes instanceof Array) {
			const length = nodes.length;
			for (let i = 0; i < length; i++) {
				const item = nodes[i];
				map[item.path] = item;
			}
		}

		const dir = this.path;
		const path = this.hooks.path(dir);
		const files = await FSP.readdir(path, { withFileTypes: true });
		const length = files.length;
		type StatPromise = Promise<unknown> & { path?: string };
		const promises = Array.from<StatPromise>({ length: length });
		const children = [];
		const subfolders = [];
		const bigint = FolderItem.bigint;
		for (let i = 0; i < length; i++) {
			const file = files[i];
			const name = file.name;
			const path = `${dir}/${name}`;
			if (file.isDirectory()) {
				let item = map[path];
				if (!(item instanceof FolderItem)) {
					item = new FolderItem(name, path, this, this.hooks);
					context.changed = true;
				}
				promises[i] = item.update(context);
				children.push(item);
				subfolders.push(item);
			} else {
				// 跳过MacOS隐藏文件
				if (name === '.DS_Store') {
					continue;
				}
				const promise = FSP.stat(this.hooks.path(path), bigint);
				promise.path = path;
				promises[i] = promise;
			}
		}

		const { extnameToTypeMap } = FolderItem;
		for (let i = 0; i < length; i++) {
			const promise = promises[i];
			// oxlint-disable-next-line no-await-in-loop
			const response = await promise;
			if (promise?.path === undefined) {
				continue;
			}
			const path = promise.path;
			const stats = response as {
				isDirectory(): boolean;
				ino?: string | number;
				mtimeMs?: number;
			};
			let item = map[path];
			if (item === undefined || item.stats?.mtimeMs !== stats.mtimeMs) {
				const name = files[i].name;
				const extname = Path.extname(name);
				const type =
					(extnameToTypeMap as Record<string, string>)[extname.toLowerCase()] ?? 'other';
				try {
					item = new FileItem(name, extname, path, type, stats, this.hooks);
					const promise = (item as FileItem).promise;
					if (promise instanceof Promise) {
						context.promises.push(
							promise.finally(() => {
								delete (item as FileItem).promise;
							})
						);
					}
				} catch (error: unknown) {
					console.warn(error);
					continue;
				}
			}
			if ((item as FileItem).meta!.versionId !== this.hooks.getVersionId()) {
				(item as FileItem).meta!.versionId = this.hooks.getVersionId();
				children.push(item);
				context.changed = true;
			}
		}
		this.children = children as FileItem[];
		this.subfolders = subfolders;
	}

	static extnameToTypeMap = {
		'.actor': 'actor',
		'.skill': 'skill',
		'.trigger': 'trigger',
		'.item': 'item',
		'.equip': 'equipment',
		'.state': 'state',
		'.event': 'event',
		'.scene': 'scene',
		'.tile': 'tileset',
		'.ui': 'ui',
		'.anim': 'animation',
		'.particle': 'particle',
		'.png': 'image',
		'.jpg': 'image',
		'.jpeg': 'image',
		'.cur': 'image',
		'.webp': 'image',
		'.mp3': 'audio',
		'.m4a': 'audio',
		'.ogg': 'audio',
		'.wav': 'audio',
		'.flac': 'audio',
		'.mp4': 'video',
		'.mkv': 'video',
		'.webm': 'video',
		'.js': 'script',
		'.ts': 'script',
		'.ttf': 'font',
		'.otf': 'font',
		'.woff': 'font',
		'.woff2': 'font'
	};

	static bigint = { bigint: true };

	static async create(path: string, hooks: FileItemHooks) {
		const name = Path.basename(path);
		const item = new FolderItem(name, path, null, hooks);
		return item;
	}
}
