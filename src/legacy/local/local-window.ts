import { $ } from '@/util/dom.ts';
import {
	on,
	show,
	hide,
	clear,
	addClass,
	removeClass,
	read,
	write,
	getFocus
} from '@/util/element-utils.ts';
import { ctrl } from '@/util/event-accessors.ts';
import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Shortcuts } from '@/tools/shortcut-registry.ts';
import { createDetailBox } from '@/components/detail-box.ts';
import { createDetailSummary } from '@/components/detail-summary.ts';
import { Menu } from '@/components/menu-list.ts';
import { createTextArea } from '@/components/text-area.ts';
import { TreeList } from '@/components/tree-list.ts';
import { GUID } from '@/file/guid.ts';
import { ExportLanguage } from './export-language-window.ts';
import { ImportLanguage } from './import-language-window.ts';
import { Reference } from '@/log/related-references.ts';
import { History } from '@/tools/history.ts';
import { Local } from '@/tools/localization.ts';
import { Selection } from '@/tools/text-capture.ts';
import { UndoManager } from '@/tools/undo-manager.ts';
function getWindow() {
	return (window as any).Window;
}
import { bindListClipboardMethods } from '@/tools/list-clipboard-methods.ts';
import { ipcRenderer } from 'electron';

export const Localization = {
	list: null as any,
	panel: null as any,
	searcher: null as any,
	inputs: null as any,
	target: null as any,
	data: null as any,
	idMap: null as any,
	languages: null as any,
	history: null as any,
	changed: false,
	_previousActive: null as any,
	initialize: null as any,
	open: null as any,
	undo: null as any,
	redo: null as any,
	createId: null as any,
	register: null as any,
	unregister: null as any,
	getItemById: null as any,
	openContentPanel: null as any,
	closeContentPanel: null as any,
	unpackLocalization: null as any,
	packLocalization: null as any,
	resizeTextArea: null as any,
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
	panelInput: null as any,
	panelKeydown: null as any,
	searcherInput: null as any,
	confirm: null as any,
	apply: null as any,
	// runtime 挂载: createInputs/fromExcel/toExcel 在本文件下方动态挂载
	createInputs: null as any,
	fromExcel: null as any,
	toExcel: null as any,
	// list 方法引用（ensureDomBound 内挂到真实 list 上）
	list_saveScroll: null as any,
	list_restoreScroll: null as any,
	list_cancelSearch: null as any,
	list_createFolder: null as any,
	list_createItem: null as any,
	list_createIcon: null as any,
	list_addElementClass: null as any,
	list_updateItemClass: null as any,
	list_updateItemName: null as any,
	list_createInitText: null as any,
	list_updateInitText: null as any,
	list_onCreate: null as any,
	list_onDelete: null as any,
	list_onResume: null as any
};

function ensureDomBound() {
	if (Localization.list) return;
	const list = $('#localization-list');
	if (!list) return;
	Localization.list = list;
	Localization.panel = $('#localization-inspector');
	hide(Localization.panel);
	Localization.searcher = $('#localization-searcher');
	list.copy = null;
	list.paste = null;
	list.delete = null;
	list.saveScroll = Localization.list_saveScroll;
	list.restoreScroll = Localization.list_restoreScroll;
	list.cancelSearch = Localization.list_cancelSearch;
	list.createFolder = Localization.list_createFolder;
	list.createItem = Localization.list_createItem;
	list.createIcon = Localization.list_createIcon;
	list.addElementClass = Localization.list_addElementClass;
	list.updateItemClass = Localization.list_updateItemClass;
	list.updateItemName = Localization.list_updateItemName;
	list.createInitText = Localization.list_createInitText;
	list.updateInitText = Localization.list_updateInitText;
	list.onCreate = Localization.list_onCreate;
	list.onDelete = Localization.list_onDelete;
	list.onResume = Localization.list_onResume;
	bindListClipboardMethods({
		module: Localization,
		list,
		clipboardKey: 'yami.data.localization'
	});
}

Localization.initialize = function () {
	ensureDomBound();
	if (!Localization.list) return;
	const { list } = this;
	list.removable = true;
	list.renamable = true;
	list.bind(() => this.data);
	list.creators.push(list.addElementClass);
	list.updaters.push(list.updateItemClass);
	list.creators.push(list.createInitText);
	list.creators.push(list.updateInitText);

	this.panel.item = null;

	this.searcher.addCloseButton();

	(History.processors as any)['localization-list-operation'] = (operation: string, data: any) => {
		const { response } = data;
		list.restore(operation, response);
		if (read(list) === null && this.panel.item !== null) {
			this.closeContentPanel();
		}
		this.changed = true;
	};
	(History.processors as any)['localization-content-change'] = (operation: string, data: any) => {
		const { item, language, content } = data;
		data.content = item.contents[language];
		item.contents[language] = content;
		if (this.panel.item === item) {
			const textarea = this.inputs[language];
			write(textarea, content);
			this.resizeTextArea(textarea);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		list.updateInitText(item);
		this.changed = true;
	};

	on($('#localization'), 'close', this.windowClose);
	on($('#localization'), 'closed', this.windowClosed);
	on(list, 'keydown', this.listKeydown);
	on(list, 'pointerdown', this.listPointerdown);
	on(list, 'pointerdown', (Reference.getPointerdownListener as any)(list), {
		capture: true
	});
	on(list, 'doubleclick', this.listDoubleclick, { capture: true });
	on(list, 'select', this.listSelect);
	on(list, 'record', this.listRecord);
	on(list, 'open', this.listOpen);
	on(list, 'popup', this.listPopup);
	on(this.panel, 'input', this.panelInput);
	on(this.panel, 'keydown', this.panelKeydown);
	on(this.searcher, 'input', this.searcherInput);
	on(this.searcher, 'compositionend', this.searcherInput);
	on($('#localization-confirm'), 'click', this.confirm);
	on($('#localization-apply'), 'click', this.apply);
	on($('#localization-to-excel'), 'click', this.toExcel);
	on($('#localization-from-excel'), 'click', this.fromExcel);

	ExportLanguage.initialize();
	ImportLanguage.initialize();
};

Localization.createInputs = function () {
	const inputs: Record<string, any> = (this.inputs = {});
	for (const language of this.languages) {
		const detailBox = createDetailBox();
		const detailSummary = createDetailSummary();
		detailSummary.textContent = (Local.get as any)('languages.' + language);
		const textarea = createTextArea();
		(textarea as HTMLElement & { language: string }).language = language;
		textarea.setAttribute('menu', 'tag-global tag-dynamic-global-var');
		addClass(textarea, 'localization-text-area');
		detailBox.appendChild(detailSummary);
		detailBox.appendChild(textarea);
		this.panel.appendChild(detailBox);
		inputs[language] = textarea;
		(Selection.addEventListeners as any)(textarea);
	}
};

Localization.open = function (target: any = null) {
	this.target = target;
	this._previousActive = UndoManager.getActive();
	this.history = new History(100);
	UndoManager.setActive(this);
	this.unpackLocalization();
	this.createInputs();
	getWindow().open('localization');

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
	window.addEventListener('keydown', (Reference.getKeydownListener as any)(list, 'localization'));
};

Localization.undo = function () {
	if (this.history.canUndo()) {
		this.history.restore('undo');
	}
};

Localization.redo = function () {
	if (this.history.canRedo()) {
		this.history.restore('redo');
	}
};

Localization.createId = function () {
	let id;
	do {
		id = GUID.generate64bit();
	} while (this.idMap[id]);
	return id;
};

Localization.register = function (item: any) {
	if (item.class === 'folder') {
		for (const child of item.children) {
			Localization.register(child);
		}
	} else {
		Localization.idMap[item.id] = true;
	}
};

Localization.unregister = function (item: any) {
	if (item.class === 'folder') {
		for (const child of item.children) {
			Localization.unregister(child);
		}
	} else {
		delete Localization.idMap[item.id];
	}
};

Localization.getItemById = (function IIFE() {
	const find = (items: any[], id: string): any => {
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
	return function (this: any, id: string) {
		return find(this.data, id);
	};
})();

Localization.openContentPanel = function (item: any) {
	const panel = this.panel;
	if (panel.item !== item) {
		panel.item = item;
		show(panel);
		const { inputs } = this;
		for (const language of this.languages) {
			const textarea = inputs[language];
			write(textarea, item.contents[language]);
			this.resizeTextArea(textarea);
		}
	}
};

Localization.closeContentPanel = function () {
	const panel = this.panel;
	if (panel.item) {
		panel.item = null;
		hide(panel);
	}
};

Localization.unpackLocalization = (function IIFE() {
	class ReferencedFolder {
		data: any;
		class: string;
		name: string;
		children: any[];
		constructor(item: any) {
			this.data = item;
			this.class = item.class;
			this.name = item.name;
			this.children = clone(item.children);
		}

		get expanded() {
			return this.data.expanded;
		}

		set expanded(value: any) {
			this.data.expanded = value;
			File.planToSave!(Data.manifest.project.localization);
		}
	}
	const clone = (items: any[]) => {
		const length = items.length;
		const copies = new Array(length);
		for (let i = 0; i < length; i++) {
			const item = items[i];
			if (item.class !== 'folder') {
				copies[i] = (Object as any).clone(item);
				Localization.idMap[item.id] = true;
			} else {
				copies[i] = new ReferencedFolder(item);
			}
		}
		return copies;
	};
	return function (this: any) {
		this.idMap = {};
		this.data = clone(Data.localization.list);
		this.languages = Data.config.localization.languages.map((lang: any) => lang.name);
	};
})();

Localization.packLocalization = (function IIFE() {
	const clone = (items: any[]) => {
		const length = items.length;
		const copies = new Array(length);
		for (let i = 0; i < length; i++) {
			const item = items[i];
			if (item.class !== 'folder') {
				copies[i] = (Object as any).clone(item);
			} else {
				copies[i] = {
					class: item.class,
					name: item.name,
					expanded: item.expanded,
					children: clone(item.children)
				};
			}
		}
		return copies;
	};
	return function (this: any) {
		Data.localization.list = clone(this.data);
		Data.createLocalizationMap();
	};
})();

Localization.resizeTextArea = function (textarea: any) {
	const shadowDOM = textarea.querySelector('textarea');
	textarea.style.height = '0';
	textarea.style.height = `${(Math as any).clamp(shadowDOM.scrollHeight + 11, 40, 200)}px`;
};

Localization.windowClose = function (this: any, event: any) {
	this.list.saveScroll();
	if (this.changed) {
		event.preventDefault();
		const get = (Local.createGetter as any)('confirmation');
		getWindow().confirm(
			{
				message: get('closeUnsavedLocalization')
			},
			[
				{
					label: get('yes'),
					click: () => {
						this.changed = false;
						getWindow().close('localization');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
}.bind(Localization);

Localization.windowClosed = function (this: any, event: any) {
	this.data = null;
	this.idMap = null;
	this.inputs = null;
	UndoManager.setActive(this._previousActive);
	this._previousActive = null;
	this.history = null;
	this.languages = null;
	write(this.searcher, '');
	clear(this.list);
	clear(this.panel);
	this.closeContentPanel();
	window.removeEventListener('keydown', this.keydown);
	window.removeEventListener('keydown', (Reference.getKeydownListener as any)(this.list));
}.bind(Localization);

Localization.keydown = Shortcuts.createUndoRedo(Localization);

Localization.listKeydown = function (this: any, event: any) {
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
				this.addNodeTo(this.createItem(), item);
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

Localization.listPointerdown = function (this: any, event: any) {
	switch (event.button) {
		case 0:
			if (event.target === this) {
				this.unselect();
				Localization.closeContentPanel();
			}
			break;
		case 3:
			this.cancelSearch();
			break;
	}
};

Localization.listDoubleclick = function (event: any) {
	if (Localization.target && read(Localization.list)?.id !== undefined) {
		getFocus(Localization.target);
		event.stopPropagation();
		event.preventDefault();
		Localization.confirm();
	}
};

Localization.listSelect = function (event: any) {
	const item = event.value;
	return item.class !== 'folder'
		? Localization.openContentPanel(item)
		: Localization.closeContentPanel();
};

Localization.listRecord = function (event: any) {
	Localization.changed = true;
	Localization.history.save({
		type: 'localization-list-operation',
		response: event.value
	});
};

Localization.listOpen = function (event: any) {
	Localization.listDoubleclick(event);
};

Localization.listPopup = function (this: any, event: any) {
	const item = event.value;
	const selected = !!item;
	const copyable = selected && item.class !== 'folder';
	const pastable = (Clipboard as any).has('yami.data.localization');
	const undoable = Localization.history.canUndo();
	const redoable = Localization.history.canRedo();
	const get = (Local.createGetter as any)('menuLocalList');
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
					label: get('create.text'),
					accelerator: 'Insert',
					click: () => {
						this.addNodeTo(this.createItem(), item);
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
				Localization.undo();
			}
		},
		{
			label: get('redo'),
			accelerator: ctrl('Y'),
			enabled: redoable,
			click: () => {
				Localization.redo();
			}
		}
	];
	if (copyable) {
		items.unshift({
			label: `ID: ${item.id}`,
			style: 'id',
			click: () => {
				navigator.clipboard.writeText(item.id);
			}
		});
		items.push({
			label: get('find-references'),
			accelerator: 'Alt+LB',
			click: () => {
				(Reference.openRelated as any)(item.id);
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

Localization.panelInput = function (event: any) {
	const element = event.target;
	if (element.tagName === 'TEXTAREA') {
		const item = Localization.panel.item;
		const textarea = element.parentNode;
		const language = textarea.language;
		const history = Localization.history;
		const index = history.index;
		const length = history.length;
		const record = history[index];
		if (
			index !== length - 1 ||
			record === undefined ||
			record.item !== item ||
			record.language !== language
		) {
			Localization.history.save({
				type: 'localization-content-change',
				item: item,
				language: language,
				content: item.contents[language]
			});
		}
		item.contents[language] = read(textarea);
		Localization.resizeTextArea(textarea);
		Localization.list.updateInitText(item);
		Localization.changed = true;
	}
};

Localization.panelKeydown = function (event: any) {
	if (event.target.tagName === 'TEXTAREA' && event.cmdOrCtrlKey) {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				break;
			default:
				event.stopPropagation();
				break;
		}
	}
};

Localization.searcherInput = function (this: any, event: any) {
	if (event.inputType === 'insertCompositionText') {
		return;
	}
	const text = this.input.value;
	Localization.list.searchNodesDebounced(text);
};

Localization.confirm = function (this: any, event: any) {
	if (this.target) {
		const item = read(this.list);
		if (item?.id === undefined) {
			return getFocus(this.list);
		}
		(Selection.restoreContext as any)();
		this.apply();
		this.target.input(item.id);
	} else {
		this.apply();
	}
	getWindow().close('localization');
}.bind(Localization);

Localization.apply = function (this: any, event: any) {
	if (this.changed) {
		this.changed = false;

		this.packLocalization();
		File.planToSave!(Data.manifest.project.localization);

		window.dispatchEvent(new Event('localizationchange'));
	}
}.bind(Localization);

Localization.fromExcel = async function (this: any, event: any) {
	const items = await ipcRenderer.invoke('from-excel');
	if (JSON.stringify(items) == JSON.stringify(Data.localization.list) || !items.length) return;
	Data.localization.list = items;
	Localization.windowClose(event);
	Localization.windowClosed(event);
	Localization.open();
	this.changed = true;
	Localization.apply();
}.bind(Localization);

Localization.toExcel = function (this: any, event: any) {
	ipcRenderer.invoke('to-excel', {
		langs: this.languages,
		list: Data.localization.list
	});
}.bind(Localization);

// bindListClipboardMethods 改为 ensureDomBound 内调用（list 顶层为 null）

// 列表 - 保存滚动状态
Localization.list_saveScroll = function (this: any) {
	const { localization } = Data;
	// 将数据保存在外部可以切换项目后重置
	if ((localization as any).scrollTop === undefined) {
		Object.defineProperty(localization, 'scrollTop', {
			writable: true,
			value: 0
		});
	}
	(localization as any).scrollTop = this.scrollTop;
};

// 列表 - 恢复滚动状态
Localization.list_restoreScroll = function (this: any) {
	this.scrollTop = (Data.localization as any).scrollTop ?? 0;
};

// 列表 - 取消搜索
Localization.list_cancelSearch = function (this: any) {
	if (this.display === 'search') {
		const active = document.activeElement;
		Localization.searcher.deleteInputContent();
		this.expandToSelection();
		this.scrollToSelection();
		(active as any).focus();
	}
};

// 列表 - 创建文件夹
Localization.list_createFolder = function () {
	return {
		class: 'folder',
		name: 'New Folder',
		expanded: false,
		children: []
	};
};

// 列表 - 创建本地化项目
Localization.list_createItem = function () {
	const contents: Record<string, string> = {};
	for (const language of Localization.languages) {
		contents[language] = '';
	}
	return {
		id: Localization.createId(),
		name: '',
		contents: contents
	};
};

// 列表 - 重写创建图标方法
Localization.list_createIcon = function (item: any) {
	const icon = document.createElement('node-icon');
	if (item.class !== 'folder') {
		addClass(icon, 'icon-string');
	} else {
		addClass(icon, 'icon-folder');
	}
	return icon;
};

// 列表 - 添加元素类名
Localization.list_addElementClass = function (item: any) {
	addClass(item.element, 'localization-item');
};

// 列表 - 更新项目类名
Localization.list_updateItemClass = function (item: any) {
	if (item.class !== 'folder') {
		addClass(item.element, 'reference');
	} else {
		removeClass(item.element, 'reference');
	}
};

// 列表 - 重写更新项目名称方法
Localization.list_updateItemName = function (this: any, item: any) {
	TreeList.prototype.updateItemName.call(this, item);
	this.updateInitText(item);
};

// 列表 - 创建初始化文本
Localization.list_createInitText = function (item: any) {
	if (item.class !== 'folder') {
		const { element } = item;
		const initText = document.createElement('text');
		addClass(initText, 'localization-init-text');
		element.appendChild(initText);
		element.initText = initText;
		element.attrValue = '';
	}
};

// 列表 - 更新初始化文本
Localization.list_updateInitText = function (item: any) {
	const { element } = item;
	if (element.initText !== undefined) {
		let value = '';
		for (const language of Localization.languages) {
			if (item.contents[language]) {
				value = item.contents[language];
				break;
			}
		}
		if (item.name !== '') {
			if (value !== '') {
				value = ' = ' + value;
			}
		} else {
			if (value === '') {
				value = 'Text';
			}
		}
		if (element.attrValue !== value) {
			element.attrValue = value;
			element.initText.textContent = value;
		}
	}
};

// 列表 - 在创建数据时回调
Localization.list_onCreate = function (item: any) {
	Localization.register(item);
};

// 列表 - 在删除数据时回调
Localization.list_onDelete = function (item: any) {
	Localization.unregister(item);
};

// 列表 - 在恢复数据时回调
Localization.list_onResume = function (item: any) {
	Localization.register(item);
};
