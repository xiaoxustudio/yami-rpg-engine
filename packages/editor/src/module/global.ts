import { $ } from '@app/utils/dom';
import { Window } from '@app/tools/window-object.ts';
import { getFocus, off, on, read, write } from '@app/utils/element-utils.ts';
import { Attribute } from '@app/attribute/attribute-window.ts';
import { Codec } from '@app/engine/codec/codec.ts';
import { CommandList } from '@app/components/command-list.ts';
import { Data } from '@app/data/data-object.ts';
import { Project } from '@app/data/project-settings-window.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { Localization } from '@app/local/local-window.ts';
import { UpdateLog, type UpdateLogItem } from '@app/log/update-log-window.ts';
import { Editor } from '@app/services/project/editor.ts';
import { EditDataInstance } from './editdata.ts';
import { EventBus } from '@app/utils/event-bus.ts';
import { Resources } from './resource.ts';
import { SettingConfig } from '@app/services/project/settingconfig';
import { AutoTile } from '@app/palette/auto-tile.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { NewProject } from '@app/title/new-project-window.ts';
import { Title } from '@app/title/title-bar.ts';
import { t } from '@app/i18n';
import OriginPackmeta from './packmeta.json';
import { UI } from '@app/ui/ui-window.ts';
import { Updater } from '@app/services/updater/updater.ts';
import { Variable } from '@app/variable/variable.ts';
import { GlobalClipboard } from '@app/utils/clipboard';
import Path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import fsExtra from 'fs-extra';
import nodeYauzl from 'yauzl';
import MarkdownIt from 'markdown-it';

const GlobalPath =
	typeof Path.resolve === 'function' ? Path.resolve(os.homedir?.() ?? '', '.openyami') : '';
const moduleUrl = new URL(import.meta.url);
const moduleDir = moduleUrl.protocol === 'file:' ? Path.dirname(fileURLToPath(moduleUrl)) : './';

const fs = fsExtra;
const yauzl = nodeYauzl;

const Clipboard = GlobalClipboard;

export { yauzl, fs, GlobalPath };

export const CommunityVersion = '26072501';

EventBus.once('editor_loaded', () => {
	const checkForProjectUpdatesOrigin = Editor.checkForProjectUpdates;
	Editor.checkForProjectUpdates = function (this: typeof Editor, verNum: unknown) {
		checkForProjectUpdatesOrigin!.call(this, verNum);
		if (!Data.config.deadzone) {
			Data.config.deadzone = 0.4;
			Project.changed = true;
		}
	};
});

const packmetaPath = () => {
	return Path.join(moduleDir, 'packmeta.json');
};

export let PackMeta: Record<string, string> = OriginPackmeta;
export const TemplatesPath =
	typeof Path.resolve === 'function' ? Path.resolve(GlobalPath, 'Templates') : '';
if (typeof fs.existsSync === 'function' && !fs.existsSync(TemplatesPath))
	fs.mkdirSync(TemplatesPath, { recursive: true });

export function isNoResource() {
	const bak = JSON.parse(JSON.stringify(PackMeta));
	delete bak['Editor'];
	delete bak['Project'];
	delete bak['Community'];
	const p = {} as Record<string, { check: boolean }> & { '@': boolean };
	Object.defineProperty(p, '@', {
		value: false,
		enumerable: false,
		writable: true
	});
	try {
		const checkArr: boolean[] = [];
		Object.keys(bak).map((v) => {
			p[v] ??= {} as { check: boolean };
			p[v]['check'] = false;
			const _path = Path.resolve(TemplatesPath, v) ?? '';
			if (fs.existsSync(_path)) {
				p[v]['check'] = true;
				checkArr.push(true);
			} else {
				checkArr.push(false);
			}
		});
		if (checkArr.every((v) => v)) p['@'] = true;
		return p;
	} catch {
		return p;
	}
}

export let NoResourceObj = isNoResource();

export function setPackMeta(value: Record<string, string>) {
	PackMeta = value;
}
export function setNoResourceObj(value: Record<string, { check: boolean }> & { '@': boolean }) {
	NoResourceObj = value;
}

window.addEventListener('localize', () => {
	void Resources.initialize();
	if (!NoResourceObj['arpg-ts-english']?.check && !NoResourceObj['arpg-ts-chinese']?.check) {
		void Resources.open();
		void Resources.checkEditorVersion();
	}
	if (SettingConfig.config?.update?.checkOnStart !== false) {
		void Resources.checkVersion();
		void Resources.checkEditorVersion();
	}
	Resources.loaded = true;
});

const newProjectConfirm = $('#newProject-confirm');
if (newProjectConfirm) off(newProjectConfirm, 'click', NewProject.confirm!);
export const TitleConfirmOld = NewProject.confirm;
NewProject.confirm = function () {
	const template = read($('#newProject-template'));
	NoResourceObj = isNoResource();
	if (
		(template == 'arpg-ts-english' && NoResourceObj['arpg-ts-english'].check) ||
		(template == 'arpg-ts-chinese' && NoResourceObj['arpg-ts-chinese'].check) ||
		template != (['arpg-ts-english', 'arpg-ts-chinese'] as unknown as string)
	) {
		TitleConfirmOld!.call(Title);
	} else {
		alert(t('confirmation.resource-not-found'));
	}
};
if (newProjectConfirm) off(newProjectConfirm, 'click', NewProject.confirm);

type ZipEntryShape = { fileName: string };
type ZipFileShape = {
	readEntry(): void;
	on(event: 'entry', listener: (entry: ZipEntryShape) => void): void;
	on(event: 'end' | 'error', listener: (err: unknown) => void): void;
	openReadStream(
		entry: ZipEntryShape,
		callback: (err: unknown, readStream: NodeJS.ReadableStream) => void
	): void;
};

export const unzipWithProgress = async ({
	zipPath,
	outputDir,
	onProgress
}: {
	zipPath: string;
	outputDir: string;
	onProgress: (progress: number) => void;
}) => {
	return new Promise((resolve, reject) => {
		let totalFiles = 0;
		let extractedFiles = 0;

		yauzl.open(zipPath, { lazyEntries: true }, (err: unknown, zipfile: ZipFileShape) => {
			if (err) return reject(err);
			zipfile.on('entry', () => {
				totalFiles++;
			});
			zipfile.readEntry();
			zipfile.on('entry', (entry: ZipEntryShape) => {
				const destPath = Path.join(outputDir, entry.fileName);

				if (entry.fileName.endsWith('/')) {
					fs.ensureDirSync(destPath);
					zipfile.readEntry();
					return;
				}

				fs.ensureDirSync(Path.dirname(destPath));

				zipfile.openReadStream(entry, (err: unknown, readStream: NodeJS.ReadableStream) => {
					if (err) return reject(err);

					const writeStream = fs.createWriteStream(destPath);
					readStream.pipe(writeStream);

					writeStream.on('close', () => {
						extractedFiles++;
						const progress = Math.round((extractedFiles / totalFiles) * 100);
						onProgress?.(progress);

						zipfile.readEntry();
					});
				});
			});

			zipfile.on('end', () => {
				resolve('解压完成');
			});

			zipfile.on('error', (err: unknown) => {
				reject(err);
			});
		});
	});
};

EventBus.once('editor_loaded', () => {
	CommandList.prototype.openEdit = function (this: HTMLElement) {
		Window.open!('edit-data');
		void EditDataInstance.open(this);
	};
});

interface SelectionItem {
	class?: string;
	parent?: SelectionItem;
	element?: { nextSibling?: { item?: SelectionItem } } & HTMLElement;
}

export function find_dItem(
	this: unknown,
	fn: (dItem?: SelectionItem, insertBefore?: boolean) => unknown
) {
	const self = this as { selections?: SelectionItem[] };
	var list = self.selections || [];
	var cur = list[list.length - 1];
	var next = cur?.element?.nextSibling?.item;
	var insertBefore = false;

	if (!cur) {
		return fn();
	}
	if (cur.class == 'folder') {
		return fn(cur);
	}
	if (!next) {
		if (cur.parent?.class == 'folder') {
			return fn(cur.parent);
		}
		return fn();
	}

	if (next.parent == cur.parent) {
		if (next.class == 'folder') {
			insertBefore = true;
		}
		return fn(next, insertBefore);
	} else {
		return fn(cur.parent);
	}
}

// 列表 - 粘贴（延迟到应用加载完成，避免循环依赖 TDZ）
EventBus.once('editor_loaded', () => {
	if (Scene.list)
		Scene.list.paste = function (
			this: HTMLElement & {
				data?: unknown;
				addNodeTo: (copy: unknown, dItem: unknown, insertBefore?: boolean) => void;
			},
			dItem: unknown,
			callback: ((copy: unknown) => void) | undefined
		) {
			const copy = Clipboard.read('yami.scene.object');
			if (copy && this.data) {
				switch (copy.class) {
					case 'tilemap':
						Codec.decodeTilemap!(copy);
						copy.shortcut = 0;
						break;
				}

				var insertBefore = false;
				if (dItem === 'auto') {
					find_dItem.call(this, (a: unknown, b: boolean | undefined) => {
						dItem = a;
						insertBefore = b as boolean;
					});
				}
				callback?.(copy);
				this.addNodeTo(copy, dItem, insertBefore);
				Scene.requestRendering();
			}
		};

	if (Enum.list)
		Enum.list.paste = function (
			this: HTMLElement & {
				addNodeTo: (copy: unknown, dItem?: unknown, insertBefore?: boolean) => void;
			}
		) {
			const copy = Clipboard.read('yami.data.enumeration');
			if (copy) {
				if (Enum.idMap![copy.id]) {
					copy.id = Enum.createId!();
					//如果需要去掉后面的 -copy，把下面这行注释就好了
					copy.name += ' - Copy';
				}

				find_dItem.call(this, (a: unknown, b: boolean | undefined) => {
					this.addNodeTo(copy, a, b);
				});
			}
		};

	if (Variable.list)
		Variable.list.paste = function (
			this: HTMLElement & {
				addNodeTo: (copy: unknown, dItem?: unknown, insertBefore?: boolean) => void;
			}
		) {
			const copy = Clipboard.read('yami.data.variable');
			if (copy) {
				if (Variable.idMap[copy.id]) {
					copy.id = Variable.createId();
					//如果需要去掉后面的 -copy，把下面这行注释就好了
					copy.name += ' - Copy';
				}

				find_dItem.call(this, (a: unknown, b: boolean | undefined) => {
					this.addNodeTo(copy, a, b);
				});
			}
		};

	if (Attribute.list)
		Attribute.list!.paste = function (
			this: HTMLElement & {
				addNodeTo: (copy: unknown, dItem?: unknown, insertBefore?: boolean) => void;
			}
		) {
			const copy = Clipboard.read('yami.data.attribute');
			if (copy) {
				if (Attribute.idMap![copy.id]) {
					copy.id = Attribute.createId!();
					//如果需要去掉后面的 -copy，把下面这行注释就好了
					copy.name += ' - Copy';
				}

				find_dItem.call(this, (a: unknown, b: boolean | undefined) => {
					this.addNodeTo(copy, a, b);
				});
			}
		};

	if (Localization.list)
		Localization.list!.paste = function (
			this: HTMLElement & {
				addNodeTo: (copy: unknown, dItem?: unknown, insertBefore?: boolean) => void;
			}
		) {
			const copy = Clipboard.read('yami.data.localization');
			if (copy) {
				if (Localization.idMap![copy.id]) {
					copy.id = Localization.createId();
					//如果需要去掉后面的 -copy，把下面这行注释就好了
					copy.name += ' - Copy';
				}
				find_dItem.call(this, (a: unknown, b: boolean | undefined) => {
					this.addNodeTo(copy, a, b);
				});
			}
		};

	if (UI.list)
		UI.list.paste = function (
			this: HTMLElement & {
				data?: unknown;
				addNodeTo: (copy: unknown, dItem?: unknown) => void;
			},
			_: unknown,
			callback: ((copy: unknown) => void) | undefined
		) {
			const copy = Clipboard.read('yami.ui.object');
			if (copy && this.data) {
				callback?.(copy);
				this.addNodeTo(copy, UI.target);
				UI.requestRendering();
			}
		};
});

export let homeElem: HTMLElement | null = null;

window.addEventListener(
	'vue-app-mounted',
	() => {
		homeElem = $('#home-version');
		if (homeElem) {
			homeElem.textContent = `当前社区版本：${CommunityVersion} 当前编辑器版本：${Updater.latestEditorVersion} 
当前项目版本：${Updater.latestProjectVersion}`;
		}
	},
	{ once: true }
);
(() => {
	PackMeta['Editor'] = Updater.latestEditorVersion;
	PackMeta['Project'] = Updater.latestProjectVersion;
	PackMeta['Community'] = CommunityVersion;
	fs.writeFileSync(packmetaPath(), JSON.stringify(PackMeta));
})();

EventBus.once('editor_loaded', () => {
	if (!AutoTile.templateList) return;
	const originAutoTileTemplateUpdate = AutoTile.templateList.update;
	AutoTile.templateList.update = function (this: HTMLElement) {
		const autoList = Object.keys(Data.tilesets)
			.map((v) => Data.tilesets[v])
			.filter((v) => v.type === 'auto');
		const countMap: Record<string, number> = {};
		const data = this.data;
		for (let i = 0; i < autoList.length; i++) {
			const tiles = autoList[i].tiles;
			for (let j = 0; j < tiles.length; j++) {
				const tile = tiles[j];

				if (typeof tile !== 'object') continue;
				const template = tile.template;
				if (!countMap[template]) countMap[template] = 0;
				countMap[template]++;
				break;
			}
		}
		AutoTile.templateCounts = countMap;
		originAutoTileTemplateUpdate.call(this);
	};
});

export function initializeUpdateLog(): void {
	UpdateLog.tabsClick = function (this: typeof UpdateLog, event: MouseEvent) {
		const btn = (event.target as HTMLElement).closest?.('.update-log-tab');
		if (btn) {
			if (btn.id === 'update-log-tab-internal') {
				UpdateLog.switchMode?.('internal');
			} else if (btn.id === 'update-log-tab-community') {
				UpdateLog.switchMode?.('community');
			} else if (btn.id === 'update-log-tab-donation') {
				UpdateLog.switchMode?.('donation');
			}
		}
	} as (...args: unknown[]) => unknown;

	const origin = UpdateLog.open;
	UpdateLog.open = function (this: typeof UpdateLog, ...args: unknown[]) {
		const items = args[0] as unknown[] | null;
		if (items instanceof Array) {
			Window.open!('update-log');
			this.internalItems = items as UpdateLogItem[];
			this.currentMode = 'internal';
			this.update?.(items);
			this.loadCommunityReleases?.();
		} else {
			origin!.call(this);
		}
	};

	UpdateLog.switchMode = function (
		this: typeof UpdateLog,
		mode: 'internal' | 'community' | 'donation'
	) {
		if (mode === this.currentMode) return;
		this.currentMode = mode;
		UpdateLog.publish?.();
	} as (...args: unknown[]) => unknown;

	UpdateLog.loadCommunityReleases = async function (this: typeof UpdateLog) {
		try {
			const response = await fetch(
				'https://api.github.com/repos/Open-Yami-Community/yami-rpg-editor/releases/latest'
			);
			if (!response.ok) throw new Error('Failed to fetch releases');
			const releases = await response.json();
			this.communityItems = this.parseCommunityReleases?.(releases) as UpdateLogItem[];
		} catch (error) {
			console.error('Failed to load community releases:', error);
			this.communityItems = [
				{
					title: 'Error',
					major: 'Failed to load community releases from GitHub'
				}
			];
		}
		UpdateLog.publish?.();
	};

	UpdateLog.displayDonationList = function (this: typeof UpdateLog) {
		UpdateLog.publish?.();
	};

	UpdateLog.parseCommunityReleases = function (this: typeof UpdateLog, _r: unknown) {
		const release = _r as {
			name?: string;
			body?: string;
			draft?: boolean;
			prerelease?: boolean;
		};
		return release
			? [{ title: release.name, major: release.body || 'No description provided' }]
			: [];
	};
}

export function markndownToHtml(markdown: string) {
	const clean = markdown.replace(/<!--[\s\S]*?-->/g, '');
	var md = new MarkdownIt({ html: false, linkify: true, breaks: true });
	return md.render(clean);
}

/* 设置图块标签 */
export const SetTileTag: {
	callback: ((tag: unknown) => void) | null;
	initialize: (() => void) | null;
	open: ((tag: unknown, callback: (tag: unknown) => void) => void) | null;
	windowClosed: (() => void) | null;
	confirm: (() => void) | null;
} = {
	// properties
	callback: null,
	// methods
	initialize: null,
	open: null,
	// events
	windowClosed: null,
	confirm: null
};

SetTileTag.initialize = function () {
	if (!$('#setTileTag')) return;
	on($('#setTileTag'), 'closed', this.windowClosed!);
	on($('#setTileTag-confirm'), 'click', this.confirm!);
};

SetTileTag.open = function (tag: unknown, callback: (tag: unknown) => void) {
	this.callback = callback;
	Window.open!('setTileTag');
	write($('#setTileTag-tag'), tag);
	getFocus($('#setTileTag-tag'), 'all');
};

SetTileTag.windowClosed = function (this: typeof SetTileTag) {
	this.callback = null;
}.bind(SetTileTag);

SetTileTag.confirm = function (this: typeof SetTileTag) {
	this.callback!(read($('#setTileTag-tag')));
	Window.close!('setTileTag');
}.bind(SetTileTag);

export function loadDtsFolder(
	folderPath: string,
	monaco: typeof import('monaco-editor'),
	recursive = true
) {
	const disposables: unknown[] = [];
	const tsLang = monaco.languages.typescript as unknown as {
		javascriptDefaults: { addExtraLib: (content: string, filePath?: string) => unknown };
		typescriptDefaults: { addExtraLib: (content: string, filePath?: string) => unknown };
	};

	function walkDirectory(currentPath: string) {
		try {
			const files = fs.readdirSync(currentPath);

			files.forEach((file: string) => {
				const fullPath = Path.join(currentPath, file);

				const stat = fs.statSync(fullPath);

				if (stat.isDirectory()) {
					if (recursive) {
						walkDirectory(fullPath);
					}
				} else if (file.endsWith('.ts')) {
					try {
						const content = fs.readFileSync(fullPath, 'utf-8');

						const normalizedPath = fullPath.replace(/\\/g, '/');
						const fileUri = 'file://' + normalizedPath;

						disposables.push(tsLang.javascriptDefaults.addExtraLib(content, fileUri));
						disposables.push(tsLang.typescriptDefaults.addExtraLib(content, fileUri));
					} catch (readErr) {
						console.error(`Failed to read file: ${fullPath}`, readErr);
					}
				}
			});
		} catch (err) {
			console.error(`Failed to read directory: ${currentPath}`, err);
		}
	}

	walkDirectory(folderPath);

	return disposables;
}
