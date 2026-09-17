import { getListConfig } from '@ui-kit';

import { Window } from '@app/tools/window-object.ts';
import { clear, getFocus, hide, on, read, show, write } from '@app/utils/element-utils.ts';
import { createElementRegistry } from '@app/utils/element-registry';
import { ctrl } from '@app/utils/event-accessors';
import { folderGroupOf } from '@app/utils/folder-group';
import { Data } from '@app/data/data-object.ts';
import { File } from '@app/file/file-system-core.ts';
import { Shortcuts } from '@app/tools/shortcut-registry.ts';
import { Menu } from '@app/components/menu-list.ts';
import { GameLocal } from '@app/local/local-object.ts';
import { Reference } from '@app/log/related-references.ts';
import { History } from '@app/tools/history.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { bindListClipboardMethods } from '@app/tools/list-clipboard-methods.ts';
import { type MenuItem } from '@ui-kit';
import { type TreeListElement } from '@app/components/tree-list.ts';
import { GlobalClipboard } from '@app/utils/clipboard';
import { getEnumStore, enumStateKeys } from '@app/stores/enum';
import type { EnumItemShape } from '@app/stores/enum';
import { emitCustom } from '@app/events/custom-events';
import type { YamiElement } from '@app/types/element-api';
import type { YamiEvent } from '@app/types/editor-event';
import { clone as deepClone } from '@app/utils/object';

/** P5b 批次 3：元素注册表——由对应窗口 SFC 在模板里登记 */
export const enumEls = createElementRegistry();

interface EnumItem {
	id: string;
	class?: string;
	name: string;
	value?: string;
	note?: string;
	expanded?: boolean;
	children?: EnumItem[];
	element?: YamiElement;
	[k: string]: unknown;
}

interface EnumTarget {
	input?: (id: string) => void;
}

interface EnumHistoryData {
	item: EnumItem;
	value: string;
	settings: Record<string, string>;
	response: unknown;
}

interface EnumModule {
	list: TreeListElement;
	panel: YamiElement;
	searcher: YamiElement;
	inputs: {
		name: YamiElement | null;
		value: YamiElement | null;
		note: YamiElement | null;
	};
	initialize: (this: typeof Enum) => void;
	open: (this: typeof Enum, target?: EnumTarget, mode?: string) => void;
	undo: (this: typeof Enum) => void;
	redo: (this: typeof Enum) => void;
	createId: (this: typeof Enum) => string;
	register: (this: typeof Enum, item: EnumItem) => void;
	unregister: (this: typeof Enum, item: EnumItem) => void;
	getItemById: (this: typeof Enum, id: string) => EnumItem | undefined;
	setFolderGroup: (this: typeof Enum, folder: EnumItem, newGroup: string) => void;
	getGroup: (this: typeof Enum, groupKey: string) => unknown;
	getString: (this: typeof Enum, stringId: string) => EnumItem | undefined;
	getGroupString: (
		this: typeof Enum,
		groupKey: string | undefined,
		stringId: string
	) => EnumItem | undefined;
	getDefStringId: (this: typeof Enum, groupKey: string | undefined) => string;
	getStringItems: (
		this: typeof Enum,
		groupKey: string | undefined,
		allowNone?: boolean
	) => unknown[];
	getMergedItems: (
		this: typeof Enum,
		headItems: unknown,
		groupKey: string,
		mergedKey?: string
	) => Array<{ value: string }>;
	openPropertyPanel: (this: typeof Enum, enumString: EnumItem) => void;
	closePropertyPanel: (this: typeof Enum) => void;
	unpackEnumeration: (this: typeof Enum) => void;
	packEnumeration: (this: typeof Enum) => void;
	saveHistory: (this: typeof Enum, item: EnumItem, key: string, value?: string) => void;
	windowClose: (this: typeof Enum, event: YamiEvent) => void;
	windowClosed: (this: typeof Enum, event: YamiEvent) => void;
	keydown: (event: KeyboardEvent) => void;
	listKeydown: (this: TreeListElement, event: KeyboardEvent) => void;
	listPointerdown: (this: TreeListElement, event: PointerEvent) => void;
	listDoubleclick: (event: MouseEvent) => void;
	listSelect: (event: YamiEvent) => void;
	listRecord: (event: YamiEvent) => void;
	listOpen: (event: MouseEvent) => void;
	listPopup: (event: YamiEvent & { clientX: number; clientY: number }) => void;
	nameInput: (event: InputEvent & { target: HTMLInputElement }) => void;
	valueInput: (event: InputEvent & { target: HTMLInputElement }) => void;
	noteInput: (this: HTMLElement, event: InputEvent) => void;
	panelKeydown: (event: KeyboardEvent) => void;
	searcherInput: (this: YamiElement, event: InputEvent) => void;
	confirm: (this: typeof Enum, event?: Event) => void;
	apply: (this: typeof Enum, event?: Event) => void;
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
}

export const Enum: EnumModule = {
	list: null as unknown as EnumModule['list'],
	panel: null as unknown as EnumModule['panel'],
	searcher: null as unknown as EnumModule['searcher'],
	inputs: {
		name: null,
		value: null,
		note: null
	},
	initialize: null as unknown as EnumModule['initialize'],
	open: null as unknown as EnumModule['open'],
	undo: null as unknown as EnumModule['undo'],
	redo: null as unknown as EnumModule['redo'],
	createId: null as unknown as EnumModule['createId'],
	register: null as unknown as EnumModule['register'],
	unregister: null as unknown as EnumModule['unregister'],
	getItemById: null as unknown as EnumModule['getItemById'],
	setFolderGroup: null as unknown as EnumModule['setFolderGroup'],
	getGroup: null as unknown as EnumModule['getGroup'],
	getString: null as unknown as EnumModule['getString'],
	getGroupString: null as unknown as EnumModule['getGroupString'],
	getDefStringId: null as unknown as EnumModule['getDefStringId'],
	getStringItems: null as unknown as EnumModule['getStringItems'],
	getMergedItems: null as unknown as EnumModule['getMergedItems'],
	openPropertyPanel: null as unknown as EnumModule['openPropertyPanel'],
	closePropertyPanel: null as unknown as EnumModule['closePropertyPanel'],
	unpackEnumeration: null as unknown as EnumModule['unpackEnumeration'],
	packEnumeration: null as unknown as EnumModule['packEnumeration'],
	saveHistory: null as unknown as EnumModule['saveHistory'],
	windowClose: null as unknown as EnumModule['windowClose'],
	windowClosed: null as unknown as EnumModule['windowClosed'],
	keydown: null as unknown as EnumModule['keydown'],
	listKeydown: null as unknown as EnumModule['listKeydown'],
	listPointerdown: null as unknown as EnumModule['listPointerdown'],
	listDoubleclick: null as unknown as EnumModule['listDoubleclick'],
	listSelect: null as unknown as EnumModule['listSelect'],
	listRecord: null as unknown as EnumModule['listRecord'],
	listOpen: null as unknown as EnumModule['listOpen'],
	listPopup: null as unknown as EnumModule['listPopup'],
	nameInput: null as unknown as EnumModule['nameInput'],
	valueInput: null as unknown as EnumModule['valueInput'],
	noteInput: null as unknown as EnumModule['noteInput'],
	panelKeydown: null as unknown as EnumModule['panelKeydown'],
	searcherInput: null as unknown as EnumModule['searcherInput'],
	confirm: null as unknown as EnumModule['confirm'],
	apply: null as unknown as EnumModule['apply']
};

function ensureDomBound() {
	if (Enum.list) return;
	const list = enumEls.get('enum-list');
	if (!list) return;
	// P2b-1：`enumEls` 给的是 `HTMLElement`，而它上面的元素 API 由 `attachTreeListApi` 装配
	Enum.list = list as TreeListElement;
	Enum.panel = enumEls.get('enum-properties-flex') as YamiElement;
	hide(Enum.panel!);
	Enum.searcher = enumEls.get('enum-searcher') as YamiElement;
	Enum.inputs.name = enumEls.get('enum-name') as YamiElement;
	Enum.inputs.value = enumEls.get('enum-value') as YamiElement;
	Enum.inputs.note = enumEls.get('enum-note') as YamiElement;
	Enum.list.copy = null as unknown as (...args: unknown[]) => void;
	Enum.list.paste = null as unknown as (...args: unknown[]) => void;
	Enum.list.delete = null as unknown as (...args: unknown[]) => void;
	Enum.list.saveScroll = null as unknown as (...args: unknown[]) => void;
	Enum.list.restoreScroll = null as unknown as (...args: unknown[]) => void;
	Enum.list.cancelSearch = null as unknown as (...args: unknown[]) => void;
	Enum.list.createString = null as unknown as () => unknown;
	Enum.list.parseName = null as unknown as (...args: unknown[]) => void;
	getListConfig(Enum.list).onDelete = null as unknown as (item: unknown) => void;
	getListConfig(Enum.list).onResume = null as unknown as (item: unknown) => void;
	bindListClipboardMethods({
		module: Enum as unknown as Parameters<typeof bindListClipboardMethods>[0]['module'],
		list: Enum.list,
		clipboardKey: 'yami.data.enumeration'
	});
	Enum.list.saveScroll = function (this: TreeListElement) {
		const { enumeration } = Data;
		if (enumeration.scrollTop === undefined) {
			Object.defineProperty(enumeration, 'scrollTop', {
				writable: true,
				value: 0
			});
		}
		enumeration.scrollTop = this.scrollTop;
	};
	Enum.list.restoreScroll = function (this: TreeListElement) {
		this.scrollTop = Data.enumeration.scrollTop ?? 0;
	};
	Enum.list.cancelSearch = function (this: TreeListElement) {
		if (this.display === 'search') {
			const active = document.activeElement;
			Enum.searcher!.deleteInputContent();
			this.expandToSelection();
			this.scrollToSelection();
			(active as HTMLElement | null)?.focus();
		}
	};
	Enum.list.createFolder = function () {
		return {
			class: 'folder',
			id: Enum.createId(),
			name: 'New Folder',
			expanded: false,
			children: []
		};
	};
	Enum.list.createString = function () {
		return {
			id: Enum.createId(),
			value: '',
			name: 'Item',
			note: ''
		};
	};
	Enum.list.parseName = function (item: EnumItem) {
		return GameLocal.replace(item.name);
	};
	getListConfig(Enum.list).onCreate = function (item: EnumItem) {
		Enum.register(item);
	} as (item: unknown) => void;
	getListConfig(Enum.list).onDelete = function (item: EnumItem) {
		Enum.unregister(item);
	} as (item: unknown) => void;
	getListConfig(Enum.list).onResume = function (item: EnumItem) {
		Enum.register(item);
	} as (item: unknown) => void;
}

Enum.initialize = function (this: typeof Enum) {
	ensureDomBound();
	if (!this.list) return;
	const { list } = this;
	getListConfig(list).removable = true;
	getListConfig(list).renamable = true;
	list.bind(() => getEnumStore().state.data);

	if (this.panel) getEnumStore().state.selected = null;

	this.searcher?.addCloseButton?.();

	History.processors['enum-list-operation'] = (operation: string, data: EnumHistoryData) => {
		const { response } = data;
		list.restore(operation, response);
		if (read(list) === null && getEnumStore().state.selected !== null) {
			this.closePropertyPanel();
		}
		getEnumStore().state.changed = true;
	};
	History.processors['enum-settings-change'] = (_operation: string, data: EnumHistoryData) => {
		const { settings } = data;
		data.settings = getEnumStore().state.settings!;
		getEnumStore().state.settings = settings;
		list.update();
		getEnumStore().state.changed = true;
	};
	History.processors['enum-name-change'] = (_operation: string, data: EnumHistoryData) => {
		const { item, value } = data;
		data.value = item.name;
		item.name = value;
		list.updateItemName(item);
		if (getEnumStore().state.selected === item) {
			write(this.inputs.name, value);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		getEnumStore().state.changed = true;
	};
	History.processors['enum-value-change'] = (_operation: string, data: EnumHistoryData) => {
		const { item, value } = data;
		data.value = item.value!;
		item.value = value;
		list.update();
		if (getEnumStore().state.selected === item) {
			write(this.inputs.value, value);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		getEnumStore().state.changed = true;
	};
	History.processors['enum-note-change'] = (_operation: string, data: EnumHistoryData) => {
		const { item, value } = data;
		data.value = item.note!;
		item.note = value;
		list.update();
		if (getEnumStore().state.selected === item) {
			write(this.inputs.note, value);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		getEnumStore().state.changed = true;
	};

	on(enumEls.get('enum'), 'close', this.windowClose);
	on(enumEls.get('enum'), 'closed', this.windowClosed);
	on(list, 'keydown', this.listKeydown);
	on(list, 'pointerdown', this.listPointerdown);
	on(list, 'pointerdown', Reference.getPointerdownListener!(list), {
		capture: true
	});
	on(list, 'doubleclick', this.listDoubleclick, { capture: true });
	// list select/record/open/popup 经 Vue 模板转发（Enum.vue @select/@record/@open/@popup → Enum.list*）
	// name/value input 经 Vue 模板转发（Enum.vue @input → Enum.nameInput/valueInput）
	on(this.inputs.note, 'input', this.noteInput);
	on(this.inputs.note, 'compositionend', this.noteInput);
	on(this.panel, 'keydown', this.panelKeydown);
	on(this.searcher, 'input', this.searcherInput);
	on(this.searcher, 'compositionend', this.searcherInput);
};

Enum.open = function (
	this: typeof Enum,
	target: EnumTarget | null | undefined = null,
	mode: string | null | undefined = 'normal'
) {
	getEnumStore().open(
		target as { input?: (id: string) => void; [k: string]: unknown } | null,
		mode as string | null
	);
	this.unpackEnumeration();
	Window.open!('enum');

	const list = this.list;
	const item = !target ? undefined : this.getItemById(read(target));
	if (item) {
		list.initialize();
		list.select(item);
		list.expandToSelection(false);
		list.update();
		list.restoreScroll();
		list.scrollToSelection('middle');
	} else {
		list.update();
		list.restoreScroll();
		if (target instanceof Object) {
			list.select(list.data[0]);
		}
	}

	getFocus(list);

	window.addEventListener('keydown', this.keydown);
	window.addEventListener('keydown', Reference.getKeydownListener!(list, 'enum'));
};

Enum.undo = function (this: typeof Enum) {
	getEnumStore().undo();
};

Enum.redo = function (this: typeof Enum) {
	getEnumStore().redo();
};

Enum.createId = function (this: typeof Enum) {
	return getEnumStore().createId();
};

Enum.register = function (this: typeof Enum, item: EnumItem) {
	getEnumStore().register(item as EnumItemShape);
};

Enum.unregister = function (this: typeof Enum, item: EnumItem) {
	getEnumStore().unregister(item as EnumItemShape);
};

Enum.getItemById = function (this: typeof Enum, id: string) {
	return getEnumStore().getItemById(id) as EnumItem | undefined;
};

Enum.setFolderGroup = function (this: typeof Enum, folder: EnumItem, newGroup: string) {
	const settings = getEnumStore().state.settings!;
	const oldGroup = folderGroupOf(settings, folder.id);
	if (oldGroup !== newGroup) {
		const copy = deepClone(settings);
		if (oldGroup) settings[oldGroup] = '';
		if (newGroup) settings[newGroup] = folder.id;
		getEnumStore().state.history!.save({
			type: 'enum-settings-change',
			settings: copy
		});
		this.list.update();
		getEnumStore().state.changed = true;
	}
};

Enum.getGroup = function (this: typeof Enum, groupKey: string) {
	return Data.enumeration.context.getGroup(groupKey);
};

Enum.getString = function (this: typeof Enum, stringId: string) {
	return Data.enumeration.context.getString(stringId);
};

Enum.getGroupString = function (this: typeof Enum, groupKey: string | undefined, stringId: string) {
	return Data.enumeration.context.getGroupString(groupKey, stringId);
};

Enum.getDefStringId = function (this: typeof Enum, groupKey: string | undefined) {
	return Data.enumeration.context.getDefStringId(groupKey);
};

Enum.getStringItems = function (
	this: typeof Enum,
	groupKey: string | undefined,
	allowNone: boolean = false
) {
	return Data.enumeration.context.getStringItems(groupKey, allowNone);
};

Enum.getMergedItems = function (
	this: typeof Enum,
	headItems: unknown,
	groupKey: string,
	mergedKey: string = 'merged'
) {
	return Data.enumeration.context.getMergedItems(headItems, groupKey, mergedKey);
};

Enum.openPropertyPanel = function (this: typeof Enum, enumString: EnumItem) {
	const panel = this.panel;
	if (getEnumStore().state.selected !== enumString) {
		getEnumStore().state.selected = enumString as EnumItemShape;
		show(panel);
		const { inputs } = this;
		write(inputs.name, enumString.name);
		write(inputs.value, enumString.value);
		write(inputs.note, enumString.note);
	}
};

Enum.closePropertyPanel = function (this: typeof Enum) {
	const panel = this.panel;
	if (getEnumStore().state.selected) {
		getEnumStore().state.selected = null;
		hide(panel);
	}
};

Enum.unpackEnumeration = (function IIFE() {
	class ReferencedFolder {
		data: EnumItem;
		class: string;
		id: string;
		name: string;
		children: EnumItem[];
		constructor(item: EnumItem) {
			this.data = item;
			this.class = item.class!;
			this.id = item.id;
			this.name = item.name;
			this.children = clone(item.children);
		}

		get expanded() {
			return this.data.expanded;
		}

		set expanded(value: boolean | undefined) {
			this.data.expanded = value;
			File.planToSave!(Data.manifest.project.enumeration);
		}
	}
	const clone = (items: EnumItem[] | null | undefined): EnumItem[] => {
		const length = items!.length;
		const copies = Array.from<EnumItem | ReferencedFolder>({ length: length });
		for (let i = 0; i < length; i++) {
			const item = items![i];
			getEnumStore().state.idMap![item.id] = true;
			if (item.class !== 'folder') {
				copies[i] = deepClone(item);
			} else {
				copies[i] = new ReferencedFolder(item);
			}
		}
		return copies as EnumItem[];
	};
	return function (this: typeof Enum) {
		getEnumStore().state.idMap = {} as Record<string, boolean>;
		getEnumStore().state.data = clone(Data.enumeration.strings) as EnumItemShape[];
		getEnumStore().state.settings = deepClone(Data.enumeration.settings);
		if (!getEnumStore().state.settingKeys) {
			getEnumStore().state.settingKeys = Object.keys(getEnumStore().state.settings!);
		}
	};
})();

Enum.packEnumeration = (function IIFE() {
	const clone = (items: EnumItem[] | null | undefined): EnumItem[] => {
		const length = items!.length;
		const copies = Array.from<EnumItem>({ length: length });
		for (let i = 0; i < length; i++) {
			const item = items![i];
			if (item.class !== 'folder') {
				copies[i] = deepClone(item);
			} else {
				copies[i] = {
					class: item.class,
					id: item.id,
					name: item.name,
					expanded: item.expanded,
					children: clone(item.children)
				};
			}
		}
		return copies;
	};
	return function (this: typeof Enum) {
		Data.enumeration.strings = clone(getEnumStore().state.data as unknown as EnumItem[] | null);
		Data.enumeration.settings = deepClone(getEnumStore().state.settings);
		Data.createEnumerationContext();
	};
})();

Enum.saveHistory = function (this: typeof Enum, item: EnumItem, key: string, value?: string) {
	getEnumStore().saveHistory(item as EnumItemShape, key, value);
};

Enum.windowClose = function (this: typeof Enum, event: YamiEvent) {
	this.list.saveScroll();
	if (getEnumStore().state.changed) {
		event.preventDefault();
		const get = (key: string) => t('confirmation.' + key);
		Window.confirm!(
			{
				message: get('closeUnsavedEnumeration')
			},
			[
				{
					label: get('yes'),
					click: () => {
						getEnumStore().state.changed = false;
						Window.close!('enum');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
}.bind(Enum);

Enum.windowClosed = function (this: typeof Enum, _event: YamiEvent) {
	getEnumStore().close();
	write(this.searcher, '');
	clear(this.list);
	this.closePropertyPanel();
	window.removeEventListener('keydown', this.keydown);
	window.removeEventListener('keydown', Reference.getKeydownListener!(this.list));
}.bind(Enum);

Enum.keydown = Shortcuts.createUndoRedo(Enum);

Enum.listKeydown = function (this: TreeListElement, event: KeyboardEvent) {
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
				this.addNodeTo(this.createString(), item);
				break;
			case 'Delete':
				this.delete(item);
				break;
			case 'Backspace':
				this.cancelSearch();
				break;
		}
	}
};

Enum.listPointerdown = function (this: TreeListElement, event: PointerEvent) {
	switch (event.button) {
		case 0:
			if (event.target === this) {
				this.unselect();
				Enum.closePropertyPanel();
			}
			break;
		case 3:
			this.cancelSearch();
			break;
	}
};

Enum.listDoubleclick = function (event: MouseEvent) {
	switch (getEnumStore().state.mode) {
		case 'group':
			if (read(Enum.list)?.class === 'folder') {
				getFocus(getEnumStore().state.target);
				event.stopPropagation();
				Enum.confirm();
			}
			break;
		case 'string':
			if (read(Enum.list)?.value !== undefined) {
				getFocus(getEnumStore().state.target);
				event.stopPropagation();
				Enum.confirm();
			}
			break;
	}
};

Enum.listSelect = function (event: YamiEvent) {
	const item = event.value;
	return item.class !== 'folder' ? Enum.openPropertyPanel(item) : Enum.closePropertyPanel();
};

Enum.listRecord = function (event: YamiEvent) {
	getEnumStore().state.changed = true;
	const response = event.value;
	switch (response.type) {
		case 'rename': {
			// 如果是字符串则执行操作否则进入默认分支
			const { item, oldValue, newValue } = response;
			if (getEnumStore().state.selected === item) {
				write(Enum.inputs.name, newValue);
				Enum.saveHistory(item, 'name', oldValue);
				break;
			}
		}
		default:
			getEnumStore().state.history!.save({
				type: 'enum-list-operation',
				response: response
			});
			break;
	}
};

Enum.listOpen = function (event: MouseEvent) {
	Enum.listDoubleclick(event);
};

Enum.listPopup = function (event: YamiEvent & { clientX: number; clientY: number }) {
	const list = Enum.list!;
	const item = event.value;
	const selected = !!item;
	const copyable = selected && item.class !== 'folder';
	const pastable = GlobalClipboard.has('yami.data.enumeration');
	const undoable = getEnumStore().state.history!.canUndo();
	const redoable = getEnumStore().state.history!.canRedo();
	const get = (key: string) => t('menuEnumList.' + key);
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
					label: get('create.string'),
					accelerator: 'Insert',
					click: () => {
						list.addNodeTo(list.createString(), item);
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
				Enum.undo();
			}
		},
		{
			label: get('redo'),
			accelerator: ctrl('Y'),
			enabled: redoable,
			click: () => {
				Enum.redo();
			}
		}
	];
	if (selected) {
		items.unshift({
			label: `ID: ${item.id}`,
			style: 'id',
			click: () => {
				void navigator.clipboard.writeText(item.id);
			}
		});
	}
	if (selected) {
		items.push({
			label: get('find-references'),
			accelerator: 'Alt+LB',
			click: () => {
				Reference.openRelated!(item.id);
			}
		});
	}
	if (selected && item.class === 'folder') {
		// 步骤 5b：改为数据面读取（与 setFolderGroup 的 oldGroup 同式）——
		// 旧写法 `item.element?.group` 恒为 undefined，导致菜单勾选从来不显示。
		const group = folderGroupOf(getEnumStore().state.settings, item.id);
		const submenu = [
			{
				label: get('set-as.none'),
				checked: group === '',
				click: () => {
					Enum.setFolderGroup(item, '');
				}
			}
		];
		for (const groupKey of getEnumStore().state.settingKeys ?? []) {
			submenu.push({
				label: get('set-as.' + groupKey),
				checked: group === groupKey,
				click: () => {
					Enum.setFolderGroup(item, groupKey);
				}
			});
		}
		items.push({
			label: get('set-as'),
			submenu: submenu
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

Enum.nameInput = function (event: InputEvent & { target: HTMLInputElement }) {
	const item = getEnumStore().state.selected as EnumItem;
	if (item.class !== 'folder') {
		Enum.saveHistory(item, 'name', item.name);
		item.name = event.target.value;
		Enum.list!.updateItemName(item);
		getEnumStore().state.changed = true;
	}
};

Enum.valueInput = function (event: InputEvent & { target: HTMLInputElement }) {
	const item = getEnumStore().state.selected as EnumItem;
	if (item.class !== 'folder') {
		Enum.saveHistory(item, 'value', item.value);
		item.value = event.target.value;
		Enum.list!.update();
		getEnumStore().state.changed = true;
	}
};

Enum.noteInput = function (this: HTMLElement, event: InputEvent) {
	if (event.inputType !== 'insertCompositionText') {
		const item = getEnumStore().state.selected as EnumItem;
		Enum.saveHistory(item, 'note', item.note);
		item.note = read(this);
		Enum.list!.update();
		getEnumStore().state.changed = true;
	}
};

Enum.panelKeydown = function (event: KeyboardEvent) {
	switch ((event.target as HTMLElement).tagName) {
		case 'INPUT':
		case 'TEXTAREA':
			if (event.ctrlKey || event.metaKey) {
				switch (event.code) {
					case 'Enter':
					case 'NumpadEnter':
						break;
					default:
						event.stopPropagation();
						break;
				}
			}
			break;
	}
};

Enum.searcherInput = function (this: YamiElement, event: InputEvent) {
	if (event.inputType === 'insertCompositionText') {
		return;
	}
	const text = (this.input as { value: string }).value;
	Enum.list!.searchNodesDebounced(text);
};

Enum.confirm = function (this: typeof Enum, _event?: Event) {
	switch (getEnumStore().state.mode) {
		case 'normal':
			this.apply();
			break;
		case 'group': {
			const item = read(this.list);
			if (item && item.class !== 'folder') {
				return getFocus(this.list);
			}
			this.apply();
			getEnumStore().state.target?.input?.(item ? item.id : '');
			break;
		}
		case 'string': {
			const item = read(this.list);
			if (item && item.class === 'folder') {
				return getFocus(this.list);
			}
			this.apply();
			getEnumStore().state.target?.input?.(item ? item.id : '');
			break;
		}
	}
	Window.close!('enum');
}.bind(Enum);

Enum.apply = function (this: typeof Enum, _event?: Event) {
	if (getEnumStore().state.changed) {
		getEnumStore().state.changed = false;

		this.packEnumeration();
		File.planToSave!(Data.manifest.project.enumeration);

		emitCustom('enumchange');
	}
}.bind(Enum);

for (const key of enumStateKeys) {
	Object.defineProperty(Enum, key, {
		get: () => getEnumStore().state[key],
		set: (value: unknown) => {
			(getEnumStore().state as unknown as Record<string, unknown>)[key] = value;
		},
		configurable: true
	});
}
