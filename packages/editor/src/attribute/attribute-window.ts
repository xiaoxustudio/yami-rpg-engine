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
import { RadioProxy } from '@ui-kit';
import { type MenuItem } from '@ui-kit';
import { type TreeListElement } from '@app/components/tree-list.ts';
import { GlobalClipboard } from '@app/utils/clipboard';
import { getAttributeStore, attributeStateKeys } from '@app/stores/attribute';
import type { AttributeItemShape } from '@app/stores/attribute';

/** P5b 批次 3：元素注册表——由对应窗口 SFC 在模板里登记 */
export const attributeEls = createElementRegistry();

interface AttributeItem {
	id: string;
	class?: string;
	key?: string;
	type?: string;
	name: string;
	enum?: string;
	note?: string;
	expanded?: boolean;
	children?: AttributeItem[];
	element?: HTMLElement;
	[k: string]: unknown;
}

interface AttributeTarget {
	input?: (id: string) => void;
}

interface AttributeHistoryData {
	item: AttributeItem;
	value: string;
	settings: Record<string, string>;
	response: unknown;
}

interface AttributeWindowShape {
	list: TreeListElement;
	panel: HTMLElement;
	searcher: HTMLElement;
	inputs: {
		name: HTMLElement | null;
		key: HTMLElement | null;
		note: HTMLElement | null;
		enum: HTMLElement | null;
		enumBox: HTMLElement | null;
		type: HTMLElement | null;
	};
	initialize: (this: typeof Attribute) => void;
	open: (this: typeof Attribute, target?: AttributeTarget, mode?: string) => void;
	undo: (this: typeof Attribute) => void;
	redo: (this: typeof Attribute) => void;
	createId: (this: typeof Attribute) => string;
	register: (this: typeof Attribute, item: AttributeItem) => void;
	unregister: (this: typeof Attribute, item: AttributeItem) => void;
	getItemById: (this: typeof Attribute, id: string) => AttributeItem | undefined;
	setFolderGroup: (this: typeof Attribute, folder: AttributeItem, newGroup: string) => void;
	getGroup: (this: typeof Attribute, groupKey: string) => unknown;
	getAttribute: (this: typeof Attribute, attrId: string) => AttributeItem | undefined;
	getGroupAttribute: (
		this: typeof Attribute,
		groupKey: string,
		attrId: string
	) => AttributeItem | undefined;
	getDefAttributeId: (this: typeof Attribute, groupKey: string, type?: string) => string;
	getAttributeItems: (
		this: typeof Attribute,
		groupKey: string,
		attrType?: string,
		allowNone?: boolean
	) => Array<{ value: string }>;
	openPropertyPanel: (this: typeof Attribute, attribute: AttributeItem) => void;
	closePropertyPanel: (this: typeof Attribute) => void;
	unpackAttribute: (this: typeof Attribute) => void;
	packAttribute: (this: typeof Attribute) => void;
	saveHistory: (this: typeof Attribute, item: AttributeItem, key: string, value?: string) => void;
	windowClose: (this: typeof Attribute, event: Event) => void;
	windowClosed: (this: typeof Attribute, event: Event) => void;
	keydown: (event: Event) => void;
	listKeydown: (this: TreeListElement, event: KeyboardEvent) => void;
	listPointerdown: (this: TreeListElement, event: PointerEvent) => void;
	listDoubleclick: (event: MouseEvent) => void;
	listSelect: (event: Event) => void;
	listRecord: (event: Event) => void;
	listOpen: (event: MouseEvent) => void;
	listPopup: (
		this: typeof Attribute,
		event: Event & { clientX: number; clientY: number }
	) => void;
	nameInput: (event: InputEvent & { target: HTMLInputElement }) => void;
	keyInput: (event: InputEvent & { target: HTMLInputElement }) => void;
	typeWrite: (event: Event) => void;
	typeInput: (event: Event) => void;
	enumInput: (event: Event) => void;
	noteInput: (this: HTMLElement, event: InputEvent) => void;
	panelKeydown: (event: KeyboardEvent) => void;
	searcherInput: (this: TextBox, event: InputEvent) => void;
	confirm: (this: typeof Attribute, event?: Event) => void;
	apply: (this: typeof Attribute, event?: Event) => void;
	list_saveScroll: (this: TreeListElement) => void;
	list_restoreScroll: (this: TreeListElement) => void;
	list_cancelSearch: (this: TreeListElement) => void;
	list_createFolder: (this: typeof Attribute) => AttributeItem;
	list_createAttribute: (this: typeof Attribute) => AttributeItem;
	list_parseName: (this: typeof Attribute, item: AttributeItem) => string;
	list_onCreate: (this: typeof Attribute, item: AttributeItem) => void;
	list_onDelete: (this: typeof Attribute, item: AttributeItem) => void;
	list_onResume: (this: typeof Attribute, item: AttributeItem) => void;
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
}

export const Attribute: AttributeWindowShape = {
	list: null as unknown as AttributeWindowShape['list'],
	panel: null as unknown as AttributeWindowShape['panel'],
	searcher: null as unknown as AttributeWindowShape['searcher'],
	inputs: {
		name: null,
		key: null,
		note: null,
		enum: null,
		enumBox: null,
		type: null
	},
	initialize: null as unknown as AttributeWindowShape['initialize'],
	open: null as unknown as AttributeWindowShape['open'],
	undo: null as unknown as AttributeWindowShape['undo'],
	redo: null as unknown as AttributeWindowShape['redo'],
	createId: null as unknown as AttributeWindowShape['createId'],
	register: null as unknown as AttributeWindowShape['register'],
	unregister: null as unknown as AttributeWindowShape['unregister'],
	getItemById: null as unknown as AttributeWindowShape['getItemById'],
	setFolderGroup: null as unknown as AttributeWindowShape['setFolderGroup'],
	getGroup: null as unknown as AttributeWindowShape['getGroup'],
	getAttribute: null as unknown as AttributeWindowShape['getAttribute'],
	getGroupAttribute: null as unknown as AttributeWindowShape['getGroupAttribute'],
	getDefAttributeId: null as unknown as AttributeWindowShape['getDefAttributeId'],
	getAttributeItems: null as unknown as AttributeWindowShape['getAttributeItems'],
	openPropertyPanel: null as unknown as AttributeWindowShape['openPropertyPanel'],
	closePropertyPanel: null as unknown as AttributeWindowShape['closePropertyPanel'],
	unpackAttribute: null as unknown as AttributeWindowShape['unpackAttribute'],
	packAttribute: null as unknown as AttributeWindowShape['packAttribute'],
	saveHistory: null as unknown as AttributeWindowShape['saveHistory'],
	windowClose: null as unknown as AttributeWindowShape['windowClose'],
	windowClosed: null as unknown as AttributeWindowShape['windowClosed'],
	keydown: null as unknown as AttributeWindowShape['keydown'],
	listKeydown: null as unknown as AttributeWindowShape['listKeydown'],
	listPointerdown: null as unknown as AttributeWindowShape['listPointerdown'],
	listDoubleclick: null as unknown as AttributeWindowShape['listDoubleclick'],
	listSelect: null as unknown as AttributeWindowShape['listSelect'],
	listRecord: null as unknown as AttributeWindowShape['listRecord'],
	listOpen: null as unknown as AttributeWindowShape['listOpen'],
	listPopup: null as unknown as AttributeWindowShape['listPopup'],
	nameInput: null as unknown as AttributeWindowShape['nameInput'],
	keyInput: null as unknown as AttributeWindowShape['keyInput'],
	typeWrite: null as unknown as AttributeWindowShape['typeWrite'],
	typeInput: null as unknown as AttributeWindowShape['typeInput'],
	enumInput: null as unknown as AttributeWindowShape['enumInput'],
	noteInput: null as unknown as AttributeWindowShape['noteInput'],
	panelKeydown: null as unknown as AttributeWindowShape['panelKeydown'],
	searcherInput: null as unknown as AttributeWindowShape['searcherInput'],
	confirm: null as unknown as AttributeWindowShape['confirm'],
	apply: null as unknown as AttributeWindowShape['apply'],
	list_saveScroll: null as unknown as AttributeWindowShape['list_saveScroll'],
	list_restoreScroll: null as unknown as AttributeWindowShape['list_restoreScroll'],
	list_cancelSearch: null as unknown as AttributeWindowShape['list_cancelSearch'],
	list_createFolder: null as unknown as AttributeWindowShape['list_createFolder'],
	list_createAttribute: null as unknown as AttributeWindowShape['list_createAttribute'],
	list_parseName: null as unknown as AttributeWindowShape['list_parseName'],
	list_onCreate: null as unknown as AttributeWindowShape['list_onCreate'],
	list_onDelete: null as unknown as AttributeWindowShape['list_onDelete'],
	list_onResume: null as unknown as AttributeWindowShape['list_onResume']
};

function ensureDomBound() {
	if (Attribute.list) return;
	const list = attributeEls.get('attribute-list');
	if (!list) return;
	Attribute.list = list;
	Attribute.panel = attributeEls.get('attribute-properties-flex') as HTMLElement;
	hide(Attribute.panel);
	Attribute.searcher = attributeEls.get('attribute-searcher') as HTMLElement;
	Attribute.inputs.name = attributeEls.get('attribute-name') as HTMLElement;
	Attribute.inputs.key = attributeEls.get('attribute-key') as HTMLElement;
	Attribute.inputs.note = attributeEls.get('attribute-note') as HTMLElement;
	Attribute.inputs.enum = attributeEls.get('attribute-enum') as HTMLElement;
	Attribute.inputs.enumBox = attributeEls.get('attribute-enum-box') as HTMLElement;
	list.copy = null as unknown as (...args: unknown[]) => void;
	list.paste = null as unknown as (...args: unknown[]) => void;
	list.delete = null as unknown as (...args: unknown[]) => void;
	list.saveScroll = Attribute.list_saveScroll;
	list.restoreScroll = Attribute.list_restoreScroll;
	list.cancelSearch = Attribute.list_cancelSearch;
	list.createFolder = Attribute.list_createFolder;
	list.createAttribute = Attribute.list_createAttribute;
	list.parseName = Attribute.list_parseName;
	getListConfig(list).onCreate = Attribute.list_onCreate as (item: unknown) => void;
	getListConfig(list).onDelete = Attribute.list_onDelete as (item: unknown) => void;
	getListConfig(list).onResume = Attribute.list_onResume as (item: unknown) => void;
	bindListClipboardMethods({
		module: Attribute as unknown as Parameters<typeof bindListClipboardMethods>[0]['module'],
		list,
		clipboardKey: 'yami.data.attribute'
	});
}

// attribute-type 是一组 <radio-box name="attribute-type">，共享逻辑控件由 RadioBox 升级时塞入 RadioProxy.map，故 inputs.type 不能顶层求值，改为惰性 getter
Object.defineProperty(Attribute.inputs, 'type', {
	get() {
		return RadioProxy.map['attribute-type'];
	},
	enumerable: true,
	configurable: true
});

Attribute.initialize = function (this: typeof Attribute) {
	ensureDomBound();
	if (!Attribute.list) return;
	const { list } = this;
	getListConfig(list).removable = true;
	getListConfig(list).renamable = true;
	list.bind(() => getAttributeStore().state.data);

	if (this.panel) getAttributeStore().state.selected = null;

	this.searcher?.addCloseButton?.();

	History.processors['attribute-list-operation'] = (
		operation: string,
		data: AttributeHistoryData
	) => {
		const { response } = data;
		list.restore(operation, response);
		if (read(list) === null && getAttributeStore().state.selected !== null) {
			this.closePropertyPanel();
		}
		getAttributeStore().state.changed = true;
	};
	History.processors['attribute-settings-change'] = (
		_operation: string,
		data: AttributeHistoryData
	) => {
		const { settings } = data;
		data.settings = getAttributeStore().state.settings!;
		getAttributeStore().state.settings = settings;
		list.update();
		getAttributeStore().state.changed = true;
	};
	History.processors['attribute-name-change'] = (
		_operation: string,
		data: AttributeHistoryData
	) => {
		const { item, value } = data;
		data.value = item.name;
		item.name = value;
		list.updateItemName(item);
		if (getAttributeStore().state.selected === item) {
			write(this.inputs.name, value);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		getAttributeStore().state.changed = true;
	};
	History.processors['attribute-key-change'] = (
		_operation: string,
		data: AttributeHistoryData
	) => {
		const { item, value } = data;
		data.value = item.key!;
		item.key = value;
		list.update();
		if (getAttributeStore().state.selected === item) {
			write(this.inputs.key, value);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		getAttributeStore().state.changed = true;
	};
	History.processors['attribute-type-change'] = (
		_operation: string,
		data: AttributeHistoryData
	) => {
		const { item, value } = data;
		data.value = item.type!;
		item.type = value;
		list.update();
		if (getAttributeStore().state.selected === item) {
			write(this.inputs.type, value);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		getAttributeStore().state.changed = true;
	};
	History.processors['attribute-enum-change'] = (
		_operation: string,
		data: AttributeHistoryData
	) => {
		const { item, value } = data;
		data.value = item.enum!;
		item.enum = value;
		if (getAttributeStore().state.selected === item) {
			write(this.inputs.enum, value);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		getAttributeStore().state.changed = true;
	};
	History.processors['attribute-note-change'] = (
		_operation: string,
		data: AttributeHistoryData
	) => {
		const { item, value } = data;
		data.value = item.note!;
		item.note = value;
		list.update();
		if (getAttributeStore().state.selected === item) {
			write(this.inputs.note, value);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		getAttributeStore().state.changed = true;
	};

	on(attributeEls.get('attribute'), 'close', this.windowClose);
	on(attributeEls.get('attribute'), 'closed', this.windowClosed);
	on(list, 'keydown', this.listKeydown);
	on(list, 'pointerdown', this.listPointerdown);
	on(list, 'pointerdown', Reference.getPointerdownListener!(list), {
		capture: true
	});
	on(list, 'doubleclick', this.listDoubleclick, { capture: true });
	// list select/record/open/popup 经 Vue 模板转发（Attribute.vue @select/@record/@open/@popup → Attribute.list*）
	// name/key input 经 Vue 模板转发（Attribute.vue @input → Attribute.nameInput/keyInput）
	// type write/input 经 Vue 模板转发（Attribute.vue @write/@input → Attribute.typeWrite/typeInput）
	on(this.inputs.enum, 'input', this.enumInput);
	on(this.inputs.note, 'input', this.noteInput);
	on(this.inputs.note, 'compositionend', this.noteInput);
	on(this.panel, 'keydown', this.panelKeydown);
	on(this.searcher, 'input', this.searcherInput);
	on(this.searcher, 'compositionend', this.searcherInput);
};

Attribute.open = function (
	this: typeof Attribute,
	target: AttributeTarget | null | undefined = null,
	mode: string | null | undefined = 'normal'
) {
	const store = getAttributeStore();
	store.open(
		target as { input?: (id: string) => void; [k: string]: unknown } | null,
		mode as string | null
	);
	this.unpackAttribute();
	Window.open!('attribute');

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
	window.addEventListener('keydown', Reference.getKeydownListener!(list, 'attribute'));
};

Attribute.undo = function (this: typeof Attribute) {
	getAttributeStore().undo();
};

Attribute.redo = function (this: typeof Attribute) {
	getAttributeStore().redo();
};

Attribute.createId = function (this: typeof Attribute) {
	return getAttributeStore().createId();
};

Attribute.register = function (this: typeof Attribute, item: AttributeItem) {
	getAttributeStore().register(item as AttributeItemShape);
};

Attribute.unregister = function (this: typeof Attribute, item: AttributeItem) {
	getAttributeStore().unregister(item as AttributeItemShape);
};

Attribute.getItemById = function (this: typeof Attribute, id: string) {
	return getAttributeStore().getItemById(id) as AttributeItem | undefined;
};

Attribute.setFolderGroup = function (
	this: typeof Attribute,
	folder: AttributeItem,
	newGroup: string
) {
	const settings = getAttributeStore().state.settings!;
	const oldGroup = folderGroupOf(settings, folder.id);
	if (oldGroup !== newGroup) {
		const copy = Object.clone(settings);
		if (oldGroup) settings[oldGroup] = '';
		if (newGroup) settings[newGroup] = folder.id;
		(getAttributeStore().state.history as History).save({
			type: 'attribute-settings-change',
			settings: copy
		});
		this.list.update();
		getAttributeStore().state.changed = true;
	}
};

Attribute.getGroup = function (this: typeof Attribute, groupKey: string) {
	return Data.attribute.context.getGroup(groupKey);
};

Attribute.getAttribute = function (this: typeof Attribute, attrId: string) {
	return Data.attribute.context.getAttribute(attrId);
};

Attribute.getGroupAttribute = function (this: typeof Attribute, groupKey: string, attrId: string) {
	return Data.attribute.context.getGroupAttribute(groupKey, attrId);
};

Attribute.getDefAttributeId = function (this: typeof Attribute, groupKey: string, type?: string) {
	return Data.attribute.context.getDefAttributeId(groupKey, type);
};

Attribute.getAttributeItems = function (
	this: typeof Attribute,
	groupKey: string,
	attrType?: string,
	allowNone?: boolean
) {
	return Data.attribute.context.getAttributeItems(groupKey, attrType!, allowNone!);
};

Attribute.openPropertyPanel = function (this: typeof Attribute, attribute: AttributeItem) {
	const panel = this.panel;
	if (getAttributeStore().state.selected !== attribute) {
		getAttributeStore().state.selected = attribute as AttributeItemShape;
		show(panel);
		const { inputs } = this;
		write(inputs.name, attribute.name);
		write(inputs.key, attribute.key);
		write(inputs.type, attribute.type);
		write(inputs.enum, attribute.enum);
		write(inputs.note, attribute.note);
	}
};

Attribute.closePropertyPanel = function (this: typeof Attribute) {
	const panel = this.panel;
	if (getAttributeStore().state.selected) {
		getAttributeStore().state.selected = null;
		hide(panel);
	}
};

Attribute.unpackAttribute = (function IIFE() {
	class ReferencedFolder {
		data: AttributeItem;
		class: string;
		id: string;
		name: string;
		children: AttributeItem[];
		constructor(item: AttributeItem) {
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
			File.planToSave!(Data.manifest.project.attribute);
		}
	}
	const clone = (items: AttributeItem[] | null | undefined): AttributeItem[] => {
		const length = items!.length;
		const copies = Array.from<AttributeItem | ReferencedFolder>({ length: length });
		for (let i = 0; i < length; i++) {
			const item = items![i];
			getAttributeStore().state.idMap![item.id] = true;
			if (item.class !== 'folder') {
				copies[i] = Object.clone(item);
			} else {
				copies[i] = new ReferencedFolder(item);
			}
		}
		return copies as AttributeItem[];
	};
	return function (this: typeof Attribute) {
		getAttributeStore().state.idMap = {};
		getAttributeStore().state.data = clone(Data.attribute.keys) as AttributeItemShape[];
		getAttributeStore().state.settings = Object.clone(Data.attribute.settings);
		if (!getAttributeStore().state.settingKeys) {
			getAttributeStore().state.settingKeys = Object.keys(
				getAttributeStore().state.settings!
			);
		}
	};
})();

Attribute.packAttribute = (function IIFE() {
	const clone = (items: AttributeItem[] | null | undefined): AttributeItem[] => {
		const length = items!.length;
		const copies = Array.from<AttributeItem>({ length: length });
		for (let i = 0; i < length; i++) {
			const item = items![i];
			if (item.class !== 'folder') {
				const copy = Object.clone(item);
				if (copy.enum !== '' && copy.type !== 'enum') {
					copy.enum = '';
				}
				copies[i] = copy;
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
	return function (this: typeof Attribute) {
		Data.attribute.keys = clone(
			getAttributeStore().state.data as unknown as AttributeItem[] | null
		);
		Data.attribute.settings = Object.clone(getAttributeStore().state.settings);
		Data.createAttributeContext();
	};
})();

Attribute.saveHistory = function (
	this: typeof Attribute,
	item: AttributeItem,
	key: string,
	value?: string
) {
	getAttributeStore().saveHistory(item as AttributeItemShape, key, value);
};

Attribute.windowClose = function (this: typeof Attribute, event: Event) {
	this.list.saveScroll();
	if (getAttributeStore().state.changed) {
		event.preventDefault();
		const get = (key: string) => t('confirmation.' + key);
		Window.confirm!(
			{
				message: get('closeUnsavedAttributes')
			},
			[
				{
					label: get('yes'),
					click: () => {
						getAttributeStore().state.changed = false;
						Window.close!('attribute');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
}.bind(Attribute);

Attribute.windowClosed = function (this: typeof Attribute, _event: Event) {
	getAttributeStore().close();
	write(this.searcher, '');
	clear(this.list);
	this.closePropertyPanel();
	window.removeEventListener('keydown', this.keydown);
	window.removeEventListener('keydown', Reference.getKeydownListener!(this.list));
}.bind(Attribute);

Attribute.keydown = Shortcuts.createUndoRedo(Attribute);

Attribute.listKeydown = function (this: TreeListElement, event: KeyboardEvent) {
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
				this.addNodeTo(this.createAttribute(), item);
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

Attribute.listPointerdown = function (this: TreeListElement, event: PointerEvent) {
	switch (event.button) {
		case 0:
			if (event.target === this) {
				this.unselect();
				Attribute.closePropertyPanel();
			}
			break;
		case 3:
			this.cancelSearch();
			break;
	}
};

Attribute.listDoubleclick = function (event: MouseEvent) {
	switch (getAttributeStore().state.mode) {
		case 'group':
			if (read(Attribute.list)?.class === 'folder') {
				getFocus(getAttributeStore().state.target);
				event.stopPropagation();
				Attribute.confirm();
			}
			break;
		case 'attribute':
			if (read(Attribute.list)?.key !== undefined) {
				getFocus(getAttributeStore().state.target);
				event.stopPropagation();
				Attribute.confirm();
			}
			break;
	}
};

Attribute.listSelect = function (event: Event) {
	const item = event.value;
	return item.class !== 'folder'
		? Attribute.openPropertyPanel(item)
		: Attribute.closePropertyPanel();
};

Attribute.listRecord = function (event: Event) {
	getAttributeStore().state.changed = true;
	const response = event.value;
	switch (response.type) {
		case 'rename': {
			// 如果是属性则执行操作否则进入默认分支
			const { item, oldValue, newValue } = response;
			if (getAttributeStore().state.selected === item) {
				write(Attribute.inputs.name, newValue);
				Attribute.saveHistory(item, 'name', oldValue);
				break;
			}
		}
		default:
			(getAttributeStore().state.history as History).save({
				type: 'attribute-list-operation',
				response: response
			});
			break;
	}
};

Attribute.listOpen = function (event: MouseEvent) {
	Attribute.listDoubleclick(event);
};

Attribute.listPopup = function (event: Event & { clientX: number; clientY: number }) {
	const list = Attribute.list!;
	const item = event.value;
	const selected = !!item;
	const copyable = selected && item.class !== 'folder';
	const pastable = (GlobalClipboard as unknown as Clipboard).has('yami.data.attribute');
	const undoable = (getAttributeStore().state.history as History).canUndo();
	const redoable = (getAttributeStore().state.history as History).canRedo();
	const get = (key: string) => t('menuAttributeList.' + key);
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
					label: get('create.attribute'),
					accelerator: 'Insert',
					click: () => {
						list.addNodeTo(list.createAttribute(), item);
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
				Attribute.undo();
			}
		},
		{
			label: get('redo'),
			accelerator: ctrl('Y'),
			enabled: redoable,
			click: () => {
				Attribute.redo();
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
		const group = folderGroupOf(getAttributeStore().state.settings, item.id);
		const submenu = [
			{
				label: get('set-as.none'),
				checked: group === '',
				click: () => {
					Attribute.setFolderGroup(item, '');
				}
			}
		];
		for (const groupKey of getAttributeStore().state.settingKeys ?? []) {
			submenu.push({
				label: get('set-as.' + groupKey),
				checked: group === groupKey,
				click: () => {
					Attribute.setFolderGroup(item, groupKey);
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

Attribute.nameInput = function (event: InputEvent & { target: HTMLInputElement }) {
	const item = getAttributeStore().state.selected as AttributeItem;
	if (item.class !== 'folder') {
		Attribute.saveHistory(item, 'name', item.name);
		item.name = event.target.value;
		Attribute.list!.updateItemName(item);
		getAttributeStore().state.changed = true;
	}
};

Attribute.keyInput = function (event: InputEvent & { target: HTMLInputElement }) {
	const item = getAttributeStore().state.selected as AttributeItem;
	if (item.class !== 'folder') {
		Attribute.saveHistory(item, 'key', item.key);
		item.key = event.target.value;
		Attribute.list!.update();
		getAttributeStore().state.changed = true;
	}
};

Attribute.typeWrite = function (event: Event) {
	const { style } = Attribute.inputs.enumBox!;
	switch (event.value) {
		case 'enum':
			style.visibility = 'visible';
			break;
		case 'boolean':
		case 'number':
		case 'string':
		case 'object':
			style.visibility = 'hidden';
			break;
	}
};

Attribute.typeInput = function (event: Event) {
	const item = getAttributeStore().state.selected as AttributeItem;
	if (item === null) return;
	Attribute.saveHistory(item, 'type', item.type);
	item.type = event.value;
	Attribute.list!.update();
	getAttributeStore().state.changed = true;
};

Attribute.enumInput = function (event: Event) {
	const item = getAttributeStore().state.selected as AttributeItem;
	Attribute.saveHistory(item, 'enum', item.enum);
	item.enum = event.value;
	getAttributeStore().state.changed = true;
};

Attribute.noteInput = function (this: HTMLElement, event: InputEvent) {
	if (event.inputType !== 'insertCompositionText') {
		const item = getAttributeStore().state.selected as AttributeItem;
		Attribute.saveHistory(item, 'note', item.note);
		item.note = read(this);
		Attribute.list!.update();
		getAttributeStore().state.changed = true;
	}
};

Attribute.panelKeydown = function (event: KeyboardEvent) {
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

Attribute.searcherInput = function (this: TextBox, event: InputEvent) {
	if (event.inputType === 'insertCompositionText') {
		return;
	}
	const text = this.input!.value;
	Attribute.list!.searchNodesDebounced(text);
};

Attribute.confirm = function (this: typeof Attribute, _event?: Event) {
	switch (getAttributeStore().state.mode) {
		case 'normal':
			this.apply();
			break;
		case 'group': {
			const item = read(this.list);
			if (item && item.class !== 'folder') {
				return getFocus(this.list);
			}
			this.apply();
			getAttributeStore().state.target?.input?.(item ? item.id : '');
			break;
		}
		case 'attribute': {
			const item = read(this.list);
			if (item && item.class === 'folder') {
				return getFocus(this.list);
			}
			this.apply();
			getAttributeStore().state.target?.input?.(item ? item.id : '');
			break;
		}
	}
	Window.close!('attribute');
}.bind(Attribute);

Attribute.apply = function (this: typeof Attribute, _event?: Event) {
	if (getAttributeStore().state.changed) {
		getAttributeStore().state.changed = false;

		this.packAttribute();
		File.planToSave!(Data.manifest.project.attribute);
	}
}.bind(Attribute);

// bindListClipboardMethods 改为 ensureDomBound 内调用（list 顶层为 null）

// 列表 - 保存滚动状态
Attribute.list_saveScroll = function (this: TreeListElement) {
	const { attribute } = Data;
	// 将数据保存在外部可以切换项目后重置
	if (attribute.scrollTop === undefined) {
		Object.defineProperty(attribute, 'scrollTop', {
			writable: true,
			value: 0
		});
	}
	attribute.scrollTop = this.scrollTop;
};

// 列表 - 恢复滚动状态
Attribute.list_restoreScroll = function (this: TreeListElement) {
	this.scrollTop = Data.attribute.scrollTop ?? 0;
};

// 列表 - 取消搜索
Attribute.list_cancelSearch = function (this: TreeListElement) {
	if (this.display === 'search') {
		const active = document.activeElement;
		Attribute.searcher!.deleteInputContent();
		this.expandToSelection();
		this.scrollToSelection();
		active!.focus();
	}
};

// 列表 - 创建文件夹
Attribute.list_createFolder = function () {
	return {
		class: 'folder',
		id: Attribute.createId(),
		name: 'New Folder',
		expanded: false,
		children: []
	};
};

// 列表 - 创建属性
Attribute.list_createAttribute = function () {
	return {
		id: Attribute.createId(),
		key: '',
		type: 'number',
		name: 'Attribute',
		enum: '',
		note: ''
	};
};

// 列表 - 重写解析名称方法
Attribute.list_parseName = function (item: AttributeItem) {
	return GameLocal.replace(item.name);
};

// 列表 - 在创建数据时回调
Attribute.list_onCreate = function (item: AttributeItem) {
	Attribute.register(item);
};

// 列表 - 在删除数据时回调
Attribute.list_onDelete = function (item: AttributeItem) {
	Attribute.unregister(item);
};

// 列表 - 在恢复数据时回调
Attribute.list_onResume = function (item: AttributeItem) {
	Attribute.register(item);
};

for (const key of attributeStateKeys) {
	Object.defineProperty(Attribute, key, {
		get: () => getAttributeStore().state[key],
		set: (value: unknown) => {
			(getAttributeStore().state as unknown as Record<string, unknown>)[key] = value;
		},
		configurable: true
	});
}
