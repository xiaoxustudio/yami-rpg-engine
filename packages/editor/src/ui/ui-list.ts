import { getListConfig, elementDataOf } from '@ui-kit';
import { UI } from './ui-window.ts';
import type { UIShape, UINodeShape, UIPointerEvent } from './ui-window.ts';
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
import { Reference } from '@app/log/related-references.ts';

UI.searcherInput = function (this: UIShape, event: InputEvent) {
	if (event.inputType !== 'insertCompositionText') {
		const text = this.input!.value;
		UI.list.searchNodesDebounced(text);
	}
};

UI.listKeydown = function (this: UIShape, event: KeyboardEvent) {
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

UI.listPointerdown = function (this: UIShape, event: PointerEvent) {
	switch (event.button) {
		case 3:
			this.cancelSearch!();
			break;
	}
};

UI.listSelect = function (this: UIShape, event: Event) {
	UI.setTarget!(event.value);
};

UI.listRecord = function (this: UIShape, event: Event) {
	const response = event.value;
	switch (response.type) {
		case 'rename':
			UI.listRename!(response);
			break;
		case 'create':
			UI.history.save({
				type: 'ui-object-create',
				response: response
			});
			break;
		case 'delete':
			UI.history.save({
				type: 'ui-object-delete',
				response: response
			});
			break;
		case 'remove':
			UI.history.save({
				type: 'ui-object-remove',
				response: response
			});
			break;
	}
};

UI.listPopup = function (this: UIShape, event: Event) {
	const list = UI.list;
	const item = event.value;
	const menuItems: MenuItem[] = [];
	const get = (key: string) => t('menuUIList.' + key);
	const selected = !!item;
	const copyable = selected;
	const pastable = (GlobalClipboard as unknown as GlobalClipboardHost).has('yami.ui.object');
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
					UI.revealTarget!(item);
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

UI.listOpen = function (this: UIShape, event: Event) {
	UI.revealTarget!(event.value);
};

UI.listRename = function (
	this: UIShape,
	response: { item: UINodeShape; oldValue: string; newValue: string }
) {
	const editor = Inspector.uiElement;
	const target = response.item;
	const input = editor.nameBox;
	const { oldValue, newValue } = response;
	write(input, newValue);
	UI.history.save({
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

UI.listChange = function (this: UIShape, _event: Event) {
	UI.planToSave!();
};

UI.listPageResize = function (this: UIShape, _event: Event) {
	UI.list.updateHead();
	UI.list.resize();
};

// 选框 - 调整目标
UI.marquee.resize = function (this: HTMLElement & { pointerevent?: UIPointerEvent | null }) {
	if (this.pointerevent) {
		UI.marqueePointermove!(this.pointerevent!);
	}
};

// 列表 - 复制
UI.list.copy = function (this: UIShape, item: UINodeShape) {
	if (item) {
		(GlobalClipboard as unknown as GlobalClipboardHost).write('yami.ui.object', item);
	}
};

// 列表 - 粘贴
UI.list.paste = function (
	this: UIShape,
	dItem: UINodeShape | null,
	callback?: (data: unknown) => void
) {
	const copy = (GlobalClipboard as unknown as GlobalClipboardHost).read('yami.ui.object');
	if (copy && this.data) {
		callback?.(copy);
		this.addNodeTo!(copy, dItem);
		UI.requestRendering!();
	}
};

// 列表 - 删除
UI.list.delete = function (this: UIShape, item: UINodeShape) {
	if (item) {
		this.deleteNode!(item);
		UI.requestRendering!();
	}
};

// 列表 - 开关
UI.list.toggle = function (this: UIShape, item: UINodeShape) {
	if (item) {
		UI.history.save({
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

// 列表 - 取消搜索
UI.list.cancelSearch = function (this: UIShape) {
	if (this.display === 'search') {
		const active = document.activeElement;
		UI.searcher.deleteInputContent();
		this.expandToSelection!();
		this.scrollToSelection!();
		active!.focus();
	}
};

// 列表 - 更新头部位置
UI.list.updateHead = function (this: UIShape) {
	// P4b：`page` / `head` 已不在 DATA_FIELDS 内（原型访问器退役），`this` 是列表元素 ⇒ 解构 `this`
	// 会拿到 undefined（`page.clientWidth` 抛错）。改读同一份元素数据。
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

// 列表 - 在创建数据时回调
getListConfig(UI.list).onCreate = function (this: UIShape, item: UINodeShape) {
	UI.registerPreset!(item);
	UI.loadElement!(item);
	UI.updateElement!(item);
} as (item: unknown) => void;

// 列表 - 在迁移数据时回调
getListConfig(UI.list).onRemove = function (this: UIShape, item: UINodeShape) {
	UI.updateElement!(item);
} as (item: unknown) => void;

// 列表 - 在删除数据时回调
getListConfig(UI.list).onDelete = function (this: UIShape, item: UINodeShape) {
	UI.unregisterPreset!(item);
	UI.deleteElement!(item);
	UI.updateHover!();
	UI.updateTarget!();
	UI.requestRendering!();
} as (item: unknown) => void;

// 列表 - 在恢复数据时回调
getListConfig(UI.list).onResume = function (this: UIShape, item: UINodeShape) {
	UI.registerPreset!(item);
	UI.loadElement!(item);
	UI.updateElement!(item);
} as (item: unknown) => void;
