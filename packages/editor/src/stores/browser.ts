import { defineStore } from 'pinia';
import { Editor } from '@app/legacy/main/editor.ts';
import { shallowRef } from 'vue';
import { getDirectoryTree } from '@app/services/file-system/directory-tree.ts';
import { FileItem, FolderItem } from '@app/services/file-system/file-item.ts';
import { File } from '@app/legacy/file/file-system-core.ts';
import { FSP } from '@app/services/file-system/fs-bridge.ts';
import { GUID } from '@app/services/file-system/guid.ts';
import { Data } from '@app/legacy/data/data-object.ts';
import { Path } from '@app/legacy/util/config.ts';
import { TemplatesPath } from '@app/legacy/module/global.ts';
import { Menu } from '@app/legacy/components/menu-list.ts';
import type { MenuItem } from '@ui-kit';
import { ctrl } from '@app/legacy/util/event-accessors.ts';
import { Title } from '@app/legacy/title/title-bar.ts';
import { EventEditor } from '@app/legacy/command/event-editor.ts';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { Reference } from '@app/legacy/log/related-references.ts';
import { showInExplorerCommand } from '@app/legacy/tools/platform.ts';
import { createGetter } from '@app/i18n';
import { $ } from '@app/legacy/util/dom.ts';
import { addClass, hasClass, removeClass, seek } from '@app/legacy/util/element-utils';
import { pinia } from './pinia';
import type { FileBrowserLinks } from '@app/legacy/types/file-browser-links.ts';
import { getGlobalClipboard } from '@app/legacy/types/global-clipboard.ts';
import child_process from 'node:child_process';

export interface FileBrowserBody {
	activeFile?: unknown;
	selections?: unknown[];
	copyFiles?(cut?: boolean): void;
	pasteFiles?(path?: string): void;
	deleteFiles?(): void;
	rename?(file?: unknown): void;
	importFiles?(): void;
	showInExplorer?(): void;
	openFileLocation?(file?: unknown): void;
	openFile?(file?: unknown): void;
	updateIcon?(meta?: unknown): void;
	computeGridProperties?(): void;
	resize?(): void;
	updateContentSize?(): void;
	on?(type: string, listener: (event: unknown) => void): void;
	content?: { getFocus?(): void };
}

export interface FileBrowserInstance {
	state?: string;
	directory?: string | null;
	page?: HTMLElement;
	searcher?: HTMLElement & { addKeydownFilter?(): void };
	head?: HTMLElement & { searcher?: HTMLElement };
	nav?: {
		resize?(): void;
		load?(...folders: unknown[]): void;
		setViewIndex?(index: number): void;
		update?(): void;
		getSelections?(): unknown[];
	};
	body?: FileBrowserBody & {
		setViewIndex?(index: number): void;
		unselect?(meta?: unknown): void;
		getDirName?(): string;
		select?(file?: unknown): void;
		viewIndex?: number;
	};
	links?: FileBrowserLinks;
	dragging?: unknown;
	initialize?(): void;
	close?(): void;
	open?(dir?: string): void;
	unselect?(meta?: unknown): void;
	openScript?(path?: string): void;
}

export const useBrowserStore = defineStore('browser', () => {
	const state = shallowRef<string>('closed');
	const directory = shallowRef<string | null>(null);
	const component = shallowRef<FileBrowserInstance | null>(null);

	function setComponent(instance: FileBrowserInstance | null) {
		component.value = instance;
	}

	function getBrowser(): FileBrowserInstance | null {
		return component.value;
	}

	function syncState() {
		const Browser = getBrowser();
		state.value = Browser?.state ?? 'closed';
		directory.value = Browser?.directory ?? null;
	}

	function pageResize(event: Event) {
		const Browser = getBrowser();
		if (!Browser?.body) return;
		updateNavVisibility();
		Browser.nav?.resize?.();
		Browser.body?.computeGridProperties?.();
		Browser.body?.resize?.();
		Browser.body?.updateContentSize?.();
	}

	function bodyKeydown(event: KeyboardEvent) {
		const Browser = getBrowser();
		if (!Browser) return;
		if (event.ctrlKey || event.metaKey) {
			switch (event.code) {
				case 'KeyX':
					Browser.body?.copyFiles?.(true);
					break;
				case 'KeyC':
					Browser.body?.copyFiles?.();
					break;
				case 'KeyV':
					Browser.body?.pasteFiles?.();
					break;
				default:
					return;
			}
			event.stopImmediatePropagation();
		}
	}

	function bodyOpen(event: Event & { value: FileItem }) {
		const Browser = getBrowser();
		if (!Browser) return;
		const file = event.value;
		switch (file.type) {
			case 'scene':
			case 'ui':
			case 'animation':
			case 'particle':
				Title.openTab?.(file);
				break;
			case 'event': {
				const item = file.data;
				if (item) {
					EventEditor.openGlobalEvent?.(file.meta.guid);
				}
				break;
			}
			case 'audio':
				Inspector.fileAudio?.play?.();
				break;
			case 'video':
				Inspector.fileVideo?.play?.();
				break;
			case 'script':
				openScript(file.path);
				break;
			case 'other':
				File.openPath?.(File.route?.(file.path));
				break;
		}
	}

	function bodySelect(event: Event & { value: FileItem[] }) {
		const Browser = getBrowser();
		if (!Browser) return;
		const files = event.value;
		if (files.length === 1 && files[0] instanceof FileItem) {
			const file = files[0];
			const meta = file.meta;
			const type = file.type;
			if (!meta) return;
			switch (type) {
				case 'tileset':
					Inspector.open?.('fileTileset', file.data, meta);
					break;
				case 'actor':
					Inspector.open?.('fileActor', file.data, meta);
					break;
				case 'skill':
					Inspector.open?.('fileSkill', file.data, meta);
					break;
				case 'trigger':
					Inspector.open?.('fileTrigger', file.data, meta);
					break;
				case 'item':
					Inspector.open?.('fileItem', file.data, meta);
					break;
				case 'equipment':
					Inspector.open?.('fileEquipment', file.data, meta);
					break;
				case 'state':
					Inspector.open?.('fileState', file.data, meta);
					break;
				case 'event':
					Inspector.open?.('fileEvent', file.data, meta);
					break;
				case 'image':
					Inspector.open?.('fileImage', file, meta);
					break;
				case 'audio':
					Inspector.open?.('fileAudio', file, meta);
					break;
				case 'video':
					Inspector.open?.('fileVideo', file, meta);
					break;
				case 'font':
					Inspector.open?.('fileFont', file, meta);
					break;
				case 'script':
					Inspector.open?.('fileScript', file, meta);
					break;
			}
		}
	}

	function bodyUnselect(event: Event & { value: FileItem[] }) {
		const Browser = getBrowser();
		if (!Browser) return;
		if (Inspector.meta !== null) {
			const meta = Inspector.meta;
			const files = event.value;
			if (files.length === 1 && files[0].path === meta.path) {
				Inspector.close?.();
			}
		}
	}

	function bodyPopup(
		event: Event & { raw: { target: unknown }; clientX: number; clientY: number }
	) {
		const Browser = getBrowser();
		if (!Browser) return;
		const Directory = getDirectoryTree();
		const items: MenuItem[] = [];
		const { target } = event.raw;
		const { browser, nav } = Browser.links ?? { browser: undefined, nav: undefined };
		const get = createGetter('menuFileBrowser');
		const Clipboard = getGlobalClipboard();
		const pastable = Clipboard?.has?.('yami.files');
		let creatable = false;
		if ((seek(target, 'file-body-pane') as unknown as FileBrowserInstance) === Browser) {
			const folders = nav?.selections ?? [];
			if (browser?.display === 'normal' && folders.length === 1) {
				creatable = true;
				items.push(
					{
						label: get(showInExplorerCommand),
						click: () => {
							File.openPath?.(File.route?.(folders[0].path));
						}
					},
					{
						label: get('paste'),
						accelerator: ctrl('V'),
						enabled: pastable,
						click: () => {
							Browser.body?.pasteFiles?.();
						}
					},
					{
						label: get('import'),
						click: () => {
							Browser.body?.importFiles?.();
						}
					},
					{
						label: get('find-invalid-references'),
						click: () => {
							Reference.openInvalid?.();
						}
					},
					{
						label: get('find-unused-references'),
						click: () => {
							Reference.openUnused?.();
						}
					}
				);
			}
		} else {
			const element = seek(target, 'file-body-item', 2);
			if (element.tagName === 'FILE-BODY-ITEM' && hasClass(element, 'selected')) {
				const { selections } = Browser.body ?? { selections: [] as unknown[] };
				const { file } = element;
				const single = (selections ?? []).length === 1;
				if (single && selections?.[0] instanceof FolderItem) {
					creatable = true;
				}
				let copyable = true;
				for (const f of selections ?? []) {
					if (f instanceof FolderItem) {
						copyable = false;
						break;
					}
				}
				items.push({
					label: get(showInExplorerCommand),
					click: () => {
						Browser.body?.showInExplorer?.();
					}
				});
				if (browser?.display === 'search') {
					items.push({
						label: get('openFileLocation'),
						enabled: single,
						click: () => {
							Browser.body?.openFileLocation?.(file);
						}
					});
				}
				items.push(
					{
						label: get('open'),
						accelerator: 'Enter',
						enabled: single,
						click: () => {
							Browser.body?.openFile?.(file);
						}
					},
					{
						label: get('cut'),
						accelerator: ctrl('X'),
						enabled: copyable,
						click: () => {
							Browser.body?.copyFiles?.(true);
						}
					},
					{
						label: get('copy'),
						accelerator: ctrl('C'),
						enabled: copyable,
						click: () => {
							Browser.body?.copyFiles?.();
						}
					},
					{
						label: get('paste'),
						accelerator: ctrl('V'),
						enabled: pastable,
						click: () => {
							Browser.body?.pasteFiles?.(
								creatable ? (selections as { path?: string }[])[0]?.path : undefined
							);
						}
					},
					{
						label: get('delete'),
						accelerator: 'Delete',
						enabled: !(selections as unknown[]).includes(Directory?.assets),
						click: () => {
							Browser.body?.deleteFiles?.();
						}
					},
					{
						label: get('rename'),
						accelerator: 'F2',
						enabled: single,
						click: () => {
							Browser.body?.rename?.(file);
						}
					}
				);
			}
		}
		if (items.length !== 0) {
			Menu.popup?.({ x: event.clientX, y: event.clientY }, items);
		}
	}

	let initRetryCount = 0;

	function initialize() {
		const Browser = getBrowser();
		if (!Browser) {
			// setComponent 由 FileBrowser.vue 的双 nextTick 完成，可能晚于本初始化调用，延迟重试
			if (initRetryCount < 20) {
				initRetryCount++;
				setTimeout(() => initialize(), 50);
			}
			return;
		}
		initRetryCount = 0;
		Browser.page = $('#project');
		Browser.searcher = (
			Browser.links?.head as (HTMLElement & { searcher?: HTMLElement }) | undefined
		)?.searcher;
		Browser.searcher?.addKeydownFilter?.();
		Browser.page?.addEventListener('resize', pageResize);
		Browser.body?.on?.('keydown', bodyKeydown as (event: unknown) => void);
		Browser.body?.on?.('open', bodyOpen as (event: unknown) => void);
		Browser.body?.on?.('select', bodySelect as (event: unknown) => void);
		Browser.body?.on?.('unselect', bodyUnselect as (event: unknown) => void);
		Browser.body?.on?.('popup', bodyPopup as (event: unknown) => void);
	}

	function open(dir: string) {
		getBrowser()?.open?.(dir);
		syncState();
	}

	function close() {
		getBrowser()?.close?.();
		syncState();
	}

	function unselect(meta: unknown) {
		const Browser = getBrowser();
		if (!Browser) return;
		const body = Browser.body;
		const files = body?.selections ?? [];
		if (files.length === 1 && (files as { meta?: unknown }[])[0].meta === meta) {
			body?.unselect?.();
		}
	}

	function openScript(filePath: string) {
		const { mode = '', path = '' } = Editor.config?.scriptEditor ?? {};
		switch (mode) {
			case 'by-file-extension':
				File.openPath?.(File.path?.(filePath));
				break;
			case 'specified-application':
				if (path) {
					const args = [File.path?.(filePath)];
					child_process.spawn(path, args);
				}
				break;
			default:
				File.openPath?.(File.path?.(filePath));
				break;
		}
	}

	function createFile(filename: string, data: unknown) {
		const Browser = getBrowser();
		if (!Browser) return;
		const Directory = getDirectoryTree();
		let guid: string;
		do {
			guid = GUID.generate64bit();
		} while (Data.manifest.guidMap[guid]);
		const { body } = Browser;
		const [basename, extname] = filename.split('.');
		const fullname = `${basename}.${guid}.${extname}`;
		const dirname = body?.getDirName?.() ?? '';
		const path = `${dirname}/${fullname}`;
		const route = File.path?.(path);
		const json = data instanceof Object ? JSON.stringify(data, null, 2) : data;
		FSP.writeFile(route, json)
			.then(() => Directory?.update?.() ?? Promise.resolve(false))
			.then((changed: unknown) => {
				if (changed) {
					const folder = Directory?.getFolder?.(dirname);
					if (folder?.path === dirname) {
						Browser.nav?.load?.(folder);
					}
					const file = Directory?.getFile?.(path);
					if (file?.path === path) {
						body?.select?.(file);
						body?.rename?.(file);
					}
				}
				console.log(`write: ${path}`);
			})
			.catch((error: unknown) => {
				console.warn(error);
			});
	}

	function createScript(filename: string) {
		const Browser = getBrowser();
		if (!Browser) return;
		const Directory = getDirectoryTree();
		let guid: string;
		do {
			guid = GUID.generate64bit();
		} while (Data.manifest.guidMap[guid]);
		const { body } = Browser;
		const [basename, extname] = filename.split('.');
		const fullname = `${basename}.${guid}.${extname}`;
		const dirname = body?.getDirName?.() ?? '';
		const path = `${dirname}/${fullname}`;
		const route = File.path?.(path);
		const source = Path.resolve(TemplatesPath, 'script', filename);
		FSP.copyFile(source, route)
			.then(() => Directory?.update?.() ?? Promise.resolve(false))
			.then((changed: unknown) => {
				if (changed) {
					const folder = Directory?.getFolder?.(dirname);
					if (folder?.path === dirname) {
						Browser.nav?.load?.(folder);
					}
					const file = Directory?.getFile?.(path);
					if (file?.path === path) {
						body?.select?.(file);
						body?.rename?.(file);
					}
				}
				console.log(`write: ${path}`);
			})
			.catch((error: unknown) => {
				console.warn(error);
			});
	}

	function updateNavVisibility() {
		const Browser = getBrowser();
		if (!Browser) return;
		if (hasClass(Browser.page, 'visible')) {
			if ((Browser as HTMLElement & FileBrowserInstance).clientWidth >= 500) {
				if (removeClass(Browser, 'hide-nav-pane')) {
					Browser.nav?.update?.();
				}
			} else {
				addClass(Browser, 'hide-nav-pane');
			}
		}
	}

	function saveToProject(project: { browser: { view?: number; folders?: string[] } }) {
		const Browser = getBrowser();
		if (!Browser) return;
		const { browser } = project;
		const { viewIndex } = Browser.body ?? {};
		const selections = Browser.nav?.getSelections?.() ?? [];
		const folders = selections.map((folder) => (folder as FolderItem).path);
		browser.view = viewIndex ?? browser.view;
		if (folders.length !== 0) {
			browser.folders = folders;
		}
	}

	function loadFromProject(project: { browser: { view: number; folders: string[] } }) {
		const Browser = getBrowser();
		if (!Browser) return;
		const Directory = getDirectoryTree();
		const { view, folders } = project.browser;
		const selections: (FolderItem | null)[] = [];
		for (const path of folders) {
			selections.push(Directory?.getFolder?.(path) ?? null);
		}
		if (selections.length === 0) {
			selections.push(Directory?.assets ?? null);
		}
		Browser.directory = Directory?.assets as unknown as string;
		Browser.body?.setViewIndex?.(view);
		Browser.nav?.load?.(...selections);
	}

	return {
		state,
		directory,
		component,
		setComponent,
		getBrowser,
		syncState,
		initialize,
		open,
		close,
		unselect,
		openScript,
		createFile,
		createScript,
		updateNavVisibility,
		saveToProject,
		loadFromProject,
		pageResize,
		bodyKeydown,
		bodyOpen,
		bodySelect,
		bodyUnselect,
		bodyPopup
	};
});

export function getBrowserStore() {
	return useBrowserStore(pinia);
}

export function getBrowserInstance(): FileBrowserInstance | null {
	return getBrowserStore().getBrowser();
}
