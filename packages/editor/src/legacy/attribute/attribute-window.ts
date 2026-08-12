import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { addClass, clear, getFocus, hide, on, read, show, write } from '@/util/element-utils.ts';
import { ctrl } from '@/util/event-accessors.ts';
import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Shortcuts } from '@/tools/shortcut-registry.ts';
import { Menu } from '@/components/menu-list.ts';
import { GUID } from '@/file/guid.ts';
import { GameLocal } from '@/local/local-object.ts';
import { Reference } from '@/log/related-references.ts';
import { History } from '@/tools/history.ts';
import { Local } from '@/tools/localization.ts';
import { UndoManager } from '@/tools/undo-manager.ts';

import { bindListClipboardMethods } from '@/tools/list-clipboard-methods.ts';
import { RadioProxy } from '@/components/radio-proxy.ts';
import { type MenuItem } from '@ui-kit';
import { type TreeListElement } from '@/components/tree-list.ts';
const attributeStateKeys = [
	'mode',
	'target',
	'data',
	'idMap',
	'settings',
	'settingKeys',
	'history',
	'changed'
] as const;
import { getAttributeStore } from '@app/stores/attribute';

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
	element?: HTMLElement & {
		group?: string;
		groupText?: HTMLElement;
		initText?: HTMLElement;
		attrKey?: string;
		nodeIcon?: HTMLElement;
		noteIcon?: HTMLElement;
		annotated?: boolean | null;
	};
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
	panel: HTMLElement & { attribute?: AttributeItem | null };
	searcher: HTMLElement;
	inputs: {
		name: HTMLElement | null;
		key: HTMLElement | null;
		note: HTMLElement | null;
		enum: HTMLElement | null;
		enumBox: HTMLElement | null;
		type: HTMLElement | null;
	};
	mode: string | null;
	target: AttributeTarget | null;
	data: AttributeItem[] | null;
	idMap: Record<string, boolean>;
	settings: Record<string, string>;
	settingKeys: string[];
	history: History;
	changed: boolean;
	_previousActive: ReturnType<typeof UndoManager.getActive>;
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
	list_createIcon: (this: typeof Attribute, item: AttributeItem) => HTMLElement;
	list_updateIcon: (this: TreeListElement, item: AttributeItem) => void;
	list_parseName: (this: typeof Attribute, item: AttributeItem) => string;
	list_addElementClass: (this: typeof Attribute, item: AttributeItem) => void;
	list_createGroupText: (this: typeof Attribute, item: AttributeItem) => void;
	list_updateGroupText: (this: typeof Attribute, item: AttributeItem) => void;
	list_createInitText: (this: typeof Attribute, item: AttributeItem) => void;
	list_updateInitText: (this: typeof Attribute, item: AttributeItem) => void;
	list_createNoteIcon: (this: typeof Attribute, item: AttributeItem) => void;
	list_updateNoteIcon: (this: typeof Attribute, item: AttributeItem) => void;
	list_onCreate: (this: typeof Attribute, item: AttributeItem) => void;
	list_onDelete: (this: typeof Attribute, item: AttributeItem) => void;
	list_onResume: (this: typeof Attribute, item: AttributeItem) => void;
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
	mode: null,
	target: null,
	data: null,
	idMap: null as unknown as AttributeWindowShape['idMap'],
	settings: null as unknown as AttributeWindowShape['settings'],
	settingKeys: null as unknown as AttributeWindowShape['settingKeys'],
	history: null as unknown as AttributeWindowShape['history'],
	changed: false,
	_previousActive: null,
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
	list_createIcon: null as unknown as AttributeWindowShape['list_createIcon'],
	list_updateIcon: null as unknown as AttributeWindowShape['list_updateIcon'],
	list_parseName: null as unknown as AttributeWindowShape['list_parseName'],
	list_addElementClass: null as unknown as AttributeWindowShape['list_addElementClass'],
	list_createGroupText: null as unknown as AttributeWindowShape['list_createGroupText'],
	list_updateGroupText: null as unknown as AttributeWindowShape['list_updateGroupText'],
	list_createInitText: null as unknown as AttributeWindowShape['list_createInitText'],
	list_updateInitText: null as unknown as AttributeWindowShape['list_updateInitText'],
	list_createNoteIcon: null as unknown as AttributeWindowShape['list_createNoteIcon'],
	list_updateNoteIcon: null as unknown as AttributeWindowShape['list_updateNoteIcon'],
	list_onCreate: null as unknown as AttributeWindowShape['list_onCreate'],
	list_onDelete: null as unknown as AttributeWindowShape['list_onDelete'],
	list_onResume: null as unknown as AttributeWindowShape['list_onResume']
};

function ensureDomBound() {
	if (Attribute.list) return;
	const list = $('#attribute-list');
	if (!list) return;
	Attribute.list = list;
	Attribute.panel = $('#attribute-properties-flex');
	hide(Attribute.panel);
	Attribute.searcher = $('#attribute-searcher');
	Attribute.inputs.name = $('#attribute-name');
	Attribute.inputs.key = $('#attribute-key');
	Attribute.inputs.note = $('#attribute-note');
	Attribute.inputs.enum = $('#attribute-enum');
	Attribute.inputs.enumBox = $('#attribute-enum-box');
	list.copy = null as unknown as (...args: unknown[]) => void;
	list.paste = null as unknown as (...args: unknown[]) => void;
	list.delete = null as unknown as (...args: unknown[]) => void;
	list.saveScroll = Attribute.list_saveScroll;
	list.restoreScroll = Attribute.list_restoreScroll;
	list.cancelSearch = Attribute.list_cancelSearch;
	list.createFolder = Attribute.list_createFolder;
	list.createAttribute = Attribute.list_createAttribute;
	list.createIcon = Attribute.list_createIcon as (item: unknown) => unknown;
	list.updateIcon = Attribute.list_updateIcon as (item: unknown) => unknown;
	list.parseName = Attribute.list_parseName;
	list.addElementClass = Attribute.list_addElementClass;
	list.createGroupText = Attribute.list_createGroupText;
	list.updateGroupText = Attribute.list_updateGroupText;
	list.createInitText = Attribute.list_createInitText;
	list.updateInitText = Attribute.list_updateInitText;
	list.createNoteIcon = Attribute.list_createNoteIcon;
	list.updateNoteIcon = Attribute.list_updateNoteIcon;
	list.onCreate = Attribute.list_onCreate;
	list.onDelete = Attribute.list_onDelete;
	list.onResume = Attribute.list_onResume;
	bindListClipboardMethods({
		module: Attribute,
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
	list.removable = true;
	list.renamable = true;
	list.bind(() => this.data);
	list.creators?.push(list.addElementClass);
	list.creators?.push(list.createGroupText);
	list.updaters?.push(list.updateGroupText);
	list.creators?.push(list.createInitText);
	list.creators?.push(list.updateInitText);
	list.creators?.push(list.createNoteIcon);
	list.creators?.push(list.updateNoteIcon);

	this.panel.attribute = null;

	this.searcher.addCloseButton();

	History.processors['attribute-list-operation'] = (
		operation: string,
		data: AttributeHistoryData
	) => {
		const { response } = data;
		list.restore(operation, response);
		if (read(list) === null && this.panel.attribute !== null) {
			this.closePropertyPanel();
		}
		this.changed = true;
	};
	History.processors['attribute-settings-change'] = (
		operation: string,
		data: AttributeHistoryData
	) => {
		const { settings } = data;
		data.settings = this.settings;
		this.settings = settings;
		list.update();
		this.changed = true;
	};
	History.processors['attribute-name-change'] = (
		operation: string,
		data: AttributeHistoryData
	) => {
		const { item, value } = data;
		data.value = item.name;
		item.name = value;
		list.updateItemName(item);
		if (this.panel.attribute === item) {
			write(this.inputs.name, value);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		this.changed = true;
	};
	History.processors['attribute-key-change'] = (
		operation: string,
		data: AttributeHistoryData
	) => {
		const { item, value } = data;
		data.value = item.key!;
		item.key = value;
		list.updateInitText(item);
		if (this.panel.attribute === item) {
			write(this.inputs.key, value);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		this.changed = true;
	};
	History.processors['attribute-type-change'] = (
		operation: string,
		data: AttributeHistoryData
	) => {
		const { item, value } = data;
		data.value = item.type!;
		item.type = value;
		list.updateIcon(item);
		if (this.panel.attribute === item) {
			write(this.inputs.type, value);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		this.changed = true;
	};
	History.processors['attribute-enum-change'] = (
		operation: string,
		data: AttributeHistoryData
	) => {
		const { item, value } = data;
		data.value = item.enum!;
		item.enum = value;
		if (this.panel.attribute === item) {
			write(this.inputs.enum, value);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		this.changed = true;
	};
	History.processors['attribute-note-change'] = (
		operation: string,
		data: AttributeHistoryData
	) => {
		const { item, value } = data;
		data.value = item.note!;
		item.note = value;
		list.updateNoteIcon(item);
		if (this.panel.attribute === item) {
			write(this.inputs.note, value);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		this.changed = true;
	};

	on($('#attribute'), 'close', this.windowClose);
	on($('#attribute'), 'closed', this.windowClosed);
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
	on($('#attribute-confirm'), 'click', this.confirm);
	on($('#attribute-apply'), 'click', this.apply);
};

Attribute.open = function (
	this: typeof Attribute,
	target: AttributeTarget | null | undefined = null,
	mode: string | null | undefined = 'normal'
) {
	this.mode = mode;
	this.target = target;
	this._previousActive = UndoManager.getActive();
	this.history = new History(100);
	UndoManager.setActive(this);
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
	if (this.history.canUndo()) {
		this.history.restore('undo');
	}
};

Attribute.redo = function (this: typeof Attribute) {
	if (this.history.canRedo()) {
		this.history.restore('redo');
	}
};

Attribute.createId = function (this: typeof Attribute) {
	let id;
	do {
		id = GUID.generate64bit();
	} while (this.idMap[id]);
	return id;
};

Attribute.register = function (this: typeof Attribute, item: AttributeItem) {
	Attribute.idMap[item.id] = true;
	if (item.class === 'folder') {
		for (const child of item.children!) {
			Attribute.register(child);
		}
	}
};

Attribute.unregister = function (this: typeof Attribute, item: AttributeItem) {
	delete Attribute.idMap[item.id];
	if (item.class === 'folder') {
		for (const child of item.children!) {
			Attribute.unregister(child);
		}
	}
};

Attribute.getItemById = (function IIFE() {
	const find = (
		items: AttributeItem[] | null | undefined,
		id: string
	): AttributeItem | undefined => {
		const length = items!.length;
		for (let i = 0; i < length; i++) {
			const item = items![i];
			if (item.id === id) {
				return item;
			}
			if (item.class === 'folder') {
				const result = find(item.children, id);
				if (result !== undefined) {
					return result;
				}
			}
		}
		return undefined;
	};
	return function (this: typeof Attribute, id: string) {
		return find(this.data, id);
	};
})();

Attribute.setFolderGroup = function (
	this: typeof Attribute,
	folder: AttributeItem,
	newGroup: string
) {
	const oldGroup = folder.element!.group;
	if (oldGroup !== newGroup) {
		const settings = Object.clone(this.settings);
		if (oldGroup) this.settings[oldGroup] = '';
		if (newGroup) this.settings[newGroup] = folder.id;
		this.history.save({
			type: 'attribute-settings-change',
			settings: settings
		});
		this.list.update();
		this.changed = true;
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
	if (panel.attribute !== attribute) {
		panel.attribute = attribute;
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
	if (panel.attribute) {
		panel.attribute = null;
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
		const copies = new Array(length);
		for (let i = 0; i < length; i++) {
			const item = items![i];
			Attribute.idMap[item.id] = true;
			if (item.class !== 'folder') {
				copies[i] = Object.clone(item);
			} else {
				copies[i] = new ReferencedFolder(item);
			}
		}
		return copies;
	};
	return function (this: typeof Attribute) {
		this.idMap = {};
		this.data = clone(Data.attribute.keys);
		this.settings = Object.clone(Data.attribute.settings);
		if (!this.settingKeys) {
			this.settingKeys = Object.keys(this.settings);
		}
	};
})();

Attribute.packAttribute = (function IIFE() {
	const clone = (items: AttributeItem[] | null | undefined): AttributeItem[] => {
		const length = items!.length;
		const copies = new Array(length);
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
		Data.attribute.keys = clone(this.data);
		Data.attribute.settings = Object.clone(this.settings);
		Data.createAttributeContext();
	};
})();

Attribute.saveHistory = function (
	this: typeof Attribute,
	item: AttributeItem,
	key: string,
	value?: string
) {
	const type = `attribute-${key}-change`;
	const history = this.history;
	const index = history.index;
	const length = history.length;
	const record = history[index];
	if (
		index !== length - 1 ||
		record === undefined ||
		record.type !== type ||
		record.item !== item
	) {
		history.save({
			type: type,
			item: item,
			value: value
		});
	}
};

Attribute.windowClose = function (this: typeof Attribute, event: Event) {
	this.list.saveScroll();
	if (this.changed) {
		event.preventDefault();
		const get = Local.createGetter!('confirmation');
		Window.confirm!(
			{
				message: get('closeUnsavedAttributes')
			},
			[
				{
					label: get('yes'),
					click: () => {
						this.changed = false;
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

Attribute.windowClosed = function (this: typeof Attribute, event: Event) {
	this.data = null;
	this.idMap = null as unknown as Record<string, boolean>;
	UndoManager.setActive(this._previousActive);
	this._previousActive = null;
	this.history = null as unknown as History;
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
	switch (Attribute.mode) {
		case 'group':
			if (read(Attribute.list)?.class === 'folder') {
				getFocus(Attribute.target);
				event.stopPropagation();
				Attribute.confirm();
			}
			break;
		case 'attribute':
			if (read(Attribute.list)?.key !== undefined) {
				getFocus(Attribute.target);
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
	Attribute.changed = true;
	const response = event.value;
	switch (response.type) {
		case 'rename': {
			// 如果是属性则执行操作否则进入默认分支
			const { item, oldValue, newValue } = response;
			if (Attribute.panel!.attribute === item) {
				write(Attribute.inputs.name, newValue);
				Attribute.saveHistory(item, 'name', oldValue);
				break;
			}
		}
		default:
			Attribute.history!.save({
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
	const pastable = (Clipboard as unknown as Clipboard).has('yami.data.attribute');
	const undoable = Attribute.history!.canUndo();
	const redoable = Attribute.history!.canRedo();
	const get = Local.createGetter!('menuAttributeList');
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
				navigator.clipboard.writeText(item.id);
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
		const group = item.element.group;
		const submenu = [
			{
				label: get('set-as.none'),
				checked: group === '',
				click: () => {
					Attribute.setFolderGroup(item, '');
				}
			}
		];
		for (const groupKey of Attribute.settingKeys) {
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
	const item = Attribute.panel!.attribute!;
	if (item.class !== 'folder') {
		Attribute.saveHistory(item, 'name', item.name);
		item.name = event.target.value;
		Attribute.list!.updateItemName(item);
		Attribute.changed = true;
	}
};

Attribute.keyInput = function (event: InputEvent & { target: HTMLInputElement }) {
	const item = Attribute.panel!.attribute!;
	if (item.class !== 'folder') {
		Attribute.saveHistory(item, 'key', item.key);
		item.key = event.target.value;
		Attribute.list!.updateInitText(item);
		Attribute.changed = true;
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
	const item = Attribute.panel!.attribute!;
	if (item === null) return;
	Attribute.saveHistory(item, 'type', item.type);
	item.type = event.value;
	Attribute.list!.updateIcon(item);
	Attribute.changed = true;
};

Attribute.enumInput = function (event: Event) {
	const item = Attribute.panel!.attribute!;
	Attribute.saveHistory(item, 'enum', item.enum);
	item.enum = event.value;
	Attribute.changed = true;
};

Attribute.noteInput = function (this: HTMLElement, event: InputEvent) {
	if (event.inputType !== 'insertCompositionText') {
		const item = Attribute.panel!.attribute!;
		Attribute.saveHistory(item, 'note', item.note);
		item.note = read(this);
		Attribute.list!.updateNoteIcon(item);
		Attribute.changed = true;
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

Attribute.confirm = function (this: typeof Attribute, event?: Event) {
	switch (this.mode) {
		case 'normal':
			this.apply();
			break;
		case 'group': {
			const item = read(this.list);
			if (item && item.class !== 'folder') {
				return getFocus(this.list);
			}
			this.apply();
			this.target?.input?.(item ? item.id : '');
			break;
		}
		case 'attribute': {
			const item = read(this.list);
			if (item && item.class === 'folder') {
				return getFocus(this.list);
			}
			this.apply();
			this.target?.input?.(item ? item.id : '');
			break;
		}
	}
	Window.close!('attribute');
}.bind(Attribute);

Attribute.apply = function (this: typeof Attribute, event?: Event) {
	if (this.changed) {
		this.changed = false;

		this.packAttribute();
		File.planToSave!(Data.manifest.project.attribute);

		window.dispatchEvent(new Event('attributechange'));
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

// 列表 - 重写创建图标方法
Attribute.list_createIcon = (function IIFE() {
	const classes = {
		boolean: 'icon-boolean',
		number: 'icon-number',
		string: 'icon-string',
		enum: 'icon-string',
		object: 'icon-object'
	};
	return function (item: AttributeItem) {
		const icon = document.createElement('node-icon');
		if (item.class !== 'folder') {
			addClass(icon, (classes as Record<string, string>)[item.type!]);
		} else {
			addClass(icon, 'icon-folder');
		}
		return icon;
	};
})();

// 列表 - 更新图标
Attribute.list_updateIcon = function (this: TreeListElement, item: AttributeItem) {
	const { element } = item;
	if (element?.nodeIcon) {
		const icon = this.createIcon(item) as HTMLElement;
		element.replaceChild(icon, element.nodeIcon);
		element.nodeIcon = icon;
	}
};

// 列表 - 重写解析名称方法
Attribute.list_parseName = function (item: AttributeItem) {
	return GameLocal.replace(item.name);
};

// 列表 - 添加元素类名
Attribute.list_addElementClass = function (item: AttributeItem) {
	addClass(item.element, 'attribute-item');
	addClass(item.element, 'reference');
};

// 列表 - 创建分组文本
Attribute.list_createGroupText = function (item: AttributeItem) {
	if (item.class === 'folder') {
		const element = item.element!;
		const groupText = document.createElement('div');
		addClass(groupText, 'enum-init-text');
		addClass(groupText, 'text');
		element.appendChild(groupText);
		element.groupText = groupText;
		element.group = '';
	}
};

// 列表 - 更新分组文本
Attribute.list_updateGroupText = function (item: AttributeItem) {
	const { element } = item;
	if (element?.groupText !== undefined) {
		let group = '';
		for (const key of Attribute.settingKeys) {
			if (item.id === Attribute.settings[key]) {
				group = key;
			}
		}
		if (element.group !== group) {
			element.group = group;
			element.groupText.textContent = group ? ' ★' : '';
		}
	}
};

// 列表 - 创建初始化文本
Attribute.list_createInitText = function (item: AttributeItem) {
	if (item.class !== 'folder') {
		const element = item.element!;
		const initText = document.createElement('div');
		addClass(initText, 'attribute-init-text');
		addClass(initText, 'text');
		element.appendChild(initText);
		element.initText = initText;
		element.attrKey = '';
	}
};

// 列表 - 更新初始化文本
Attribute.list_updateInitText = function (item: AttributeItem) {
	const { element } = item;
	if (element?.initText !== undefined) {
		const { key } = item;
		if (element.attrKey !== key) {
			element.attrKey = key;
			element.initText.textContent = key ? ` = ${key}` : '';
		}
	}
};

// 列表 - 创建笔记图标
Attribute.list_createNoteIcon = function (item: AttributeItem) {
	if (item.class !== 'folder') {
		const element = item.element!;
		const noteIcon = document.createElement('node-icon');
		addClass(noteIcon, 'icon-note');
		noteIcon.textContent = '\uf27b';
		element.appendChild(noteIcon);
		element.noteIcon = noteIcon;
		element.annotated = null;
	}
};

// 列表 - 更新笔记图标
Attribute.list_updateNoteIcon = function (item: AttributeItem) {
	const { element } = item;
	if (element?.noteIcon !== undefined) {
		const annotated = item.note !== '';
		if (element.annotated !== annotated) {
			element.annotated = annotated;
			annotated ? show(element.noteIcon) : hide(element.noteIcon);
		}
	}
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
