import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { Directory } from '@/file/directory-object.ts';
import { FileItem } from '@/file/file-item.ts';
import { File } from '@/file/file-system-core.ts';
import { FSP } from '@/file/file-system.ts';
import { FolderItem } from '@/file/folder-item.ts';
import { GUID } from '@/file/guid.ts';
import { Data } from '@/data/data-object.ts';
import { Path } from '@/util/config.ts';
import { TemplatesPath } from '@/module/global.ts';
import { Menu } from '@/components/menu-list.ts';
import { ctrl } from '@/util/event-accessors.ts';
import { Title } from '@/title/title-bar.ts';
import { EventEditor } from '@/command/event-editor.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { Reference } from '@/log/related-references.ts';
import { Local } from '@/tools/localization.ts';
import { $ } from '@/util/dom.ts';
import { addClass, hasClass, rect, removeClass, seek } from '@/util/element-utils';
import child_process from 'node:child_process';

export const useBrowserStore = defineStore('browser', () => {
	const state = shallowRef<string>('closed');
	const directory = shallowRef<string | null>(null);

	function getBrowser(): any {
		return (window as any).Browser;
	}

	function syncState() {
		const Browser = getBrowser();
		state.value = Browser?.state ?? 'closed';
		directory.value = Browser?.directory ?? null;
	}

	function pageResize(event: any) {
		const Browser = getBrowser();
		if (!Browser?.body) return;
		updateNavVisibility();
		updateHead();
		Browser.nav?.resize?.();
		Browser.body.computeGridProperties?.();
		Browser.body.resize?.();
		Browser.body.updateContentSize?.();
	}

	function bodyKeydown(event: any) {
		const Browser = getBrowser();
		if (!Browser) return;
		if (event.ctrlKey || event.metaKey) {
			switch (event.code) {
				case 'KeyX':
					Browser.body.copyFiles(true);
					break;
				case 'KeyC':
					Browser.body.copyFiles();
					break;
				case 'KeyV':
					Browser.body.pasteFiles();
					break;
				default:
					return;
			}
			event.stopImmediatePropagation();
		}
	}

	function bodyOpen(event: any) {
		const Browser = getBrowser();
		if (!Browser) return;
		const file = event.value;
		switch (file.type) {
			case 'scene':
			case 'ui':
			case 'animation':
			case 'particle':
				(Title as any).openTab(file);
				break;
			case 'event': {
				const item = file.data;
				if (item) {
					(EventEditor as any).openGlobalEvent(file.meta.guid);
				}
				break;
			}
			case 'audio':
				(Inspector as any).fileAudio.play();
				break;
			case 'video':
				(Inspector as any).fileVideo.play();
				break;
			case 'script':
				openScript(file.path);
				break;
			case 'other':
				(File as any).openPath((File as any).route(file.path));
				break;
		}
	}

	function bodySelect(event: any) {
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
					(Inspector as any).open('fileTileset', file.data, meta);
					break;
				case 'actor':
					(Inspector as any).open('fileActor', file.data, meta);
					break;
				case 'skill':
					(Inspector as any).open('fileSkill', file.data, meta);
					break;
				case 'trigger':
					(Inspector as any).open('fileTrigger', file.data, meta);
					break;
				case 'item':
					(Inspector as any).open('fileItem', file.data, meta);
					break;
				case 'equipment':
					(Inspector as any).open('fileEquipment', file.data, meta);
					break;
				case 'state':
					(Inspector as any).open('fileState', file.data, meta);
					break;
				case 'event':
					(Inspector as any).open('fileEvent', file.data, meta);
					break;
				case 'image':
					(Inspector as any).open('fileImage', file, meta);
					break;
				case 'audio':
					(Inspector as any).open('fileAudio', file, meta);
					break;
				case 'video':
					(Inspector as any).open('fileVideo', file, meta);
					break;
				case 'font':
					(Inspector as any).open('fileFont', file, meta);
					break;
				case 'script':
					(Inspector as any).open('fileScript', file, meta);
					break;
			}
		}
	}

	function bodyUnselect(event: any) {
		const Browser = getBrowser();
		if (!Browser) return;
		if ((Inspector as any).meta !== null) {
			const meta = (Inspector as any).meta;
			const files = event.value;
			if (files.length === 1 && files[0].path === meta.path) {
				(Inspector as any).close();
			}
		}
	}

	function bodyPopup(event: any) {
		const Browser = getBrowser();
		if (!Browser) return;
		const items: any[] = [];
		const { target } = event.raw;
		const { browser, nav } = Browser.links;
		const get = (Local as any).createGetter('menuFileBrowser');
		const Clipboard = (globalThis as any).Clipboard;
		const pastable = Clipboard.has('yami.files');
		let creatable = false;
		if (seek(target, 'file-body-pane') === Browser) {
			const folders = nav.selections;
			if (browser.display === 'normal' && folders.length === 1) {
				creatable = true;
				items.push(
					{
						label: get((Local as any).showInExplorer()),
						click: () => {
							(File as any).openPath((File as any).route(folders[0].path));
						}
					},
					{
						label: get('paste'),
						accelerator: ctrl('V'),
						enabled: pastable,
						click: () => {
							Browser.body.pasteFiles();
						}
					},
					{
						label: get('import'),
						click: () => {
							Browser.body.importFiles();
						}
					},
					{
						label: get('find-invalid-references'),
						click: () => {
							(Reference as any).openInvalid();
						}
					},
					{
						label: get('find-unused-references'),
						click: () => {
							(Reference as any).openUnused();
						}
					}
				);
			}
		} else {
			const element = seek(target, 'file-body-item', 2);
			if (element.tagName === 'FILE-BODY-ITEM' && hasClass(element, 'selected')) {
				const { selections } = Browser.body;
				const { file } = element;
				const single = selections.length === 1;
				if (single && selections[0] instanceof FolderItem) {
					creatable = true;
				}
				let copyable = true;
				for (const f of selections) {
					if (f instanceof FolderItem) {
						copyable = false;
						break;
					}
				}
				items.push({
					label: get((Local as any).showInExplorer()),
					click: () => {
						Browser.body.showInExplorer();
					}
				});
				if (browser.display === 'search') {
					items.push({
						label: get('openFileLocation'),
						enabled: single,
						click: () => {
							Browser.body.openFileLocation(file);
						}
					});
				}
				items.push(
					{
						label: get('open'),
						accelerator: 'Enter',
						enabled: single,
						click: () => {
							Browser.body.openFile(file);
						}
					},
					{
						label: get('cut'),
						accelerator: ctrl('X'),
						enabled: copyable,
						click: () => {
							Browser.body.copyFiles(true);
						}
					},
					{
						label: get('copy'),
						accelerator: ctrl('C'),
						enabled: copyable,
						click: () => {
							Browser.body.copyFiles();
						}
					},
					{
						label: get('paste'),
						accelerator: ctrl('V'),
						enabled: pastable,
						click: () => {
							Browser.body.pasteFiles(creatable ? selections[0].path : undefined);
						}
					},
					{
						label: get('delete'),
						accelerator: 'Delete',
						enabled: !selections.includes((Directory as any).assets),
						click: () => {
							Browser.body.deleteFiles();
						}
					},
					{
						label: get('rename'),
						accelerator: 'F2',
						enabled: single,
						click: () => {
							Browser.body.rename(file);
						}
					}
				);
			}
		}
		if (items.length !== 0) {
			(Menu as any).popup({ x: event.clientX, y: event.clientY }, items);
		}
	}

	function initialize() {
		const Browser = getBrowser();
		if (!Browser) return;
		Browser.page = $('#project');
		Browser.searcher = Browser.links.head.searcher;
		Browser.searcher.addKeydownFilter();
		Browser.page.addEventListener('resize', pageResize);
		Browser.body.on('keydown', bodyKeydown);
		Browser.body.on('open', bodyOpen);
		Browser.body.on('select', bodySelect);
		Browser.body.on('unselect', bodyUnselect);
		Browser.body.on('popup', bodyPopup);
	}

	function open(dir: string) {
		getBrowser()?.open?.(dir);
	}

	function close() {
		getBrowser()?.close?.();
	}

	function unselect(meta: any) {
		const Browser = getBrowser();
		if (!Browser) return;
		const body = Browser.body;
		const files = body.selections;
		if (files.length === 1 && files[0].meta === meta) {
			body.unselect();
		}
	}

	function updateHead() {
		const Browser = getBrowser();
		if (!Browser) return;
		const Layout = (window as any).Layout;
		const { page, head } = Browser;
		if (hasClass(page, 'visible')) {
			const { nav } = Layout.getGroupOfElement(head);
			const nRect = rect(nav);
			const iRect = rect(nav.lastChild);
			const left = iRect.right - nRect.left;
			if (head.left !== left) {
				head.left = left;
				head.style.left = `${left}px`;
			}
			const bRect = rect(Browser.body);
			const padding = Math.max(bRect.left - iRect.right, 0);
			if (head.padding !== padding) {
				head.padding = padding;
				head.style.paddingLeft = `${padding}px`;
			}
		}
	}

	function openScript(filePath: any) {
		const Browser = getBrowser();
		if (!Browser) return;
		const Editor = (window as any).Editor;
		const { mode, path } = Editor.config.scriptEditor;
		switch (mode) {
			case 'by-file-extension':
				(File as any).openPath((File as any).path(filePath));
				break;
			case 'specified-application':
				if (path) {
					const args = [(File as any).path(filePath)];
					child_process.spawn(path, args);
				}
				break;
		}
	}

	function createFile(filename: any, data: any) {
		const Browser = getBrowser();
		if (!Browser) return;
		let guid: string;
		do {
			guid = GUID.generate64bit();
		} while (Data.manifest.guidMap[guid]);
		const { body } = Browser;
		const [basename, extname] = filename.split('.');
		const fullname = `${basename}.${guid}.${extname}`;
		const dirname = body.getDirName();
		const path = `${dirname}/${fullname}`;
		const route = (File as any).path(path);
		const json = data instanceof Object ? JSON.stringify(data, null, 2) : data;
		FSP.writeFile(route, json)
			.then(() => (Directory as any).update())
			.then((changed: boolean) => {
				if (changed) {
					const folder = (Directory as any).getFolder(dirname);
					if (folder.path === dirname) {
						Browser.nav.load(folder);
					}
					const file = (Directory as any).getFile(path);
					if (file?.path === path) {
						body.select(file);
						body.rename(file);
					}
				}
				console.log(`write: ${path}`);
			})
			.catch((error: any) => {
				console.warn(error);
			});
	}

	function createScript(filename: any) {
		const Browser = getBrowser();
		if (!Browser) return;
		let guid: string;
		do {
			guid = GUID.generate64bit();
		} while (Data.manifest.guidMap[guid]);
		const { body } = Browser;
		const [basename, extname] = filename.split('.');
		const fullname = `${basename}.${guid}.${extname}`;
		const dirname = body.getDirName();
		const path = `${dirname}/${fullname}`;
		const route = (File as any).path(path);
		const source = Path.resolve(TemplatesPath, 'script', filename);
		FSP.copyFile(source, route)
			.then(() => (Directory as any).update())
			.then((changed: boolean) => {
				if (changed) {
					const folder = (Directory as any).getFolder(dirname);
					if (folder.path === dirname) {
						Browser.nav.load(folder);
					}
					const file = (Directory as any).getFile(path);
					if (file?.path === path) {
						body.select(file);
						body.rename(file);
					}
				}
				console.log(`write: ${path}`);
			})
			.catch((error: any) => {
				console.warn(error);
			});
	}

	function updateNavVisibility() {
		const Browser = getBrowser();
		if (!Browser) return;
		if (hasClass(Browser.page, 'visible')) {
			if (Browser.clientWidth >= 500) {
				if (removeClass(Browser, 'hide-nav-pane')) {
					Browser.nav.update();
				}
			} else {
				addClass(Browser, 'hide-nav-pane');
			}
		}
	}

	function saveToProject(project: any) {
		const Browser = getBrowser();
		if (!Browser) return;
		const { browser } = project;
		const { viewIndex } = Browser.body;
		const selections = Browser.nav.getSelections();
		const folders = selections.map((folder: any) => folder.path);
		browser.view = viewIndex ?? browser.view;
		if (folders.length !== 0) {
			browser.folders = folders;
		}
	}

	function loadFromProject(project: any) {
		const Browser = getBrowser();
		if (!Browser) return;
		const { view, folders } = project.browser;
		const selections: any[] = [];
		for (const path of folders) {
			selections.push((Directory as any).getFolder(path));
		}
		if (selections.length === 0) {
			selections.push((Directory as any).assets);
		}
		Browser.directory = (Directory as any).assets;
		Browser.body.setViewIndex(view);
		Browser.nav.load(...selections);
	}

	return {
		state,
		directory,
		syncState,
		initialize,
		open,
		close,
		unselect,
		updateHead,
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
