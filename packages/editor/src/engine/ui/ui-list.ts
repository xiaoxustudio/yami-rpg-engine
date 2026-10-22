import { getListConfig, elementDataOf } from '@ui-kit';
import { UI } from './ui-singleton.ts';
import type { UIShape, UINodeShape, UIPointerEvent } from './ui-singleton.ts';
import type { YamiElement } from '@app/types/element-api';
import { UIEngine } from './ui-engine.ts';
import type { MenuItem } from '@ui-kit';
import type { GlobalClipboardHost } from '@app/utils/clipboard';
import { GlobalClipboard } from '@app/utils/clipboard';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { ctrl } from '@app/utils/event-accessors';
import { dispatchChangeEvent, read, rect, write } from '@app/utils/element-utils.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { headNavOf, lastNavItemOf } from '@app/engine/layout/layout.ts';
import { Menu } from '@app/components/menu-list.ts';
import type { UIListNodeShape } from './ui-singleton.ts';
import { Reference } from '@app/log/related-references.ts';
import type { YamiMouseEvent } from '@app/types/editor-event';

/**
 * 搜索框的 input 处理器。
 *
 * 注册 ⇒ 触发时 `this` 是**搜索框元素**，不是 UI 单例。
 */
const searcherInput = function (this: UIShape['searcher'], event: InputEvent) {
	if (event.inputType !== 'insertCompositionText') {
		const text = this.input!.value;
		UI.list.searchNodesDebounced(text);
	}
};

const listKeydown = function (this: YamiElement, event: KeyboardEvent) {
	if (!this.data) {
		return;
	}
	const item = read(this);
	if (event.ctrlKey || event.metaKey) {
		switch (event.code) {
			case 'KeyX':
				if (item) {
					this.copy!(item);
					this.delete!(item);
				}
				break;
			case 'KeyC':
				this.copy!(item);
				break;
			case 'KeyV':
				this.paste!(null);
				break;
			case 'KeyD':
				this.duplicate!(item);
				break;
		}
	} else {
		switch (event.code) {
			case 'Slash':
				this.toggle!(item);
				break;
			case 'Delete':
				this.delete!(item);
				break;
			case 'Backspace':
				this.cancelSearch!();
				break;
			case 'Escape':
				UI.setTarget!(null);
				break;
		}
	}
};

/**
 * 列表上的 pointerdown 处理器。
 *
 * 同 `searcherInput`：`ui-initialize.ts` 用 `on(list, 'pointerdown', …)` 注册 ⇒ `this` 是**列表元素**，
 * 而体内调的 `this.cancelSearch` 正是列表元素自己的方法（下面 `UI.list.cancelSearch = …` 装的）。
 */
const listPointerdown = function (this: UIListNodeShape, event: PointerEvent) {
	switch (event.button) {
		case 3:
			this.cancelSearch!();
			break;
	}
};

const listSelect = function (this: UIShape, event: YamiMouseEvent) {
	UI.setTarget!(event.value);
};

const listRecord = function (this: UIShape, event: YamiMouseEvent) {
	const response = event.value;
	switch (response.type) {
		case 'rename':
			UI.listRename!(response);
			break;
		case 'create':
			UI.history!.save({
				type: 'ui-object-create',
				response: response
			});
			break;
		case 'delete':
			UI.history!.save({
				type: 'ui-object-delete',
				response: response
			});
			break;
		case 'remove':
			UI.history!.save({
				type: 'ui-object-remove',
				response: response
			});
			break;
	}
};

const listPopup = function (this: UIShape, event: YamiMouseEvent) {
	const list = UI.list;
	const item = event.value;
	const menuItems: MenuItem[] = [];
	const get = (key: string) => t('menuUIList.' + key);
	const selected = !!item;
	const copyable = selected;
	const pastable = (GlobalClipboard as GlobalClipboardHost).has('yami.ui.object');
	const deletable = selected;
	const renamable = selected;
	menuItems.push({
		label: get('create'),
		submenu: [
			{
				label: get('create.image'),
				click: () => {
					list.addNodeTo(Inspector.uiImage.create(), item);
				}
			},
			{
				label: get('create.text'),
				click: () => {
					list.addNodeTo(Inspector.uiText.create(), item);
				}
			},
			{
				label: get('create.textBox'),
				click: () => {
					list.addNodeTo(Inspector.uiTextBox.create(), item);
				}
			},
			{
				label: get('create.dialogBox'),
				click: () => {
					list.addNodeTo(Inspector.uiDialogBox.create(), item);
				}
			},
			{
				label: get('create.progressBar'),
				click: () => {
					list.addNodeTo(Inspector.uiProgressBar.create(), item);
				}
			},
			{
				label: get('create.button'),
				click: () => {
					list.addNodeTo(Inspector.uiButton.create(), item);
				}
			},
			{
				label: get('create.animation'),
				click: () => {
					list.addNodeTo(Inspector.uiAnimation.create!(), item);
				}
			},
			{
				label: get('create.video'),
				click: () => {
					list.addNodeTo(Inspector.uiVideo.create(), item);
				}
			},
			{
				label: get('create.window'),
				click: () => {
					list.addNodeTo(Inspector.uiWindow.create!(), item);
				}
			},
			{
				label: get('create.container'),
				click: () => {
					list.addNodeTo(Inspector.uiContainer.create(), item);
				}
			},
			{
				label: get('create.reference'),
				click: () => {
					list.addNodeTo(Inspector.uiReference.create!(), item);
				}
			},
			{
				label: get('create.shortcut'),
				enabled: selected && item.class !== 'reference',
				click: () => {
					UI.createShortcut!(item);
				}
			},
			UI.createPrefabItem!(item)
		]
	});
	if (selected) {
		menuItems.push(
			{
				label: get('reveal'),
				accelerator: 'Enter',
				click: () => {
					UI.revealTarget!();
				}
			},
			{
				label: get('toggle'),
				accelerator: '/',
				click: () => {
					list.toggle(item);
				}
			}
		);
	}
	menuItems.push(
		{
			type: 'separator'
		},
		{
			label: get('cut'),
			accelerator: ctrl('X'),
			enabled: copyable,
			click: () => {
				list.copy(item);
				list.delete(item);
			}
		},
		{
			label: get('copy'),
			accelerator: ctrl('C'),
			enabled: copyable,
			click: () => {
				list.copy(item);
			}
		},
		{
			label: get('paste'),
			accelerator: ctrl('V'),
			enabled: pastable,
			click: () => {
				list.paste(item);
			}
		},
		{
			label: get('duplicate'),
			accelerator: ctrl('D'),
			enabled: copyable,
			click: () => {
				list.duplicate(item);
			}
		},
		{
			label: get('delete'),
			accelerator: 'Delete',
			enabled: deletable,
			click: () => {
				list.delete(item);
			}
		},
		{
			label: get('rename'),
			accelerator: 'F2',
			enabled: renamable,
			click: () => {
				list.rename(item);
			}
		},
		{
			label: get('copy-id'),
			enabled: selected,
			click: () => {
				void navigator.clipboard.writeText(item.presetId);
			}
		}
	);
	if (copyable) {
		menuItems.push({
			label: get('find-references'),
			accelerator: 'Alt+LB',
			enabled: copyable,
			click: () => {
				Reference.openRelated!(item.presetId);
			}
		});
	}
	if (selected) {
		if (!UI.hasPrefab!(item)) {
			menuItems.push({
				label: get('set-as-prefab'),
				enabled: item.class !== 'reference',
				click: () => {
					UI.setAsPrefab!(item);
				}
			});
		} else {
			menuItems.push({
				label: get('unset-as-prefab'),
				enabled: item.class !== 'reference',
				click: () => {
					UI.unsetAsPrefab!(item);
				}
			});
		}
	}
	Menu.popup!(
		{
			x: event.clientX,
			y: event.clientY
		},
		menuItems
	);
};

const listOpen = function (this: UIShape, _event: YamiMouseEvent) {
	UI.revealTarget!();
};

const listRename = function (
	this: UIShape,
	response: { item: UINodeShape; oldValue: string; newValue: string }
) {
	const editor = Inspector.uiElement;
	const target = response.item;
	const input = editor.nameBox;
	const { oldValue, newValue } = response;
	write(input, newValue);
	UI.history!.save({
		type: 'inspector-change',
		editor: editor,
		target: target,
		changes: [
			{
				input,
				oldValue,
				newValue
			}
		]
	});
};

const listChange = function (this: UIShape, _event: YamiMouseEvent) {
	UI.planToSave!();
};

const listPageResize = function (this: UIShape, _event: YamiMouseEvent) {
	UI.list.updateHead();
	UI.list.resize();
};

UI.marquee.resize = function (this: HTMLElement & { pointerevent?: UIPointerEvent | null }) {
	if (this.pointerevent) {
		UI.marqueePointermove!(this.pointerevent!);
	}
};

UI.list.copy = function (this: UIListNodeShape, item: UINodeShape) {
	if (item) {
		(GlobalClipboard as GlobalClipboardHost).write('yami.ui.object', item);
	}
};

UI.list.paste = function (
	this: UIListNodeShape,
	dItem: UINodeShape | null,
	callback?: (data: unknown) => void
) {
	const copy = (GlobalClipboard as GlobalClipboardHost).read('yami.ui.object');
	if (copy && this.data) {
		callback?.(copy);
		this.addNodeTo!(copy, dItem);
		UIEngine.requestRendering!.call(UI);
	}
};

UI.list.delete = function (this: UIListNodeShape, item: UINodeShape) {
	if (item) {
		this.deleteNode!(item);
		UIEngine.requestRendering!.call(UI);
	}
};

UI.list.toggle = function (this: UIListNodeShape, item: UINodeShape) {
	if (item) {
		UI.history!.save({
			type: 'ui-object-toggle',
			item: item,
			oldValue: item.enabled,
			newValue: !item.enabled
		});
		item.enabled = !item.enabled;
		this.update();
		dispatchChangeEvent(this);
	}
};

UI.list.cancelSearch = function (this: UIListNodeShape) {
	if (this.display === 'search') {
		const active = document.activeElement;
		UI.searcher.deleteInputContent();
		this.expandToSelection!();
		this.scrollToSelection!();
		(active as HTMLElement | null)?.focus();
	}
};

UI.list.updateHead = function (this: UIListNodeShape) {
	const { page, head } = elementDataOf<{ page: HTMLElement; head: HTMLElement }>(this);
	if (page.clientWidth !== 0) {
		const nav = headNavOf(head);
		const item = lastNavItemOf(nav);
		if (!nav || !item) return;
		const nRect = rect(nav);
		const iRect = rect(item);
		const left = iRect.right - nRect.left;
		head.style.left = `${left}px`;
	}
};

getListConfig(UI.list).onCreate = function (this: UIShape, item: UINodeShape) {
	UI.registerPreset!(item);
	UI.loadElement!(item);
	UI.updateElement!(item);
} as (item: unknown) => void;

getListConfig(UI.list).onRemove = function (this: UIShape, item: UINodeShape) {
	UI.updateElement!(item);
} as (item: unknown) => void;

getListConfig(UI.list).onDelete = function (this: UIShape, item: UINodeShape) {
	UI.unregisterPreset!(item);
	UI.deleteElement!(item);
	UI.updateHover!();
	UI.updateTarget!();
	UIEngine.requestRendering!.call(UI);
} as (item: unknown) => void;

getListConfig(UI.list).onResume = function (this: UIShape, item: UINodeShape) {
	UI.registerPreset!(item);
	UI.loadElement!(item);
	UI.updateElement!(item);
} as (item: unknown) => void;

export const uiListMembers = {
	searcherInput,
	listKeydown,
	listPointerdown,
	listSelect,
	listRecord,
	listPopup,
	listOpen,
	listRename,
	listChange,
	listPageResize
};
