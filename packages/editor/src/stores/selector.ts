import { defineStore } from 'pinia';
import { selectorNodes } from '@app/composables/page-shell-nodes';
import { GlobalClipboard } from '@app/utils/clipboard';
import type { MenuItem } from '@ui-kit';
import { getWindowStore } from '@app/stores/window';
import { shallowRef } from 'vue';
import { clear, hasClass } from '@app/utils/element-utils';
import { getDataStore } from '@app/stores/data';
import { AudioManager } from '@app/audio/audio-manager.ts';
import { Menu } from '@app/components/menu-list.ts';
import { getDirectoryTree } from '@app/services/file-system/directory-tree.ts';
import { FileItem, FolderItem } from '@app/services/file-system/file-item.ts';
import { File } from '@app/file/file-system-core.ts';
import { Reference } from '@app/log/related-references.ts';
import { showInExplorerCommand } from '@app/utils/platform';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { EventBus } from '@app/utils/event-bus.ts';
import { pinia } from './pinia';
import { fileItemElementOf } from '@app/utils/dom';
import { applyLocalizedTip } from '@app/utils/localized-items';
import type { YamiElement } from '@app/types/element-api';

import type {
	FileBrowserBodyHandle,
	FileBrowserHeadHandle,
	FileBrowserLinks,
	FileBrowserNavHandle
} from '@app/types/file-browser-links.ts';

/**
 * 选择器窗口的文件浏览器句柄（ui-kit `YMFileBrowser` 的 `defineExpose`）。
 *
 * 迁移前注册的是 `.file-browser` 元素、方法挂在元素上（`nav.selections` / `body.selections`）；
 * 现在注册的是**组件实例**：选中项走 `getSelections()`，「单击行 = 选中」的覆写走
 * `setActivateFile()`，需要 DOM 时用 `el`。
 */
export interface SelectorInstance {
	state?: string;
	target?: { input?(value?: unknown): void } | null;
	dragging?: unknown;
	el?: (HTMLElement & { directory?: unknown[] | null }) | null;
	links?: FileBrowserLinks;
	audioPlayed?: boolean;
	restoreDisplay?(): void;
	open?(target: unknown, allowNone?: boolean): void;
	close?(): void;
	allowNone?: boolean;
	lastDir?: string;
	filters?: unknown[] | null;
	// 这四项在 `YMFileBrowser` 上从未提供（历史菜单项一直走 `?.` 空转），保留可选形态不改语义
	deleteFiles?(...args: unknown[]): void;
	exportFile?(...args: unknown[]): void;
	openFile?(...args: unknown[]): void;
	rename?(...args: unknown[]): void;
	nav?: FileBrowserNavHandle | null;
	body?: FileBrowserBodyHandle | null;
	head?: FileBrowserHeadHandle | null;
}

export const useSelectorStore = defineStore('selector', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<unknown>(null);
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

	let initRetryCount = 0;

	function initialize() {
		const Selector = getSelector();
		if (!Selector) {
			if (initRetryCount < 20) {
				initRetryCount++;
				setTimeout(() => initialize(), 50);
			}
			return;
		}
		initRetryCount = 0;
		// 「单击行 = 选中」的覆写：原来是往 body 元素赋值 activateFile，现在是显式 setter
		// oxlint-disable-next-line unbound-method
		const bodySelect = Selector.body?.select;
		Selector.body?.setActivateFile?.(bodySelect ?? null);
		Selector.body?.on?.('keydown', bodyKeydown);
		Selector.body?.on?.('open', bodyOpen);
		Selector.body?.on?.('popup', bodyPopup);
		Selector.head?.searcher?.on?.('keydown', searcherKeydown);
		(selectorNodes.pick('panel') as YamiElement)?.on?.('closed', windowClosed);
		(selectorNodes.pick('panel') as YamiElement)?.on?.('resize', windowResize);
		EventBus.once('editor_loaded', () => {
			applyLocalizedTip(Selector.head?.searcher, 'selector-search');
		});
	}

	function open(
		t: { read(): string; filter?: string; input?(value?: unknown): void },
		allowNoneParam = true
	) {
		const Selector = getSelector();
		if (!Selector) return;
		const Directory = getDirectoryTree();
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
		const files = (Selector.body?.getSelections?.() ?? []) as {
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

	function confirm(_event?: Event) {
		const Selector = getSelector();
		if (!Selector) return;
		if (Selector.dragging) return;
		const files = Selector.body?.getSelections?.() ?? [];
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
		// 目录根是元素数据（nav 从 parentNode.directory 读）
		if (Selector.el) Selector.el.directory = [Directory?.assets];
		Selector.body?.setViewIndex?.(view as number);
	}

	function windowClosed(_event: Event) {
		const Selector = getSelector();
		if (!Selector) return;
		state.value = 'closed';
		const folder = (Selector.nav?.getSelections?.()[0] ??
			Selector.links?.browser?.backupFolders?.[0]) as { path?: string } | undefined;
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

	function windowResize(_event: Event) {
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
					const rows = body?.getRowFiles?.() ?? [];
					if (rows.length === 1) {
						const file = rows[0];
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
		const targetElement = rawTarget instanceof Element ? rawTarget : null;
		const itemElement = fileItemElementOf(targetElement);
		const { browser, nav } = Selector.links ?? {};
		const get = (key: string) => t('menuFileBrowser.' + key);
		if (itemElement === null && targetElement?.closest('.file-body-pane') != null) {
			const folders = nav?.getSelections?.() ?? [];
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
			const element = itemElement as (YamiElement & { file: { type?: string } }) | null;
			if (element !== null && hasClass(element, 'selected')) {
				const selections = Selector.body?.getSelections?.() ?? [];
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
								GlobalClipboard.writeText(file.meta!.guid);
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
