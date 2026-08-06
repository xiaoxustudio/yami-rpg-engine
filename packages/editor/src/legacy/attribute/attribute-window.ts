import { $ } from '@/util/dom.ts';
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
function getWindow() {
	return (window as any).Window;
}
import { bindListClipboardMethods } from '@/tools/list-clipboard-methods.ts';
import { RadioProxy } from '@/components/radio-proxy.ts';
import { attributeStateKeys, getAttributeStore } from '@app/stores/attribute';

export const Attribute = {
	list: null as any,
	panel: null as any,
	searcher: null as any,
	inputs: {
		name: null as any,
		key: null as any,
		note: null as any,
		enum: null as any,
		enumBox: null
	},
	mode: null as any,
	target: null as any,
	data: null as any,
	idMap: null as any,
	settings: null as any,
	settingKeys: null as any,
	history: null as any,
	changed: false,
	initialize: null as any,
	open: null as any,
	undo: null as any,
	redo: null as any,
	createId: null as any,
	register: null as any,
	unregister: null as any,
	getItemById: null as any,
	setFolderGroup: null as any,
	getGroup: null as any,
	getAttribute: null as any,
	getGroupAttribute: null as any,
	getDefAttributeId: null as any,
	getAttributeItems: null as any,
	openPropertyPanel: null as any,
	closePropertyPanel: null as any,
	unpackAttribute: null as any,
	packAttribute: null as any,
	saveHistory: null as any,
	windowClose: null as any,
	windowClosed: null as any,
	keydown: null as any,
	listKeydown: null as any,
	listPointerdown: null as any,
	listDoubleclick: null as any,
	listSelect: null as any,
	listRecord: null as any,
	listOpen: null as any,
	listPopup: null as any,
	nameInput: null as any,
	keyInput: null as any,
	typeWrite: null as any,
	typeInput: null as any,
	enumInput: null as any,
	noteInput: null as any,
	panelKeydown: null as any,
	searcherInput: null as any,
	confirm: null as any,
	apply: null as any,
	list_saveScroll: null as any,
	list_restoreScroll: null as any,
	list_cancelSearch: null as any,
	list_createFolder: null as any,
	list_createAttribute: null as any,
	list_createIcon: null as any,
	list_updateIcon: null as any,
	list_parseName: null as any,
	list_addElementClass: null as any,
	list_createGroupText: null as any,
	list_updateGroupText: null as any,
	list_createInitText: null as any,
	list_updateInitText: null as any,
	list_createNoteIcon: null as any,
	list_updateNoteIcon: null as any,
	list_onCreate: null as any,
	list_onDelete: null as any,
	list_onResume: null as any
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
	list.copy = null;
	list.paste = null;
	list.delete = null;
	list.saveScroll = Attribute.list_saveScroll;
	list.restoreScroll = Attribute.list_restoreScroll;
	list.cancelSearch = Attribute.list_cancelSearch;
	list.createFolder = Attribute.list_createFolder;
	list.createAttribute = Attribute.list_createAttribute;
	list.createIcon = Attribute.list_createIcon;
	list.updateIcon = Attribute.list_updateIcon;
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

Attribute.initialize = function () {
	ensureDomBound();
	if (!Attribute.list) return;
	const { list } = this;
	list.removable = true;
	list.renamable = true;
	list.bind(() => this.data);
	list.creators.push(list.addElementClass);
	list.creators.push(list.createGroupText);
	list.updaters.push(list.updateGroupText);
	list.creators.push(list.createInitText);
	list.creators.push(list.updateInitText);
	list.creators.push(list.createNoteIcon);
	list.creators.push(list.updateNoteIcon);

	this.panel.attribute = null;

	this.searcher.addCloseButton();

	History.processors['attribute-list-operation'] = (operation, data) => {
		const { response } = data;
		list.restore(operation, response);
		if (read(list) === null && this.panel.attribute !== null) {
			this.closePropertyPanel();
		}
		this.changed = true;
	};
	History.processors['attribute-settings-change'] = (operation, data) => {
		const { settings } = data;
		data.settings = this.settings;
		this.settings = settings;
		list.update();
		this.changed = true;
	};
	History.processors['attribute-name-change'] = (operation, data) => {
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
	History.processors['attribute-key-change'] = (operation, data) => {
		const { item, value } = data;
		data.value = item.key;
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
	History.processors['attribute-type-change'] = (operation, data) => {
		const { item, value } = data;
		data.value = item.type;
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
	History.processors['attribute-enum-change'] = (operation, data) => {
		const { item, value } = data;
		data.value = item.enum;
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
	History.processors['attribute-note-change'] = (operation, data) => {
		const { item, value } = data;
		data.value = item.note;
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
	on(list, 'pointerdown', Reference.getPointerdownListener(list), {
		capture: true
	});
	on(list, 'doubleclick', this.listDoubleclick, { capture: true });
	on(list, 'select', this.listSelect);
	on(list, 'record', this.listRecord);
	on(list, 'open', this.listOpen);
	on(list, 'popup', this.listPopup);
	on(this.inputs.name, 'input', this.nameInput);
	on(this.inputs.key, 'input', this.keyInput);
	on(this.inputs.type, 'write', this.typeWrite);
	on(this.inputs.type, 'input', this.typeInput);
	on(this.inputs.enum, 'input', this.enumInput);
	on(this.inputs.note, 'input', this.noteInput);
	on(this.inputs.note, 'compositionend', this.noteInput);
	on(this.panel, 'keydown', this.panelKeydown);
	on(this.searcher, 'input', this.searcherInput);
	on(this.searcher, 'compositionend', this.searcherInput);
	on($('#attribute-confirm'), 'click', this.confirm);
	on($('#attribute-apply'), 'click', this.apply);
};

Attribute.open = function (target = null, mode = 'normal') {
	this.mode = mode;
	this.target = target;
	this._previousActive = UndoManager.getActive();
	this.history = new History(100);
	UndoManager.setActive(this);
	this.unpackAttribute();
	getWindow().open('attribute');

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
	window.addEventListener('keydown', Reference.getKeydownListener(list, 'attribute'));
};

Attribute.undo = function () {
	if (this.history.canUndo()) {
		this.history.restore('undo');
	}
};

Attribute.redo = function () {
	if (this.history.canRedo()) {
		this.history.restore('redo');
	}
};

Attribute.createId = function () {
	let id;
	do {
		id = GUID.generate64bit();
	} while (this.idMap[id]);
	return id;
};

Attribute.register = function (item) {
	Attribute.idMap[item.id] = true;
	if (item.class === 'folder') {
		for (const child of item.children) {
			Attribute.register(child);
		}
	}
};

Attribute.unregister = function (item) {
	delete Attribute.idMap[item.id];
	if (item.class === 'folder') {
		for (const child of item.children) {
			Attribute.unregister(child);
		}
	}
};

Attribute.getItemById = (function IIFE() {
	const find = (items, id) => {
		const length = items.length;
		for (let i = 0; i < length; i++) {
			const item = items[i];
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
	return function (id) {
		return find(this.data, id);
	};
})();

Attribute.setFolderGroup = function (folder, newGroup) {
	const oldGroup = folder.element.group;
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

Attribute.getGroup = function (groupKey) {
	return Data.attribute.context.getGroup(groupKey);
};

Attribute.getAttribute = function (attrId) {
	return Data.attribute.context.getAttribute(attrId);
};

Attribute.getGroupAttribute = function (groupKey, attrId) {
	return Data.attribute.context.getGroupAttribute(groupKey, attrId);
};

Attribute.getDefAttributeId = function (groupKey, type) {
	return Data.attribute.context.getDefAttributeId(groupKey, type);
};

Attribute.getAttributeItems = function (groupKey, attrType, allowNone) {
	return Data.attribute.context.getAttributeItems(groupKey, attrType, allowNone);
};

Attribute.openPropertyPanel = function (attribute) {
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

Attribute.closePropertyPanel = function () {
	const panel = this.panel;
	if (panel.attribute) {
		panel.attribute = null;
		hide(panel);
	}
};

Attribute.unpackAttribute = (function IIFE() {
	class ReferencedFolder {
		data: any;
		class: string;
		id: string;
		name: string;
		children: any[];
		constructor(item: any) {
			this.data = item;
			this.class = item.class;
			this.id = item.id;
			this.name = item.name;
			this.children = clone(item.children);
		}

		get expanded() {
			return this.data.expanded;
		}

		set expanded(value: any) {
			this.data.expanded = value;
			File.planToSave(Data.manifest.project.attribute);
		}
	}
	const clone = (items) => {
		const length = items.length;
		const copies = new Array(length);
		for (let i = 0; i < length; i++) {
			const item = items[i];
			Attribute.idMap[item.id] = true;
			if (item.class !== 'folder') {
				copies[i] = Object.clone(item);
			} else {
				copies[i] = new ReferencedFolder(item);
			}
		}
		return copies;
	};
	return function () {
		this.idMap = {};
		this.data = clone(Data.attribute.keys);
		this.settings = Object.clone(Data.attribute.settings);
		if (!this.settingKeys) {
			this.settingKeys = Object.keys(this.settings);
		}
	};
})();

Attribute.packAttribute = (function IIFE() {
	const clone = (items) => {
		const length = items.length;
		const copies = new Array(length);
		for (let i = 0; i < length; i++) {
			const item = items[i];
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
	return function () {
		Data.attribute.keys = clone(this.data);
		Data.attribute.settings = Object.clone(this.settings);
		Data.createAttributeContext();
	};
})();

Attribute.saveHistory = function (item, key, value) {
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

Attribute.windowClose = function (event) {
	this.list.saveScroll();
	if (this.changed) {
		event.preventDefault();
		const get = Local.createGetter('confirmation');
		getWindow().confirm(
			{
				message: get('closeUnsavedAttributes')
			},
			[
				{
					label: get('yes'),
					click: () => {
						this.changed = false;
						getWindow().close('attribute');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
}.bind(Attribute);

Attribute.windowClosed = function (event) {
	this.data = null;
	this.idMap = null;
	UndoManager.setActive(this._previousActive);
	this._previousActive = null;
	this.history = null;
	write(this.searcher, '');
	clear(this.list);
	this.closePropertyPanel();
	window.removeEventListener('keydown', this.keydown);
	window.removeEventListener('keydown', Reference.getKeydownListener(this.list));
}.bind(Attribute);

Attribute.keydown = Shortcuts.createUndoRedo(Attribute);

Attribute.listKeydown = function (event) {
	const item = read(this);
	if (event.cmdOrCtrlKey) {
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

Attribute.listPointerdown = function (event) {
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

Attribute.listDoubleclick = function (event) {
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

Attribute.listSelect = function (event) {
	const item = event.value;
	return item.class !== 'folder'
		? Attribute.openPropertyPanel(item)
		: Attribute.closePropertyPanel();
};

Attribute.listRecord = function (event) {
	Attribute.changed = true;
	const response = event.value;
	switch (response.type) {
		case 'rename': {
			// 如果是属性则执行操作否则进入默认分支
			const { item, oldValue, newValue } = response;
			if (Attribute.panel.attribute === item) {
				write(Attribute.inputs.name, newValue);
				Attribute.saveHistory(item, 'name', oldValue);
				break;
			}
		}
		default:
			Attribute.history.save({
				type: 'attribute-list-operation',
				response: response
			});
			break;
	}
};

Attribute.listOpen = function (event) {
	Attribute.listDoubleclick(event);
};

Attribute.listPopup = function (event) {
	const item = event.value;
	const selected = !!item;
	const copyable = selected && item.class !== 'folder';
	const pastable = (Clipboard as any).has('yami.data.attribute');
	const undoable = Attribute.history.canUndo();
	const redoable = Attribute.history.canRedo();
	const get = Local.createGetter('menuAttributeList');
	const items: any[] = [
		{
			label: get('create'),
			submenu: [
				{
					label: get('create.folder'),
					click: () => {
						this.addNodeTo(this.createFolder(), item);
					}
				},
				{
					label: get('create.attribute'),
					accelerator: 'Insert',
					click: () => {
						this.addNodeTo(this.createAttribute(), item);
					}
				}
			]
		},
		{
			label: get('copy'),
			accelerator: ctrl('C'),
			enabled: copyable,
			click: () => {
				this.copy(item);
			}
		},
		{
			label: get('paste'),
			accelerator: ctrl('V'),
			enabled: pastable,
			click: () => {
				this.paste(item);
			}
		},
		{
			label: get('delete'),
			accelerator: 'Delete',
			enabled: selected,
			click: () => {
				this.delete(item);
			}
		},
		{
			label: get('rename'),
			accelerator: 'F2',
			enabled: selected,
			click: () => {
				this.rename(item);
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
				Reference.openRelated(item.id);
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

Attribute.nameInput = function (event) {
	const item = Attribute.panel.attribute;
	if (item.class !== 'folder') {
		Attribute.saveHistory(item, 'name', item.name);
		item.name = event.target.value;
		Attribute.list.updateItemName(item);
		Attribute.changed = true;
	}
};

Attribute.keyInput = function (event) {
	const item = Attribute.panel.attribute;
	if (item.class !== 'folder') {
		Attribute.saveHistory(item, 'key', item.key);
		item.key = event.target.value;
		Attribute.list.updateInitText(item);
		Attribute.changed = true;
	}
};

Attribute.typeWrite = function (event) {
	const { style } = Attribute.inputs.enumBox;
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

Attribute.typeInput = function (event) {
	const item = Attribute.panel.attribute;
	if (item === null) return;
	Attribute.saveHistory(item, 'type', item.type);
	item.type = event.value;
	Attribute.list.updateIcon(item);
	Attribute.changed = true;
};

Attribute.enumInput = function (event) {
	const item = Attribute.panel.attribute;
	Attribute.saveHistory(item, 'enum', item.enum);
	item.enum = event.value;
	Attribute.changed = true;
};

Attribute.noteInput = function (event) {
	if (event.inputType !== 'insertCompositionText') {
		const item = Attribute.panel.attribute;
		Attribute.saveHistory(item, 'note', item.note);
		item.note = read(this);
		Attribute.list.updateNoteIcon(item);
		Attribute.changed = true;
	}
};

Attribute.panelKeydown = function (event) {
	switch (event.target.tagName) {
		case 'INPUT':
		case 'TEXTAREA':
			if (event.cmdOrCtrlKey) {
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

Attribute.searcherInput = function (event) {
	if (event.inputType === 'insertCompositionText') {
		return;
	}
	const text = this.input.value;
	Attribute.list.searchNodesDebounced(text);
};

Attribute.confirm = function (event) {
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
			this.target.input(item ? item.id : '');
			break;
		}
		case 'attribute': {
			const item = read(this.list);
			if (item && item.class === 'folder') {
				return getFocus(this.list);
			}
			this.apply();
			this.target.input(item ? item.id : '');
			break;
		}
	}
	getWindow().close('attribute');
}.bind(Attribute);

Attribute.apply = function (event) {
	if (this.changed) {
		this.changed = false;

		this.packAttribute();
		File.planToSave(Data.manifest.project.attribute);

		window.dispatchEvent(new Event('attributechange'));
	}
}.bind(Attribute);

// bindListClipboardMethods 改为 ensureDomBound 内调用（list 顶层为 null）

// 列表 - 保存滚动状态
Attribute.list_saveScroll = function () {
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
Attribute.list_restoreScroll = function () {
	this.scrollTop = Data.attribute.scrollTop ?? 0;
};

// 列表 - 取消搜索
Attribute.list_cancelSearch = function () {
	if (this.display === 'search') {
		const active = document.activeElement;
		Attribute.searcher.deleteInputContent();
		this.expandToSelection();
		this.scrollToSelection();
		active.focus();
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
	return function (item) {
		const icon = document.createElement('node-icon');
		if (item.class !== 'folder') {
			addClass(icon, classes[item.type]);
		} else {
			addClass(icon, 'icon-folder');
		}
		return icon;
	};
})();

// 列表 - 更新图标
Attribute.list_updateIcon = function (item) {
	const { element } = item;
	if (element?.nodeIcon) {
		const icon = this.createIcon(item);
		element.replaceChild(icon, element.nodeIcon);
		element.nodeIcon = icon;
	}
};

// 列表 - 重写解析名称方法
Attribute.list_parseName = function (item) {
	return GameLocal.replace(item.name);
};

// 列表 - 添加元素类名
Attribute.list_addElementClass = function (item) {
	addClass(item.element, 'attribute-item');
	addClass(item.element, 'reference');
};

// 列表 - 创建分组文本
Attribute.list_createGroupText = function (item) {
	if (item.class === 'folder') {
		const { element } = item;
		const groupText = document.createElement('div');
		addClass(groupText, 'enum-init-text');
		addClass(groupText, 'text');
		element.appendChild(groupText);
		element.groupText = groupText;
		element.group = '';
	}
};

// 列表 - 更新分组文本
Attribute.list_updateGroupText = function (item) {
	const { element } = item;
	if (element.groupText !== undefined) {
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
Attribute.list_createInitText = function (item) {
	if (item.class !== 'folder') {
		const { element } = item;
		const initText = document.createElement('div');
		addClass(initText, 'attribute-init-text');
		addClass(initText, 'text');
		element.appendChild(initText);
		element.initText = initText;
		element.attrKey = '';
	}
};

// 列表 - 更新初始化文本
Attribute.list_updateInitText = function (item) {
	const { element } = item;
	if (element.initText !== undefined) {
		const { key } = item;
		if (element.attrKey !== key) {
			element.attrKey = key;
			element.initText.textContent = key ? ` = ${key}` : '';
		}
	}
};

// 列表 - 创建笔记图标
Attribute.list_createNoteIcon = function (item) {
	if (item.class !== 'folder') {
		const { element } = item;
		const noteIcon = document.createElement('node-icon');
		addClass(noteIcon, 'icon-note');
		noteIcon.textContent = '\uf27b';
		element.appendChild(noteIcon);
		element.noteIcon = noteIcon;
		element.annotated = null;
	}
};

// 列表 - 更新笔记图标
Attribute.list_updateNoteIcon = function (item) {
	const { element } = item;
	if (element.noteIcon !== undefined) {
		const annotated = item.note !== '';
		if (element.annotated !== annotated) {
			element.annotated = annotated;
			annotated ? show(element.noteIcon) : hide(element.noteIcon);
		}
	}
};

// 列表 - 在创建数据时回调
Attribute.list_onCreate = function (item) {
	Attribute.register(item);
};

// 列表 - 在删除数据时回调
Attribute.list_onDelete = function (item) {
	Attribute.unregister(item);
};

// 列表 - 在恢复数据时回调
Attribute.list_onResume = function (item) {
	Attribute.register(item);
};

for (const key of attributeStateKeys) {
	Object.defineProperty(Attribute, key, {
		get: () => getAttributeStore().state[key],
		set: (value: any) => {
			(getAttributeStore().state as any)[key] = value;
		},
		configurable: true
	});
}
