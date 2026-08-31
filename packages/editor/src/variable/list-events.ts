import { ctrl } from '@app/utils/event-accessors';
import type { MenuItem } from '@ui-kit';
import { write } from '@app/utils/element-utils.ts';
import { Menu } from '@app/components/menu-list.ts';
import { Reference } from '@app/log/related-references.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { GlobalClipboard } from '@app/utils/clipboard';
import { getVariableStore } from '@app/stores/variable';
import { Variable } from '@app/variable/variable.ts';

const Clipboard = GlobalClipboard;

Variable.listSelect = function (event: Event) {
	const item = event.value;
	return item.class !== 'folder'
		? Variable.openPropertyPanel(item)
		: Variable.closePropertyPanel();
};

Variable.listRecord = function (event: Event) {
	Variable.changed = true;
	const response = event.value;
	switch (response.type) {
		case 'rename': {
			// 如果是变量则执行操作否则进入默认分支
			const { item, oldValue, newValue } = response;
			if (getVariableStore().state.selected === item) {
				write(Variable.inputs.name, newValue);
				Variable.saveHistory(item, 'name', oldValue);
				break;
			}
		}
		default:
			Variable.history.save({
				type: 'variable-list-operation',
				response: response
			});
			break;
	}
};

Variable.listPopup = function (event: Event) {
	const list = Variable.list as unknown as {
		createFolder: () => unknown;
		createVariable: () => unknown;
		copy: (item: unknown) => void;
		paste: (item: unknown) => void;
		delete: (item: unknown) => void;
		rename: (item: unknown) => void;
		addNodeTo: (node: unknown, item: unknown) => void;
	};
	const item = event.value;
	const selected = !!item;
	const copyable = selected && item.class !== 'folder';
	const pastable = Clipboard.has('yami.data.variable');
	const undoable = Variable.history.canUndo();
	const redoable = Variable.history.canRedo();
	const get = (key: string) => t('menuVariableList.' + key);
	const items: MenuItem[] = [
		{
			label: get('create'),
			submenu: [
				{
					label: get('create.folder'),
					click: () => {
						list.addNodeTo(list.createFolder(), item);
					}
				},
				{
					label: get('create.variable'),
					accelerator: 'Insert',
					click: () => {
						list.addNodeTo(list.createVariable(), item);
					}
				}
			]
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
			label: get('delete'),
			accelerator: 'Delete',
			enabled: selected,
			click: () => {
				list.delete(item);
			}
		},
		{
			label: get('rename'),
			accelerator: 'F2',
			enabled: selected,
			click: () => {
				list.rename(item);
			}
		},
		{
			label: get('undo'),
			accelerator: ctrl('Z'),
			enabled: undoable,
			click: () => {
				Variable.undo();
			}
		},
		{
			label: get('redo'),
			accelerator: ctrl('Y'),
			enabled: redoable,
			click: () => {
				Variable.redo();
			}
		}
	];
	if (copyable) {
		items.unshift({
			label: `ID: ${item.id}`,
			style: 'id',
			click: () => {
				void navigator.clipboard.writeText(item.id);
			}
		});
		items.push({
			label: get('find-references'),
			accelerator: 'Alt+LB',
			click: () => {
				Reference.openRelated!(item.id);
			}
		});
	}
	Menu.popup(
		{
			x: event.clientX,
			y: event.clientY
		},
		items
	);
};

Variable.listOpen = function (event: Event) {
	if (event.value.class !== 'folder' && Variable.target instanceof Object) {
		Variable.target.getFocus?.();
		Variable.confirm();
	}
};
