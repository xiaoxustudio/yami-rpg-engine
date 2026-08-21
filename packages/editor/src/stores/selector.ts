import { defineStore } from 'pinia';
import type { MenuItem } from '@ui-kit';
import { getWindowStore } from '@app/stores/window';
import { shallowRef } from 'vue';
import { $ } from '@app/utils/dom';
import { clear, hasClass, seek } from '@app/utils/element-utils';
import { getDataStore } from '@app/stores/data';
import { AudioManager } from '@app/audio/audio-manager.ts';
import { Menu } from '@app/components/menu-list.ts';
import { getDirectoryTree } from '@app/services/file-system/directory-tree.ts';
import { FileItem, FolderItem } from '@app/services/file-system/file-item.ts';
import { File } from '@app/file/file-system-core.ts';
import { Reference } from '@app/log/related-references.ts';
import { showInExplorerCommand } from '@app/utils/platform';
import { createGetter } from '@app/i18n';
import { EventBus } from '@app/utils/event-bus.ts';
import { pinia } from './pinia';

export interface SelectorInstance {
	state?: string;
	target?: { input?(value?: unknown): void } | null;
	dragging?: unknown;
	directory?: unknown;
	backupFolders?: unknown[];
	selections?: unknown[];
	links?: {
		nav?: { lastChild?: Node; selections?: unknown[] };
		body?: { selections?: unknown[] };
		browser?: { display?: string };
	};
	audioPlayed?: boolean;
	deleteFiles?(...args: unknown[]): void;
	exportFile?(...args: unknown[]): void;
	openFile?(...args: unknown[]): void;
	rename?(...args: unknown[]): void;
	restoreDisplay?(): void;
	open?(target: unknown, allowNone?: boolean): void;
	close?(): void;
	allowNone?: boolean;
	lastDir?: string;
	filters?: unknown[] | null;
	nav?: HTMLElement & {
		load?(...folders: unknown[]): void;
		selections?: unknown[];
		clear?(): void;
		resize?(): void;
	};
	body?: HTMLElement & {
		computeGridProperties?(): void;
		selectByPath?(path?: string): void;
		selections?: unknown[];
		viewIndex?: number;
		setViewIndex?(index: number): void;
		clear?(): void;
		resize?(): void;
		updateContentSize?(): void;
		selectDefault?(): void;
		select?(file?: unknown): void;
		elements?: unknown[] & { count?: number };
		activateFile?: unknown;
		on?(type: string, listener: (event: unknown) => void): void;
	};
	head?: HTMLElement & {
		searcher?: HTMLElement & {
			on?(type: string, listener: (event: unknown) => void): void;
			getFocus?(): void;
			read?(): unknown;
		};
		address?: HTMLElement;
	};
}

export const useSelectorStore = defineStore('selector', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<any>(null);
	const allowNone = shallowRef<boolean>(true);
	const audioPlayed = shallowRef<boolean>(false);
	const lastDir = shallowRef<string>('Assets');
	const component = shallowRef<SelectorInstance | null>(null);

	function setComponent(instance: SelectorInstance | null) {
		component.value = instance;
	}

	function getSelector(): SelectorInstance | null {
		return component.value;
	}

	function syncState() {
		const Selector = getSelector();
		state.value = Selector?.state ?? 'closed';
		target.value = Selector?.target ?? null;
	}

	let confirmBound = false;

	function bindConfirm() {
		if (confirmBound) return;
		const button = $('#selector-confirm');
		if (!button) return;
		button.addEventListener('click', confirm);
		confirmBound = true;
	}

	let initRetryCount = 0;

	function initialize() {
		const Selector = getSelector();
		if (!Selector) {
			// setComponent 由 FileBrowser.vue 的双 nextTick 完成，可能晚于本初始化调用，延迟重试
			if (initRetryCount < 20) {
				initRetryCount++;
				setTimeout(() => initialize(), 50);
			}
			return;
		}
		initRetryCount = 0;
		if (Selector.body) {
			Selector.body.activateFile = Selector.body.select;
		}
		Selector.body?.on?.('keydown', bodyKeydown);
		Selector.body?.on?.('open', bodyOpen);
		Selector.body?.on?.('popup', bodyPopup);
		Selector.head?.searcher?.on?.('keydown', searcherKeydown);
		$('#selector')?.on?.('closed', windowClosed);
		$('#selector')?.on?.('resize', windowResize);
		bindConfirm();
		EventBus.once('editor_loaded', () => {
			if (Selector.head && Selector.head?.searcher) {
				if (Selector.head?.searcher) {
					Selector.head.searcher.id = 'selector-search';
				}
			}
		});
	}

	function open(
		t: { read(): string; filter?: string; input?(value?: unknown): void },
		allowNoneParam = true
	) {
		const Selector = getSelector();
		if (!Selector) return;
		const Directory = getDirectoryTree();
		bindConfirm();
		Selector.target = t;
		Selector.allowNone = allowNoneParam;
		target.value = t;
		allowNone.value = allowNoneParam;
		state.value = 'open';
		getWindowStore().open('selector');
		const { nav, head, body } = Selector ?? {};
		const guid = t.read();
		const meta = getDataStore().data.manifest!.guidMap[guid];
		const filter = t.filter;
		Selector.filters = filter ? filter.split(' ') : null;
		body?.computeGridProperties?.();
		if (meta !== undefined) {
			const path = meta.path;
			nav?.load?.(Directory?.getFolder?.(path));
			body?.selectByPath?.(path);
		} else {
			nav?.load?.(Directory?.getFolder?.(Selector.lastDir ?? 'Assets'));
		}
		head?.searcher?.getFocus?.();
	}

	function close() {
		getSelector()?.close?.();
	}

	function playAudio() {
		const Selector = getSelector();
		if (!Selector) return;
		const files = (Selector.links?.body?.selections ?? []) as {
			type?: string;
			path?: string;
			meta?: { guid?: string };
		}[];
		if (files.length === 1 && files[0].type === 'audio') {
			Selector.audioPlayed = true;
			audioPlayed.value = true;
			AudioManager.player?.stop?.();
			const path = files[0].path;
			if (path) AudioManager.player?.play?.(path);
		}
	}

	function confirm(event?: Event) {
		const Selector = getSelector();
		if (!Selector) return;
		if (Selector.dragging) return;
		const files = Selector.body?.selections ?? [];
		switch (files.length) {
			case 1: {
				const meta = (files[0] as { meta?: { guid?: string } })?.meta;
				if (meta !== undefined) {
					Selector.target?.input?.(meta?.guid);
					getWindowStore().close('selector');
				}
				break;
			}
			case 0:
				if (Selector.allowNone) {
					Selector.target?.input?.('');
					getWindowStore().close('selector');
				}
				break;
		}
	}

	function saveToProject(project: { selector?: { view?: number } }) {
		const Selector = getSelector();
		if (!Selector) return;
		const { selector } = project;
		const { viewIndex } = Selector.body ?? {};
		selector!.view = viewIndex ?? selector!.view;
	}

	function loadFromProject(project: { selector?: { view?: number } }) {
		const Selector = getSelector();
		if (!Selector) return;
		const Directory = getDirectoryTree();
		const { view } = project.selector!;
		Selector.directory = [Directory?.assets];
		Selector.body?.setViewIndex?.(view as number);
	}

	function windowClosed(event: Event) {
		const Selector = getSelector();
		if (!Selector) return;
		state.value = 'closed';
		const folder = (Selector.nav?.selections?.[0] ?? Selector.backupFolders?.[0]) as
			| { path?: string }
			| undefined;
		Selector.lastDir = folder?.path ?? 'Assets';
		lastDir.value = Selector.lastDir;
		Selector.target = null;
		target.value = null;
		Selector.restoreDisplay?.();
		Selector.nav?.clear?.();
		clear((Selector.head as (HTMLElement & { address?: HTMLElement }) | undefined)?.address);
		Selector.body?.clear?.();
		if (Selector.audioPlayed) {
			Selector.audioPlayed = false;
			audioPlayed.value = false;
			AudioManager.player?.stop?.();
		}
	}

	function windowResize(event: Event) {
		const Selector = getSelector();
		if (!Selector) return;
		Selector.nav?.resize?.();
		Selector.body?.computeGridProperties?.();
		Selector.body?.resize?.();
		Selector.body?.updateContentSize?.();
	}

	function searcherKeydown(event: KeyboardEvent) {
		const Selector = getSelector();
		if (!Selector) return;
		if (event.ctrlKey || event.metaKey) return;
		if (event.altKey) return;
		if (event.shiftKey) return;
		switch (event.code) {
			case 'Tab':
				Selector.body?.selectDefault?.();
				break;
			case 'Enter':
			case 'NumpadEnter':
				if (Selector.head?.searcher?.read?.()) {
					event.stopImmediatePropagation();
					const { body } = Selector;
					const { elements } = body ?? { elements: [] as unknown[] & { count?: number } };
					if (elements.count === 1) {
						const { file } = elements[0];
						if (file instanceof FileItem) {
							body?.select?.(file);
							confirm(event);
						}
					}
				}
				break;
		}
	}

	function bodyKeydown(event: KeyboardEvent) {
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

	function bodyOpen(event: Event) {
		return confirm(event);
	}

	function bodyPopup(
		event: Event & { raw: { target: unknown }; clientX: number; clientY: number }
	) {
		const Selector = getSelector();
		if (!Selector) return;
		const Directory = getDirectoryTree();
		const items: MenuItem[] = [];
		const { target: rawTarget } = event.raw;
		const { browser, nav } = Selector.links ?? {};
		const get = createGetter('menuFileBrowser');
		if (seek(rawTarget, 'file-body-pane') === Selector) {
			const folders = nav?.selections ?? [];
			if (!(browser?.display === 'normal' && (folders ?? []).length === 1)) {
				return;
			}
			items.push({
				label: get(showInExplorerCommand),
				click: () => {
					File.openPath?.(File.path?.((folders as { path?: string }[])[0]?.path));
				}
			});
		} else {
			const element = seek(rawTarget, 'file-body-item', 2);
			if (element.tagName === 'FILE-BODY-ITEM' && hasClass(element, 'selected')) {
				const { selections } = Selector ?? {};
				const { file } = element;
				const single = (selections ?? []).length === 1;
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
						Selector.openFile?.(file);
					}
				});
				items.push({
					label: get('delete'),
					accelerator: 'Delete',
					enabled: !(selections ?? []).includes(Directory?.assets),
					click: () => {
						Selector.deleteFiles?.();
					}
				});
				items.push({
					label: get('rename'),
					accelerator: 'F2',
					enabled: single && file !== Directory?.assets,
					click: () => {
						Selector.rename?.(file);
					}
				});
				items.push({
					label: get('export'),
					click: () => {
						Selector.exportFile?.();
					}
				});
				if (single && file instanceof FileItem) {
					items.push(
						{
							label: get('copy-id'),
							click: () => {
								navigator.clipboard.writeText(file.meta!.guid);
							}
						},
						{
							label: get('find-references'),
							accelerator: 'Alt+LB',
							click: () => {
								Reference.openRelated?.(file.meta!.guid);
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
		component,
		setComponent,
		getSelector,
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

export function getSelectorStore() {
	return useSelectorStore(pinia);
}

export function getSelectorInstance(): SelectorInstance | null {
	return getSelectorStore().getSelector();
}
