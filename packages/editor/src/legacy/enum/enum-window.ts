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
import { type MenuItem } from '@ui-kit';
import { type TreeListElement } from '@/components/tree-list.ts';
const enumStateKeys = [
	'mode',
	'target',
	'data',
	'idMap',
	'settings',
	'settingKeys',
	'history',
	'changed'
] as const;
import { getEnumStore } from '@app/stores/enum';

interface EnumItem {
	id: string;
	class?: string;
	name: string;
	value?: string;
	note?: string;
	expanded?: boolean;
	children?: EnumItem[];
	element?: HTMLElement & {
		group?: string;
		groupText?: HTMLElement;
		initText?: HTMLElement;
		attrValue?: string;
		noteIcon?: HTMLElement;
		annotated?: boolean | null;
	};
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
	list: TreeListElement | null;
	panel: (HTMLElement & { enumString?: EnumItem | null }) | null;
	searcher: HTMLElement | null;
	inputs: {
		name: HTMLElement | null;
		value: HTMLElement | null;
		note: HTMLElement | null;
	};
	mode: string | null;
	target: EnumTarget | null;
	data: EnumItem[] | null;
	idMap: Record<string, boolean>;
	settings: Record<string, string>;
	settingKeys: string[];
	history: History | null;
	changed: boolean;
	initialize: any;
	open: any;
	undo: any;
	redo: any;
	createId: any;
	register: any;
	unregister: any;
	getItemById: any;
	setFolderGroup: any;
	getGroup: any;
	getString: any;
	getGroupString: any;
	getDefStringId: any;
	getStringItems: any;
	getMergedItems: any;
	openPropertyPanel: any;
	closePropertyPanel: any;
	unpackEnumeration: any;
	packEnumeration: any;
	saveHistory: any;
	windowClose: any;
	windowClosed: any;
	keydown: any;
	listKeydown: any;
	listPointerdown: any;
	listDoubleclick: any;
	listSelect: any;
	listRecord: any;
	listOpen: any;
	listPopup: any;
	nameInput: any;
	valueInput: any;
	noteInput: any;
	panelKeydown: any;
	searcherInput: any;
	confirm: any;
	apply: any;
}

export const Enum: EnumModule = {
	list: null,
	panel: null,
	searcher: null,
	inputs: {
		name: null,
		value: null,
		note: null
	},
	mode: null,
	target: null,
	data: null,
	idMap: null as unknown as Record<string, boolean>,
	settings: null as unknown as Record<string, string>,
	settingKeys: null as unknown as string[],
	history: null,
	changed: false,
	initialize: null,
	open: null,
	undo: null,
	redo: null,
	createId: null,
	register: null,
	unregister: null,
	getItemById: null,
	setFolderGroup: null,
	getGroup: null,
	getString: null,
	getGroupString: null,
	getDefStringId: null,
	getStringItems: null,
	getMergedItems: null,
	openPropertyPanel: null,
	closePropertyPanel: null,
	unpackEnumeration: null,
	packEnumeration: null,
	saveHistory: null,
	windowClose: null,
	windowClosed: null,
	keydown: null,
	listKeydown: null,
	listPointerdown: null,
	listDoubleclick: null,
	listSelect: null,
	listRecord: null,
	listOpen: null,
	listPopup: null,
	nameInput: null,
	valueInput: null,
	noteInput: null,
	panelKeydown: null,
	searcherInput: null,
	confirm: null,
	apply: null
};

function ensureDomBound() {
	if (Enum.list) return;
	const list = $('#enum-list');
	if (!list) return;
	Enum.list = list;
	Enum.panel = $('#enum-properties-flex');
	hide(Enum.panel!);
	Enum.searcher = $('#enum-searcher');
	Enum.inputs.name = $('#enum-name');
	Enum.inputs.value = $('#enum-value');
	Enum.inputs.note = $('#enum-note');
	Enum.list.copy = null as unknown as (...args: unknown[]) => any;
	Enum.list.paste = null as unknown as (...args: unknown[]) => any;
	Enum.list.delete = null as unknown as (...args: unknown[]) => any;
	Enum.list.saveScroll = null as unknown as (...args: unknown[]) => any;
	Enum.list.restoreScroll = null as unknown as (...args: unknown[]) => any;
	Enum.list.cancelSearch = null as unknown as (...args: unknown[]) => any;
	Enum.list.createString = null;
	Enum.list.createIcon = null as unknown as (...args: unknown[]) => any;
	Enum.list.parseName = null as unknown as (...args: unknown[]) => any;
	Enum.list.addElementClass = null as unknown as (...args: unknown[]) => any;
	Enum.list.createGroupText = null as unknown as (...args: unknown[]) => any;
	Enum.list.updateGroupText = null as unknown as (...args: unknown[]) => any;
	Enum.list.createInitText = null as unknown as (...args: unknown[]) => any;
	Enum.list.updateInitText = null as unknown as (...args: unknown[]) => any;
	Enum.list.createNoteIcon = null as unknown as (...args: unknown[]) => any;
	Enum.list.updateNoteIcon = null as unknown as (...args: unknown[]) => any;
	Enum.list.onDelete = null;
	Enum.list.onResume = null;
	bindListClipboardMethods({
		module: Enum,
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
			active!.focus();
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
	Enum.list.createIcon = function (item: EnumItem) {
		const icon = document.createElement('node-icon');
		if (item.class !== 'folder') {
			addClass(icon, 'icon-string');
		} else {
			addClass(icon, 'icon-folder');
		}
		return icon;
	} as unknown as (...args: unknown[]) => any;
	Enum.list.parseName = function (item: EnumItem) {
		return GameLocal.replace(item.name);
	};
	Enum.list.addElementClass = function (item: EnumItem) {
		addClass(item.element, 'enum-item');
		addClass(item.element, 'reference');
	};
	Enum.list.createGroupText = function (item: EnumItem) {
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
	Enum.list.updateGroupText = function (item: EnumItem) {
		const { element } = item;
		if (element?.groupText !== undefined) {
			let group = '';
			for (const key of Enum.settingKeys) {
				if (item.id === Enum.settings[key]) {
					group = key;
				}
			}
			if (element.group !== group) {
				element.group = group;
				element.groupText.textContent = group ? ' ★' : '';
			}
		}
	};
	Enum.list.createInitText = function (item: EnumItem) {
		if (item.class !== 'folder') {
			const element = item.element!;
			const initText = document.createElement('div');
			addClass(initText, 'enum-init-text');
			addClass(initText, 'text');
			element.appendChild(initText);
			element.initText = initText;
			element.attrValue = '';
		}
	};
	Enum.list.updateInitText = function (item: EnumItem) {
		const { element } = item;
		if (element?.initText !== undefined) {
			const value = GameLocal.replace(item.value!);
			if (element.attrValue !== value) {
				element.attrValue = value;
				element.initText.textContent = value ? ` = ${value}` : '';
			}
		}
	};
	Enum.list.createNoteIcon = function (item: EnumItem) {
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
	Enum.list.updateNoteIcon = function (item: EnumItem) {
		const { element } = item;
		if (element?.noteIcon !== undefined) {
			const annotated = item.note !== '';
			if (element.annotated !== annotated) {
				element.annotated = annotated;
				annotated ? show(element.noteIcon) : hide(element.noteIcon);
			}
		}
	};
	Enum.list.onCreate = function (item: EnumItem) {
		Enum.register(item);
	};
	Enum.list.onDelete = function (item: EnumItem) {
		Enum.unregister(item);
	};
	Enum.list.onResume = function (item: EnumItem) {
		Enum.register(item);
	};
}

Enum.initialize = function (this: any) {
	ensureDomBound();
	if (!this.list) return;
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

	this.panel.enumString = null;

	this.searcher.addCloseButton();

	History.processors['enum-list-operation'] = (operation: string, data: EnumHistoryData) => {
		const { response } = data;
		list.restore(operation, response);
		if (read(list) === null && this.panel.enumString !== null) {
			this.closePropertyPanel();
		}
		this.changed = true;
	};
	History.processors['enum-settings-change'] = (operation: string, data: EnumHistoryData) => {
		const { settings } = data;
		data.settings = this.settings;
		this.settings = settings;
		list.update();
		this.changed = true;
	};
	History.processors['enum-name-change'] = (operation: string, data: EnumHistoryData) => {
		const { item, value } = data;
		data.value = item.name;
		item.name = value;
		list.updateItemName(item);
		if (this.panel.enumString === item) {
			write(this.inputs.name, value);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		this.changed = true;
	};
	History.processors['enum-value-change'] = (operation: string, data: EnumHistoryData) => {
		const { item, value } = data;
		data.value = item.value!;
		item.value = value;
		list.updateInitText(item);
		if (this.panel.enumString === item) {
			write(this.inputs.value, value);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		this.changed = true;
	};
	History.processors['enum-note-change'] = (operation: string, data: EnumHistoryData) => {
		const { item, value } = data;
		data.value = item.note!;
		item.note = value;
		list.updateNoteIcon(item);
		if (this.panel.enumString === item) {
			write(this.inputs.note, value);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		this.changed = true;
	};

	on($('#enum'), 'close', this.windowClose);
	on($('#enum'), 'closed', this.windowClosed);
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
	on($('#enum-confirm'), 'click', this.confirm);
	on($('#enum-apply'), 'click', this.apply);
};

Enum.open = function (
	this: any,
	target: EnumTarget | null | undefined = null,
	mode: string | null | undefined = 'normal'
) {
	this.mode = mode;
	this.target = target;
	this._previousActive = UndoManager.getActive();
	this.history = new History(100);
	UndoManager.setActive(this);
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

Enum.undo = function (this: any) {
	if (this.history.canUndo()) {
		this.history.restore('undo');
	}
};

Enum.redo = function (this: any) {
	if (this.history.canRedo()) {
		this.history.restore('redo');
	}
};

Enum.createId = function (this: any) {
	let id;
	do {
		id = GUID.generate64bit();
	} while (this.idMap[id]);
	return id;
};

Enum.register = function (this: any, item: EnumItem) {
	Enum.idMap[item.id] = true;
	if (item.class === 'folder') {
		for (const child of item.children!) {
			Enum.register(child);
		}
	}
};

Enum.unregister = function (this: any, item: EnumItem) {
	delete Enum.idMap[item.id];
	if (item.class === 'folder') {
		for (const child of item.children!) {
			Enum.unregister(child);
		}
	}
};

Enum.getItemById = (function IIFE() {
	const find = (items: EnumItem[] | null | undefined, id: string): EnumItem | undefined => {
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
	return function (this: any, id: string) {
		return find(this.data, id);
	};
})();

Enum.setFolderGroup = function (this: any, folder: EnumItem, newGroup: string) {
	const oldGroup = folder.element!.group;
	if (oldGroup !== newGroup) {
		const settings = Object.clone(this.settings);
		if (oldGroup) this.settings[oldGroup] = '';
		if (newGroup) this.settings[newGroup] = folder.id;
		this.history.save({
			type: 'enum-settings-change',
			settings: settings
		});
		this.list.update();
		this.changed = true;
	}
};

Enum.getGroup = function (this: any, groupKey: string) {
	return Data.enumeration.context.getGroup(groupKey);
};

Enum.getString = function (this: any, stringId: string) {
	return Data.enumeration.context.getString(stringId);
};

Enum.getGroupString = function (this: any, groupKey: string, stringId: string) {
	return Data.enumeration.context.getGroupString(groupKey, stringId);
};

Enum.getDefStringId = function (this: any, groupKey: string) {
	return Data.enumeration.context.getDefStringId(groupKey);
};

Enum.getStringItems = function (this: any, groupKey: string, allowNone: boolean = false) {
	return Data.enumeration.context.getStringItems(groupKey, allowNone);
};

Enum.getMergedItems = function (
	this: any,
	headItems: unknown,
	groupKey: string,
	mergedKey: string = 'merged'
) {
	return Data.enumeration.context.getMergedItems(headItems, groupKey, mergedKey);
};

Enum.openPropertyPanel = function (this: any, enumString: EnumItem) {
	const panel = this.panel;
	if (panel.enumString !== enumString) {
		panel.enumString = enumString;
		show(panel);
		const { inputs } = this;
		write(inputs.name, enumString.name);
		write(inputs.value, enumString.value);
		write(inputs.note, enumString.note);
	}
};

Enum.closePropertyPanel = function (this: any) {
	const panel = this.panel;
	if (panel.enumString) {
		panel.enumString = null;
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
		const copies = new Array(length);
		for (let i = 0; i < length; i++) {
			const item = items![i];
			Enum.idMap[item.id] = true;
			if (item.class !== 'folder') {
				copies[i] = Object.clone(item);
			} else {
				copies[i] = new ReferencedFolder(item);
			}
		}
		return copies;
	};
	return function (this: any) {
		this.idMap = {} as Record<string, any>;
		this.data = clone(Data.enumeration.strings);
		this.settings = Object.clone(Data.enumeration.settings);
		if (!this.settingKeys) {
			this.settingKeys = Object.keys(this.settings);
		}
	};
})();

Enum.packEnumeration = (function IIFE() {
	const clone = (items: EnumItem[] | null | undefined): EnumItem[] => {
		const length = items!.length;
		const copies = new Array(length);
		for (let i = 0; i < length; i++) {
			const item = items![i];
			if (item.class !== 'folder') {
				copies[i] = Object.clone(item);
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
	return function (this: any) {
		Data.enumeration.strings = clone(this.data);
		Data.enumeration.settings = Object.clone(this.settings);
		Data.createEnumerationContext();
	};
})();

Enum.saveHistory = function (this: any, item: EnumItem, key: string, value?: string) {
	const type = `enum-${key}-change`;
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

Enum.windowClose = function (this: any, event: Event) {
	this.list.saveScroll();
	if (this.changed) {
		event.preventDefault();
		const get = Local.createGetter!('confirmation');
		Window.confirm!(
			{
				message: get('closeUnsavedEnumeration')
			},
			[
				{
					label: get('yes'),
					click: () => {
						this.changed = false;
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

Enum.windowClosed = function (this: any, event: Event) {
	this.data = null;
	this.idMap = null;
	this.settings = null;
	UndoManager.setActive(this._previousActive);
	this._previousActive = null;
	this.history = null;
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
	switch (Enum.mode) {
		case 'group':
			if (read(Enum.list)?.class === 'folder') {
				getFocus(Enum.target);
				event.stopPropagation();
				Enum.confirm();
			}
			break;
		case 'string':
			if (read(Enum.list)?.value !== undefined) {
				getFocus(Enum.target);
				event.stopPropagation();
				Enum.confirm();
			}
			break;
	}
};

Enum.listSelect = function (event: Event) {
	const item = event.value;
	return item.class !== 'folder' ? Enum.openPropertyPanel(item) : Enum.closePropertyPanel();
};

Enum.listRecord = function (event: Event) {
	Enum.changed = true;
	const response = event.value;
	switch (response.type) {
		case 'rename': {
			// 如果是字符串则执行操作否则进入默认分支
			const { item, oldValue, newValue } = response;
			if (Enum.panel!.enumString === item) {
				write(Enum.inputs.name, newValue);
				Enum.saveHistory(item, 'name', oldValue);
				break;
			}
		}
		default:
			Enum.history!.save({
				type: 'enum-list-operation',
				response: response
			});
			break;
	}
};

Enum.listOpen = function (event: any) {
	Enum.listDoubleclick(event);
};

Enum.listPopup = function (event: Event & { clientX: number; clientY: number }) {
	const list = Enum.list!;
	const item = event.value;
	const selected = !!item;
	const copyable = selected && item.class !== 'folder';
	const pastable = (Clipboard as unknown as Clipboard).has('yami.data.enumeration');
	const undoable = Enum.history!.canUndo();
	const redoable = Enum.history!.canRedo();
	const get = Local.createGetter!('menuEnumList');
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
					Enum.setFolderGroup(item, '');
				}
			}
		];
		for (const groupKey of Enum.settingKeys) {
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

Enum.nameInput = function (event: any) {
	const item = Enum.panel!.enumString!;
	if (item.class !== 'folder') {
		Enum.saveHistory(item, 'name', item.name);
		item.name = event.target.value;
		Enum.list!.updateItemName(item);
		Enum.changed = true;
	}
};

Enum.valueInput = function (event: any) {
	const item = Enum.panel!.enumString!;
	if (item.class !== 'folder') {
		Enum.saveHistory(item, 'value', item.value);
		item.value = event.target.value;
		Enum.list!.updateInitText(item);
		Enum.changed = true;
	}
};

Enum.noteInput = function (this: HTMLElement, event: InputEvent) {
	if (event.inputType !== 'insertCompositionText') {
		const item = Enum.panel!.enumString!;
		Enum.saveHistory(item, 'note', item.note);
		item.note = read(this);
		Enum.list!.updateNoteIcon(item);
		Enum.changed = true;
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

Enum.searcherInput = function (this: TextBox, event: InputEvent) {
	if (event.inputType === 'insertCompositionText') {
		return;
	}
	const text = this.input!.value;
	Enum.list!.searchNodesDebounced(text);
};

Enum.confirm = function (this: any, event?: Event) {
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
		case 'string': {
			const item = read(this.list);
			if (item && item.class === 'folder') {
				return getFocus(this.list);
			}
			this.apply();
			this.target?.input?.(item ? item.id : '');
			break;
		}
	}
	Window.close!('enum');
}.bind(Enum);

Enum.apply = function (this: any, event?: Event) {
	if (this.changed) {
		this.changed = false;

		this.packEnumeration();
		File.planToSave!(Data.manifest.project.enumeration);

		window.dispatchEvent(new Event('enumchange'));
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
