import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import {
	addClass,
	clear,
	getFocus,
	off,
	on,
	read,
	removeClass,
	write
} from '@/util/element-utils.ts';
import { Attribute } from '@/attribute/attribute-window.ts';
import { Codec } from '@/codec/codec.ts';
import { CommandList } from '@/components/command-list.ts';
import { Data } from '@/data/data-object.ts';
import { Project } from '@/data/project-settings-window.ts';
import { Enum } from '@/enum/enum-window.ts';
import { Localization } from '@/local/local-window.ts';
import { UpdateLog } from '@/log/update-log-window.ts';
import { Editor } from '@/main/editor.ts';
import { EditDataInstance } from './editdata.ts';
import { EventBus } from './eventbus.ts';
import { Resources } from './resource.ts';
import { SettingConfig } from './settingconfig';
import { AutoTile } from '@/palette/auto-tile.ts';
import { Scene } from '@/scene/scene-window.ts';
import { NewProject } from '@/title/new-project-window.ts';
import { Title } from '@/title/title-bar.ts';
import { Local } from '@/tools/localization.ts';
import OriginPackmeta from './packmeta.json';
import { UI } from '@/ui/ui-window.ts';
import { Updater } from '@/update/updater.ts';
import { Variable } from '@/variable/variable.ts';
import { getGlobalClipboard } from '@/types/global-clipboard.ts';
import { shell } from 'electron';
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

const Clipboard = getGlobalClipboard();

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
		alert(Local.get!('confirmation.resource-not-found'));
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
						Codec.decodeTilemap(copy);
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
				if (Localization.idMap[copy.id]) {
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
		originAutoTileTemplateUpdate.call(this);
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
		for (let i = 0; i < data.length; i++) {
			const item = data[i];
			const count = countMap[item.id] || 0;
			item.element.querySelector('.autoTile-count')?.remove();
			const countElem = document.createElement('span');
			countElem.className = 'autoTile-count';
			countElem.style.cssText =
				'color: var(--team-relation-mark-color-friend);padding:4px 2px;margin-left: 4px;';
			countElem.textContent = count as unknown as string;
			item.element.append(countElem);
		}
	};
});

UpdateLog.currentMode = 'internal';
UpdateLog.internalItems = [];
UpdateLog.communityItems = [];

export const UpdateLogInitializeOrigin = UpdateLog.initialize;
window.addEventListener('localize', () => {
	const tabInternal = $('#update-log-tab-internal');
	const tabCommunity = $('#update-log-tab-community');
	const tabDonation = $('#update-log-tab-donation');
	if (tabInternal) tabInternal.innerHTML = Local.get!('menuOpenYami.update-log-tab-internal');
	if (tabCommunity)
		tabCommunity.textContent = Local.get!('menuOpenYami.update-log-tab-community');
	if (tabDonation) tabDonation.textContent = Local.get!('menuOpenYami.update-log-tab-donation');
});
UpdateLog.initialize = function (this: typeof UpdateLog) {
	UpdateLogInitializeOrigin!.call(this);

	const tabsContainer = $('#update-log-tabs');
	if (tabsContainer) {
		tabsContainer.addEventListener('click', (event: MouseEvent) => {
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
		});
	}
};

export const UpdateLogOpenOrigin = UpdateLog.open;
UpdateLog.open = function (this: typeof UpdateLog, ...args: unknown[]) {
	const items = args[0] as unknown[] | null;
	if (items instanceof Array) {
		Window.open!('update-log');
		this.internalItems = items;
		this.currentMode = 'internal';
		this.update?.(items);
		this.loadCommunityReleases?.();
	} else {
		UpdateLogOpenOrigin!.call(this);
	}
};

export function markndownToHtml(markdown: string) {
	var md = new MarkdownIt();
	return md.render(markdown);
}

export const UpdateLogUpdateOrigin = UpdateLog.update;
UpdateLog.update = function (this: typeof UpdateLog, ...args: unknown[]) {
	const items = args[0] as unknown[];
	if (this.currentMode === 'internal') {
		UpdateLogUpdateOrigin!.call(this, items);
	} else {
		if (!this.content) {
			this.content = $('#update-log-content');
		}
		clear(this.content);
		const communityItems = this.communityItems!;

		for (const item of communityItems) {
			if (item.title) {
				const title = document.createElement('div');
				title.innerHTML = markndownToHtml(item.title);
				addClass(title, 'update-log-title');
				addClass(title, 'text');
				this.content.appendChild(title);
			}
			if (item.major) {
				const major = document.createElement('div');
				major.innerHTML = markndownToHtml(item.major);
				addClass(major, 'update-log-major');
				addClass(major, 'text');
				this.content.appendChild(major);
			}
			if (item.minor) {
				const minor = document.createElement('div');
				minor.innerHTML = markndownToHtml(item.minor);
				addClass(minor, 'update-log-minor');
				addClass(minor, 'text');
				this.content.appendChild(minor);
			}
		}
	}
};

UpdateLog.switchMode = function (this: typeof UpdateLog, mode: any) {
	if (mode === this.currentMode) return;
	this.currentMode = mode;

	if (mode === 'internal') {
		this.update?.(this.internalItems);
	} else if (mode === 'community') {
		this.update?.(undefined);
	} else if (mode === 'donation') {
		this.displayDonationList?.();
	}

	const tabInternal = $('#update-log-tab-internal');
	const tabCommunity = $('#update-log-tab-community');
	const tabDonation = $('#update-log-tab-donation');

	if (mode === 'internal') {
		if (tabInternal) addClass(tabInternal, 'active');
		if (tabCommunity) removeClass(tabCommunity, 'active');
		if (tabDonation) removeClass(tabDonation, 'active');
	} else if (mode === 'community') {
		if (tabInternal) removeClass(tabInternal, 'active');
		if (tabCommunity) addClass(tabCommunity, 'active');
		if (tabDonation) removeClass(tabDonation, 'active');
	} else if (mode === 'donation') {
		if (tabInternal) removeClass(tabInternal, 'active');
		if (tabCommunity) removeClass(tabCommunity, 'active');
		if (tabDonation) addClass(tabDonation, 'active');
	}
};

UpdateLog.loadCommunityReleases = async function (this: typeof UpdateLog) {
	try {
		const response = await fetch(
			'https://api.github.com/repos/Open-Yami-Community/yami-rpg-editor/releases'
		);
		if (!response.ok) throw new Error('Failed to fetch releases');
		const releases = await response.json();
		this.communityItems = this.parseCommunityReleases?.(releases) as any[];
	} catch (error) {
		console.error('Failed to load community releases:', error);
		this.communityItems = [
			{
				title: 'Error',
				major: 'Failed to load community releases from GitHub'
			}
		];
	}
};

UpdateLog.displayDonationList = function (this: typeof UpdateLog) {
	clear(this.content);
	const donationData = [
		{
			name: '刀里个刀(420488038)',
			amount: 200,
			link: 'tencent://message/?uin=420488038&Site=qq&Menu=yes'
		},
		{
			name: 'ya(332685057)',
			amount: 100,
			link: 'tencent://message/?uin=332685057&Site=qq&Menu=yes'
		}
	];

	const donationTitle = document.createElement('div');
	donationTitle.innerHTML = '<b>感谢以下捐赠者对项目的支持！</b>';
	addClass(donationTitle, 'update-log-title');
	addClass(donationTitle, 'text');
	this.content.appendChild(donationTitle);

	const donationList = document.createElement('div');
	addClass(donationList, 'box');
	addClass(donationList, 'donation-list');

	for (const donor of donationData) {
		const donorItem = document.createElement('div');
		addClass(donorItem, 'text');
		const link = document.createElement('a');
		link.href = '#';
		link.textContent = donor.name;
		link.addEventListener('click', (e) => {
			e.preventDefault();
			shell.openExternal(donor.link);
		});
		donorItem.appendChild(link);
		donorItem.append(`: ￥${donor.amount.toFixed(2)}`);
		addClass(donorItem, 'donation-item');
		donationList.appendChild(donorItem);
	}

	this.content.appendChild(donationList);
};

UpdateLog.parseCommunityReleases = function (this: typeof UpdateLog, ...args: unknown[]) {
	const releases = args[0] as Array<{ name?: string; body?: string }>;
	const items = [];
	for (const release of releases) {
		items.push({
			title: release.name,
			major: release.body || 'No description provided'
		});
	}
	return items;
};

export const UpdateLogWindowClosedOrigin = UpdateLog.windowClosed;

UpdateLog.windowClosed = function (this: typeof UpdateLog) {
	UpdateLogWindowClosedOrigin!.call(this);
	UpdateLog.internalItems = [];
	UpdateLog.communityItems = [];
	UpdateLog.currentMode = 'internal';
};

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
