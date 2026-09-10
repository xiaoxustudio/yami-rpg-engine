import { PluginManager } from './plugin.ts';
import type { PluginItemShape, ClipboardShape } from './plugin.ts';
import { getSelectorInstance } from '@app/stores/selector.ts';
import { read } from '@app/utils/element-utils.ts';
import { GlobalClipboard } from '@app/utils/clipboard';
import { getYamiI18n } from '@app/i18n';
import { setTreeItemText } from '@ui-kit';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { ctrl } from '@app/utils/event-accessors';
import { Command } from '@app/commands/command-object.ts';
import { Menu } from '@app/components/menu-list.ts';
import { Window } from '@app/tools/window-object.ts';
import { Data } from '@app/data/data-object.ts';
import type { TreeListElement } from '@app/components/tree-list.ts';

PluginManager.listKeydown = function (this: TreeListElement, event: KeyboardEvent) {
	const item = read(this);
	if (event.ctrlKey || event.metaKey) {
		switch (event.code) {
			case 'KeyC':
				this.copy(item);
				break;
			case 'KeyV':
				this.paste();
				break;
		}
	} else if (event.altKey) {
		return;
	} else {
		switch (event.code) {
			case 'Insert':
				this.insert(item);
				break;
			case 'Slash':
				this.toggle(item);
				break;
			case 'Delete':
				this.delete(item);
				break;
		}
	}
} as unknown as ((...args: unknown[]) => void) | null;

PluginManager.listSelect = function (
	this: typeof PluginManager,
	event: Event & { value?: PluginItemShape }
) {
	void PluginManager.load!(event.value!);
} as unknown as ((...args: unknown[]) => void) | null;

// 列表 - 取消选择事件
PluginManager.listUnselect = function (this: typeof PluginManager, _event: Event) {
	PluginManager.unload!();
} as unknown as ((...args: unknown[]) => void) | null;

PluginManager.listChange = function (this: typeof PluginManager, _event: Event) {
	PluginManager.changed = true;
} as unknown as ((...args: unknown[]) => void) | null;

PluginManager.listPopup = function (
	this: typeof PluginManager,
	event: PointerEvent & { value?: PluginItemShape | null }
) {
	const list = PluginManager.list as TreeListElement;
	const item = event.value;
	const selected = !!item;
	const pastable = (GlobalClipboard as unknown as ClipboardShape).has('yami.data.plugin');
	const deletable = selected;
	const get = (key: string) => t('menuPluginList.' + key);
	Menu.popup(
		{
			x: event.clientX,
			y: event.clientY
		},
		[
			{
				label: get('edit'),
				accelerator: 'Enter',
				enabled: selected,
				click: () => {
					list.edit(item);
				}
			},
			{
				label: get('insert'),
				accelerator: 'Insert',
				click: () => {
					list.insert(item);
				}
			},
			{
				label: get('toggle'),
				accelerator: '/',
				enabled: selected,
				click: () => {
					list.toggle(item);
				}
			},
			{
				label: get('copy'),
				accelerator: ctrl('C'),
				enabled: selected,
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
				label: get('delete'),
				accelerator: 'Delete',
				enabled: deletable,
				click: () => {
					list.delete(item);
				}
			}
		]
	);
} as unknown as ((...args: unknown[]) => void) | null;

PluginManager.listOpen = function (
	this: typeof PluginManager,
	event: Event & { value?: PluginItemShape }
) {
	(PluginManager.list as TreeListElement).edit(event.value);
} as unknown as ((...args: unknown[]) => void) | null;

// 列表 - 编辑
PluginManager.list_edit = function (this: TreeListElement, item: PluginItemShape) {
	getSelectorInstance()?.open?.(
		{
			filter: 'script',
			read: () => item.id,
			input: (id: string) => {
				if (item.id !== id) {
					item.id = id;
					item.parameters = {};
					PluginManager.changed = true;
					(PluginManager.parameterPane as TreeListElement).update();
				}
				this.update();
			}
		},
		false
	);
};

// 列表 - 插入
PluginManager.list_insert = function (this: TreeListElement, dItem: PluginItemShape) {
	getSelectorInstance()?.open?.(
		{
			filter: 'script',
			read: () => '',
			input: (id: string) => {
				this.addNodeTo(PluginManager.createData(id), dItem);
			}
		},
		false
	);
};

// 列表 - 开关
PluginManager.list_toggle = function (this: TreeListElement, item: PluginItemShape) {
	if (item) {
		item.enabled = !item.enabled;
		this.update();
		PluginManager.changed = true;
	}
};

// 列表 - 复制
PluginManager.list_copy = function (this: TreeListElement, item: PluginItemShape) {
	if (item) {
		(GlobalClipboard as unknown as ClipboardShape).write('yami.data.plugin', item);
	}
};

// 列表 - 粘贴
PluginManager.list_paste = function (this: TreeListElement, dItem: PluginItemShape) {
	const copy = (GlobalClipboard as unknown as ClipboardShape).read('yami.data.plugin');
	if (copy) {
		this.addNodeTo(copy, dItem);
	}
};

// 列表 - 删除
PluginManager.list_delete = function (this: TreeListElement, item: PluginItemShape) {
	const get = (key: string) => t('confirmation.' + key);
	const name = Command.removeTextTags(Command.parseFileName(item.id));
	Window.confirm!(
		{
			message: t('confirmation.deleteSingleFile', { filename: name })
		},
		[
			{
				label: get('yes'),
				click: () => {
					const items = this.data;
					const index = items.indexOf(item);
					this.deleteNode(item);
					const last = items.length - 1;
					this.select(items[Math.min(index, last)]);
				}
			},
			{
				label: get('no')
			}
		]
	);
};

// 列表 - 保存选项状态
PluginManager.list_saveSelection = function (this: TreeListElement) {
	const { plugins } = Data;
	// 将数据保存在外部可以切换项目后重置
	if (plugins.selection === undefined) {
		Object.defineProperty(plugins, 'selection', {
			writable: true,
			value: ''
		});
	}
	const selection = read(this);
	if (selection) {
		plugins.selection = selection.id;
	}
};

// 列表 - 恢复选项状态
PluginManager.list_restoreSelection = function (this: TreeListElement) {
	const id = Data.plugins.selection;
	const item = PluginManager.getItemById!(id) ?? this.data?.[0];
	this.select(item);
	this.update();
	this.scrollToSelection();
};

// 列表 - 更新文本节点（步骤 4：显示文本经派生层覆盖，不再直写 textNode）
PluginManager.list_updateTextNode = function (this: TreeListElement, item: PluginItemShape) {
	const text = Command.removeTextTags(Command.parseFileName(item.id));
	setTreeItemText(item, text);
};
