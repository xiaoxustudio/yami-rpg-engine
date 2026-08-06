import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { $ } from '@/util/dom.ts';
import { clear, hasClass, seek } from '@/util/element-utils';
import { Data } from '@/data/data-object.ts';
import { AudioManager } from '@/audio/audio-manager.ts';
import { Menu } from '@/components/menu-list.ts';
import { Directory } from '@/file/directory-object.ts';
import { FileItem } from '@/file/file-item.ts';
import { File } from '@/file/file-system-core.ts';
import { FolderItem } from '@/file/folder-item.ts';
import { Reference } from '@/log/related-references.ts';
import { Local } from '@/tools/localization.ts';
import { Window } from '@/tools/window-object.ts';
import { EventBus } from '@/module/eventbus.ts';

export const useSelectorStore = defineStore('selector', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<any>(null);
	const allowNone = shallowRef<boolean>(true);
	const audioPlayed = shallowRef<boolean>(false);
	const lastDir = shallowRef<string>('Assets');

	function getSelector(): any {
		return (window as any).Selector;
	}

	function syncState() {
		const Selector = getSelector();
		state.value = Selector?.state ?? 'closed';
		target.value = Selector?.target ?? null;
	}

	function initialize() {
		const Selector = getSelector();
		if (!Selector) return;
		Selector.body.activateFile = Selector.body.select;
		Selector.body.on('keydown', bodyKeydown);
		Selector.body.on('open', bodyOpen);
		Selector.body.on('popup', bodyPopup);
		Selector.head.searcher.on('keydown', searcherKeydown);
		$('#selector').on('closed', windowClosed);
		$('#selector').on('resize', windowResize);
		$('#selector-confirm').addEventListener('click', confirm);
		EventBus.once('editor_loaded', () => {
			if (Selector.head && Selector.head.searcher) {
				Selector.head.searcher.id = 'selector-search';
			}
		});
	}

	function open(t: any, allowNoneParam = true) {
		const Selector = getSelector();
		if (!Selector) return;
		Selector.target = t;
		Selector.allowNone = allowNoneParam;
		target.value = t;
		allowNone.value = allowNoneParam;
		(Window as any).open('selector');
		const { nav, head, body } = Selector;
		const guid = t.read();
		const meta = Data.manifest.guidMap[guid];
		const filter = t.filter;
		Selector.filters = filter ? filter.split(' ') : null;
		body.computeGridProperties();
		if (meta !== undefined) {
			const path = meta.path;
			nav.load((Directory as any).getFolder(path));
			body.selectByPath(path);
		} else {
			nav.load((Directory as any).getFolder(Selector.lastDir));
		}
		head.searcher.getFocus();
	}

	function close() {
		getSelector()?.close?.();
	}

	function playAudio() {
		const Selector = getSelector();
		if (!Selector) return;
		const files = Selector.links.body.selections;
		if (files.length === 1 && files[0].type === 'audio') {
			Selector.audioPlayed = true;
			audioPlayed.value = true;
			(AudioManager.player as any).stop();
			(AudioManager.player as any).play(files[0].path);
		}
	}

	function confirm(event?: any) {
		const Selector = getSelector();
		if (!Selector) return;
		if (Selector.dragging) return;
		const files = Selector.body.selections;
		switch (files.length) {
			case 1:
				if (files[0] instanceof FileItem) {
					const file = files[0];
					const meta = file.meta;
					if (meta !== undefined) {
						Selector.target.input(meta.guid);
						(Window as any).close('selector');
					}
				}
				break;
			case 0:
				if (Selector.allowNone) {
					Selector.target.input('');
					(Window as any).close('selector');
				}
				break;
		}
	}

	function saveToProject(project: any) {
		const Selector = getSelector();
		if (!Selector) return;
		const { selector } = project;
		const { viewIndex } = Selector.body;
		selector.view = viewIndex ?? selector.view;
	}

	function loadFromProject(project: any) {
		const Selector = getSelector();
		if (!Selector) return;
		const { view } = project.selector;
		Selector.directory = [(Directory as any).assets];
		Selector.body.setViewIndex(view);
	}

	function windowClosed(event: any) {
		const Selector = getSelector();
		if (!Selector) return;
		const folder = Selector.nav.selections[0] ?? Selector.backupFolders?.[0];
		Selector.lastDir = folder ? folder.path : 'Assets';
		lastDir.value = Selector.lastDir;
		Selector.target = null;
		target.value = null;
		Selector.restoreDisplay();
		Selector.nav.clear();
		clear(Selector.head.address);
		Selector.body.clear();
		if (Selector.audioPlayed) {
			Selector.audioPlayed = false;
			audioPlayed.value = false;
			(AudioManager.player as any).stop();
		}
	}

	function windowResize(event: any) {
		const Selector = getSelector();
		if (!Selector) return;
		Selector.nav.resize();
		Selector.body.computeGridProperties();
		Selector.body.resize();
		Selector.body.updateContentSize();
	}

	function searcherKeydown(event: any) {
		const Selector = getSelector();
		if (!Selector) return;
		if (event.ctrlKey || event.metaKey) return;
		if (event.altKey) return;
		if (event.shiftKey) return;
		switch (event.code) {
			case 'Tab':
				Selector.body.selectDefault();
				break;
			case 'Enter':
			case 'NumpadEnter':
				if (Selector.head.searcher.read()) {
					event.stopImmediatePropagation();
					const { body } = Selector;
					const { elements } = body;
					if (elements.count === 1) {
						const { file } = elements[0];
						if (file instanceof FileItem) {
							body.select(file);
							confirm(event);
						}
					}
				}
				break;
		}
	}

	function bodyKeydown(event: any) {
		const Selector = getSelector();
		if (!Selector) return;
		if (event.ctrlKey || event.metaKey) return;
		switch (event.code) {
			case 'Space':
				playAudio();
				break;
			default:
				return;
		}
		event.stopImmediatePropagation();
	}

	function bodyOpen(event: any) {
		return confirm(event);
	}

	function bodyPopup(event: any) {
		const Selector = getSelector();
		if (!Selector) return;
		const items: any[] = [];
		const { target: rawTarget } = event.raw;
		const { browser, nav } = Selector.links;
		const get = (Local as any).createGetter('menuFileBrowser');
		if (seek(rawTarget, 'file-body-pane') === Selector) {
			const folders = nav.selections;
			if (!(browser.display === 'normal' && folders.length === 1)) {
				return;
			}
			items.push({
				label: get((Local as any).showInExplorer()),
				click: () => {
					(File as any).openPath((File as any).path(folders[0].path));
				}
			});
		} else {
			const element = seek(rawTarget, 'file-body-item', 2);
			if (element.tagName === 'FILE-BODY-ITEM' && hasClass(element, 'selected')) {
				const { selections } = Selector;
				const { file } = element;
				const single = selections.length === 1;
				if (single && file.type === 'audio') {
					items.push({
						label: get('play'),
						accelerator: 'Space',
						click: () => {
							playAudio();
						}
					});
				}
				items.push({
					label: get(file instanceof FolderItem ? 'open' : 'select'),
					accelerator: 'Enter',
					enabled: single,
					click: () => {
						Selector.openFile(file);
					}
				});
				items.push({
					label: get('delete'),
					accelerator: 'Delete',
					enabled: !selections.includes((Directory as any).assets),
					click: () => {
						Selector.deleteFiles();
					}
				});
				items.push({
					label: get('rename'),
					accelerator: 'F2',
					enabled: single && file !== (Directory as any).assets,
					click: () => {
						Selector.rename(file);
					}
				});
				items.push({
					label: get('export'),
					click: () => {
						Selector.exportFile();
					}
				});
				if (single && file instanceof FileItem) {
					items.push(
						{
							label: get('copy-id'),
							click: () => {
								navigator.clipboard.writeText(file.meta.guid);
							}
						},
						{
							label: get('find-references'),
							accelerator: 'Alt+LB',
							click: () => {
								(Reference as any).openRelated(file.meta.guid);
							}
						}
					);
				}
			}
		}
		if (items.length !== 0) {
			Menu.popup({ x: event.clientX, y: event.clientY }, items);
		}
	}

	return {
		state,
		target,
		allowNone,
		audioPlayed,
		lastDir,
		syncState,
		initialize,
		open,
		close,
		playAudio,
		confirm,
		saveToProject,
		loadFromProject,
		windowClosed,
		windowResize,
		searcherKeydown,
		bodyKeydown,
		bodyOpen,
		bodyPopup
	};
});
