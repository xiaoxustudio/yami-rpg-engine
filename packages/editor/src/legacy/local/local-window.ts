import { getListConfig } from '@ui-kit';
import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
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

import { bindListClipboardMethods } from '@/tools/list-clipboard-methods.ts';
import { type MenuItem } from '@ui-kit';
import { type TreeListElement } from '@/components/tree-list.ts';
import type { EditorProjectShape } from '@app/stores/editor';
import { ipcRenderer } from 'electron';

interface LocalizationItem {
	id?: string;
	name: string;
	class?: string;
	expanded?: boolean;
	children?: LocalizationItem[];
	contents?: Record<string, string>;
	element?: HTMLElement & { initText?: HTMLElement; attrValue?: string };
}

interface LocalizationTarget {
	input?: (id: string) => void;
}

interface LocalizationHistoryData {
	item: LocalizationItem;
	language: string;
	content: string;
	response: unknown;
}

interface UndoableEditor {
	undo?: ((...args: unknown[]) => unknown) | null;
	redo?: ((...args: unknown[]) => unknown) | null;
	history?: { canUndo(): boolean; canRedo(): boolean } | null;
}

interface LocalizationShape {
	list: TreeListElement | null;
	panel: (HTMLElement & { item: LocalizationItem | null }) | null;
	searcher: (HTMLElement & { addCloseButton(): void; deleteInputContent(): void }) | null;
	inputs: Record<string, HTMLElement> | null;
	target: LocalizationTarget | null;
	data: LocalizationItem[] | null;
	idMap: Record<string, unknown> | null;
	languages: string[] | null;
	history: History | null;
	changed: boolean;
	_previousActive: UndoableEditor | null;
	initialize: (this: LocalizationShape) => void;
	open: (this: LocalizationShape, target?: LocalizationTarget) => void;
	undo: (this: LocalizationShape) => void;
	redo: (this: LocalizationShape) => void;
	createId: (this: LocalizationShape) => string;
	register: (this: LocalizationShape, item: LocalizationItem) => void;
	unregister: (this: LocalizationShape, item: LocalizationItem) => void;
	getItemById: (this: LocalizationShape, id: string) => LocalizationItem | undefined;
	openContentPanel: (this: LocalizationShape, item: LocalizationItem) => void;
	closeContentPanel: (this: LocalizationShape) => void;
	unpackLocalization: (this: LocalizationShape) => void;
	packLocalization: (this: LocalizationShape) => void;
	resizeTextArea: (this: LocalizationShape, target: HTMLElement) => void;
	windowClose: (this: LocalizationShape, event: Event) => void;
	windowClosed: (this: LocalizationShape, event: Event) => void;
	keydown: (event: Event) => void;
	listKeydown: (this: TreeListElement, event: KeyboardEvent) => void;
	listPointerdown: (this: TreeListElement, event: PointerEvent) => void;
	listDoubleclick: (event: MouseEvent) => void;
	listSelect: (event: Event) => void;
	listRecord: (event: Event) => void;
	listOpen: (event: MouseEvent) => void;
	listPopup: (this: TreeListElement, event: Event) => void;
	panelInput: (event: Event) => void;
	panelKeydown: (event: KeyboardEvent) => void;
	searcherInput: (this: TextBox, event: InputEvent) => void;
	confirm: (this: LocalizationShape, event?: Event) => void;
	apply: (this: LocalizationShape, event?: Event) => void;
	createInputs: (this: LocalizationShape) => void;
	fromExcel: (this: LocalizationShape, event: Event) => Promise<void>;
	toExcel: (this: LocalizationShape, event?: Event) => void;
	list_saveScroll: (this: TreeListElement) => void;
	list_restoreScroll: (this: TreeListElement) => void;
	list_cancelSearch: (this: TreeListElement) => void;
	list_createFolder: (this: TreeListElement) => LocalizationItem;
	list_createItem: (this: TreeListElement) => LocalizationItem;
	list_createIcon: (this: TreeListElement, item: LocalizationItem) => HTMLElement;
	list_addElementClass: (this: TreeListElement, item: LocalizationItem) => void;
	list_updateItemClass: (this: TreeListElement, item: LocalizationItem) => void;
	list_updateItemName: (this: TreeListElement, item: LocalizationItem) => void;
	list_createInitText: (this: TreeListElement, item: LocalizationItem) => void;
	list_updateInitText: (this: TreeListElement, item: LocalizationItem) => void;
	list_onCreate: (this: TreeListElement, item: LocalizationItem) => void;
	list_onDelete: (this: TreeListElement, item: LocalizationItem) => void;
	list_onResume: (this: TreeListElement, item: LocalizationItem) => void;
	state: string;
	strings: Record<string, string> | null;
	close: (() => void) | null;
	saveToProject: ((project: EditorProjectShape) => void) | null;
	loadFromProject: ((project: EditorProjectShape) => void) | null;
}

export const Localization: LocalizationShape = {
	list: null as unknown as TreeListElement | null,
	panel: null as unknown as (HTMLElement & { item: LocalizationItem | null }) | null,
	searcher: null as unknown as
		| (HTMLElement & {
				addCloseButton(): void;
				deleteInputContent(): void;
		  })
		| null,
	inputs: null as Record<string, HTMLElement> | null,
	target: null as LocalizationTarget | null,
	data: null as LocalizationItem[] | null,
	idMap: null as unknown as Record<string, unknown>,
	languages: null as string[] | null,
	history: null as History | null,
	changed: false,
	_previousActive: null as UndoableEditor | null,
	initialize: null as unknown as LocalizationShape['initialize'],
	open: null as unknown as LocalizationShape['open'],
	undo: null as unknown as LocalizationShape['undo'],
	redo: null as unknown as LocalizationShape['redo'],
	createId: null as unknown as LocalizationShape['createId'],
	register: null as unknown as LocalizationShape['register'],
	unregister: null as unknown as LocalizationShape['unregister'],
	getItemById: null as unknown as LocalizationShape['getItemById'],
	openContentPanel: null as unknown as LocalizationShape['openContentPanel'],
	closeContentPanel: null as unknown as LocalizationShape['closeContentPanel'],
	unpackLocalization: null as unknown as LocalizationShape['unpackLocalization'],
	packLocalization: null as unknown as LocalizationShape['packLocalization'],
	resizeTextArea: null as unknown as LocalizationShape['resizeTextArea'],
	windowClose: null as unknown as LocalizationShape['windowClose'],
	windowClosed: null as unknown as LocalizationShape['windowClosed'],
	keydown: null as unknown as LocalizationShape['keydown'],
	listKeydown: null as unknown as LocalizationShape['listKeydown'],
	listPointerdown: null as unknown as LocalizationShape['listPointerdown'],
	listDoubleclick: null as unknown as LocalizationShape['listDoubleclick'],
	listSelect: null as unknown as LocalizationShape['listSelect'],
	listRecord: null as unknown as LocalizationShape['listRecord'],
	listOpen: null as unknown as LocalizationShape['listOpen'],
	listPopup: null as unknown as LocalizationShape['listPopup'],
	panelInput: null as unknown as LocalizationShape['panelInput'],
	panelKeydown: null as unknown as LocalizationShape['panelKeydown'],
	searcherInput: null as unknown as LocalizationShape['searcherInput'],
	confirm: null as unknown as LocalizationShape['confirm'],
	apply: null as unknown as LocalizationShape['apply'],
	// runtime 挂载: createInputs/fromExcel/toExcel 在本文件下方动态挂载,
	createInputs: null as unknown as LocalizationShape['createInputs'],
	fromExcel: null as unknown as LocalizationShape['fromExcel'],
	toExcel: null as unknown as LocalizationShape['toExcel'],
	// list 方法引用（ensureDomBound 内挂到真实 list 上）,
	list_saveScroll: null as unknown as LocalizationShape['list_saveScroll'],
	list_restoreScroll: null as unknown as LocalizationShape['list_restoreScroll'],
	list_cancelSearch: null as unknown as LocalizationShape['list_cancelSearch'],
	list_createFolder: null as unknown as LocalizationShape['list_createFolder'],
	list_createItem: null as unknown as LocalizationShape['list_createItem'],
	list_createIcon: null as unknown as LocalizationShape['list_createIcon'],
	list_addElementClass: null as unknown as LocalizationShape['list_addElementClass'],
	list_updateItemClass: null as unknown as LocalizationShape['list_updateItemClass'],
	list_updateItemName: null as unknown as LocalizationShape['list_updateItemName'],
	list_createInitText: null as unknown as LocalizationShape['list_createInitText'],
	list_updateInitText: null as unknown as LocalizationShape['list_updateInitText'],
	list_onCreate: null as unknown as LocalizationShape['list_onCreate'],
	list_onDelete: null as unknown as LocalizationShape['list_onDelete'],
	list_onResume: null as unknown as LocalizationShape['list_onResume'],
	state: null as unknown as string,
	strings: null as Record<string, string> | null,
	close: null as (() => void) | null,
	saveToProject: null as ((project: EditorProjectShape) => void) | null,
	loadFromProject: null as ((project: EditorProjectShape) => void) | null
};

function ensureDomBound() {
	if (Localization.list) return;
	const list = $('#localization-list');
	if (!list) return;
	Localization.list = list as unknown as TreeListElement;
	Localization.panel = $('#localization-inspector') as unknown as HTMLElement & {
		item: LocalizationItem | null;
	};
	hide(Localization.panel);
	Localization.searcher = $('#localization-searcher') as unknown as HTMLElement & {
		addCloseButton(): void;
		deleteInputContent(): void;
	};
	list.copy = null as unknown as (...args: unknown[]) => unknown;
	list.paste = null as unknown as (...args: unknown[]) => unknown;
	list.delete = null as unknown as (...args: unknown[]) => unknown;
	list.saveScroll = Localization.list_saveScroll;
	list.restoreScroll = Localization.list_restoreScroll;
	list.cancelSearch = Localization.list_cancelSearch;
	list.createFolder = Localization.list_createFolder;
	list.createItem = Localization.list_createItem as unknown as (...args: unknown[]) => unknown;
	list.createIcon = Localization.list_createIcon as unknown as (...args: unknown[]) => unknown;
	list.addElementClass = Localization.list_addElementClass as unknown as (
		...args: unknown[]
	) => unknown;
	list.updateItemClass = Localization.list_updateItemClass;
	list.updateItemName = Localization.list_updateItemName as unknown as (
		...args: unknown[]
	) => unknown;
	list.createInitText = Localization.list_createInitText;
	list.updateInitText = Localization.list_updateInitText;
	getListConfig(list).onCreate = Localization.list_onCreate;
	getListConfig(list).onDelete = Localization.list_onDelete;
	getListConfig(list).onResume = Localization.list_onResume;
	bindListClipboardMethods({
		module: { ...Localization, idMap: Localization.idMap! },
		list,
		clipboardKey: 'yami.data.localization'
	});
}

Localization.initialize = function () {
	ensureDomBound();
	if (!Localization.list) return;
	const list = this.list!;
	getListConfig(list).removable = true;
	getListConfig(list).renamable = true;
	list.bind(() => this.data);
	getListConfig(list).creators.push(list.addElementClass);
	getListConfig(list).updaters.push(list.updateItemClass);
	getListConfig(list).creators.push(list.createInitText);
	getListConfig(list).creators.push(list.updateInitText);

	this.panel!.item = null;

	this.searcher!.addCloseButton();

	History.processors['localization-list-operation'] = (
		operation: string,
		data: LocalizationHistoryData
	) => {
		const { response } = data;
		list.restore(operation, response);
		if (read(list) === null && this.panel!.item !== null) {
			this.closeContentPanel();
		}
		this.changed = true;
	};
	History.processors['localization-content-change'] = (
		operation: string,
		data: LocalizationHistoryData
	) => {
		const { item, language, content } = data;
		data.content = item.contents![language];
		item.contents![language] = content;
		if (this.panel!.item === item) {
			const textarea = this.inputs![language];
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

	on(list, 'keydown', this.listKeydown);
	on(list, 'pointerdown', this.listPointerdown);
	on(list, 'pointerdown', Reference.getPointerdownListener!(list), {
		capture: true
	});
	on(list, 'doubleclick', this.listDoubleclick, { capture: true });
	// list select/record/open/popup 经 Vue 模板转发（Localization.vue @select/@record/@open/@popup → Localization.list*）
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
	const inputs: Record<string, HTMLElement> = (this.inputs = {});
	for (const language of this.languages!) {
		const detailBox = createDetailBox();
		const detailSummary = createDetailSummary();
		detailSummary.textContent = Local.get!('languages.' + language);
		const textarea = createTextArea();
		(textarea as HTMLElement & { language: string }).language = language;
		textarea.setAttribute('menu', 'tag-global tag-dynamic-global-var');
		addClass(textarea, 'localization-text-area');
		detailBox.appendChild(detailSummary);
		detailBox.appendChild(textarea);
		this.panel!.appendChild(detailBox);
		inputs[language] = textarea;
		Selection.addEventListeners(textarea);
	}
};

Localization.open = function (target: LocalizationTarget | null | undefined = null) {
	this.target = target;
	this._previousActive = UndoManager.getActive();
	this.history = new History(100);
	UndoManager.setActive(this);
	this.unpackLocalization();
	this.createInputs();
	Window.open!('localization');

	const list = this.list!;
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
	window.addEventListener('keydown', Reference.getKeydownListener!(list, 'localization'));
};

Localization.undo = function () {
	if (this.history!.canUndo()) {
		this.history!.restore('undo');
	}
};

Localization.redo = function () {
	if (this.history!.canRedo()) {
		this.history!.restore('redo');
	}
};

Localization.createId = function () {
	let id;
	do {
		id = GUID.generate64bit();
	} while (!!this.idMap![id]);
	return id;
};

Localization.register = function (item: LocalizationItem) {
	if (item.class === 'folder') {
		for (const child of item.children!) {
			Localization.register(child);
		}
	} else {
		Localization.idMap![item.id!] = true;
	}
};

Localization.unregister = function (item: LocalizationItem) {
	if (item.class === 'folder') {
		for (const child of item.children!) {
			Localization.unregister(child);
		}
	} else {
		delete Localization.idMap![item.id!];
	}
};

Localization.getItemById = (function IIFE() {
	const find = (
		items: LocalizationItem[] | null | undefined,
		id: string
	): LocalizationItem | undefined => {
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
	return function (this: LocalizationShape, id: string) {
		return find(this.data, id);
	};
})();

Localization.openContentPanel = function (item: LocalizationItem) {
	const panel = this.panel!;
	if (panel.item !== item) {
		panel.item = item;
		show(panel);
		const inputs = this.inputs!;
		for (const language of this.languages!) {
			const textarea = inputs[language];
			write(textarea, item.contents![language]);
			this.resizeTextArea(textarea);
		}
	}
};

Localization.closeContentPanel = function () {
	const panel = this.panel!;
	if (panel.item) {
		panel.item = null;
		hide(panel);
	}
};

Localization.unpackLocalization = (function IIFE() {
	class ReferencedFolder {
		data: LocalizationItem;
		class: string;
		name: string;
		children: LocalizationItem[];
		constructor(item: LocalizationItem) {
			this.data = item;
			this.class = item.class!;
			this.name = item.name;
			this.children = clone(item.children);
		}

		get expanded() {
			return this.data.expanded;
		}

		set expanded(value: boolean | undefined) {
			this.data.expanded = value;
			File.planToSave!(Data.manifest.project.localization);
		}
	}
	const clone = (items: LocalizationItem[] | null | undefined): LocalizationItem[] => {
		const length = items!.length;
		const copies = new Array(length);
		for (let i = 0; i < length; i++) {
			const item = items![i];
			if (item.class !== 'folder') {
				copies[i] = Object.clone(item);
				Localization.idMap![item.id!] = true;
			} else {
				copies[i] = new ReferencedFolder(item);
			}
		}
		return copies;
	};
	return function (this: LocalizationShape) {
		this.idMap = {};
		this.data = clone(Data.localization.list);
		this.languages = Data.config.localization.languages.map(
			(lang: { name: string }) => lang.name
		);
	};
})();

Localization.packLocalization = (function IIFE() {
	const clone = (items: LocalizationItem[] | null | undefined): LocalizationItem[] => {
		const length = items!.length;
		const copies = new Array(length);
		for (let i = 0; i < length; i++) {
			const item = items![i];
			if (item.class !== 'folder') {
				copies[i] = Object.clone(item);
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
	return function (this: LocalizationShape) {
		Data.localization.list = clone(this.data);
		Data.createLocalizationMap();
	};
})();

Localization.resizeTextArea = function (textarea: HTMLElement) {
	const shadowDOM = textarea.querySelector('textarea');
	textarea.style.height = '0';
	textarea.style.height = `${Math.clamp(shadowDOM!.scrollHeight + 11, 40, 200)}px`;
};

Localization.windowClose = function (this: LocalizationShape, event: Event) {
	this.list!.saveScroll();
	if (this.changed) {
		event.preventDefault();
		const get = Local.createGetter!('confirmation');
		Window.confirm!(
			{
				message: get('closeUnsavedLocalization')
			},
			[
				{
					label: get('yes'),
					click: () => {
						this.changed = false;
						Window.close!('localization');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
}.bind(Localization);

Localization.windowClosed = function (this: LocalizationShape, event: Event) {
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
	window.removeEventListener('keydown', Reference.getKeydownListener!(this.list!));
}.bind(Localization);

Localization.keydown = Shortcuts.createUndoRedo(Localization);

Localization.listKeydown = function (this: TreeListElement, event: KeyboardEvent) {
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

Localization.listPointerdown = function (this: TreeListElement, event: PointerEvent) {
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

Localization.listDoubleclick = function (event: MouseEvent) {
	if (Localization.target && read(Localization.list)?.id !== undefined) {
		getFocus(Localization.target);
		event.stopPropagation();
		event.preventDefault();
		Localization.confirm();
	}
};

Localization.listSelect = function (event: Event) {
	const item = event.value;
	return item.class !== 'folder'
		? Localization.openContentPanel(item)
		: Localization.closeContentPanel();
};

Localization.listRecord = function (event: Event) {
	Localization.changed = true;
	Localization.history!.save({
		type: 'localization-list-operation',
		response: event.value
	});
};

Localization.listOpen = function (event: MouseEvent) {
	Localization.listDoubleclick(event);
};

Localization.listPopup = function (event: Event & { clientX: number; clientY: number }) {
	const list = Localization.list!;
	const item = event.value;
	const selected = !!item;
	const copyable = selected && item.class !== 'folder';
	const pastable = (Clipboard as unknown as Clipboard).has('yami.data.localization');
	const undoable = Localization.history!.canUndo();
	const redoable = Localization.history!.canRedo();
	const get = Local.createGetter!('menuLocalList');
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
					label: get('create.text'),
					accelerator: 'Insert',
					click: () => {
						list.addNodeTo(list.createItem(), item);
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

Localization.panelInput = function (event: Event) {
	const element = event.target as HTMLElement;
	if (element.tagName === 'TEXTAREA') {
		const item = Localization.panel!.item;
		const textarea = element.parentNode as HTMLElement & { language: string };
		const language = textarea.language;
		const history = Localization.history!;
		const index = history.index;
		const length = history.length;
		const record = history[index];
		if (
			index !== length - 1 ||
			record === undefined ||
			record.item !== item ||
			record.language !== language
		) {
			Localization.history!.save({
				type: 'localization-content-change',
				item: item,
				language: language,
				content: item!.contents![language]
			});
		}
		item!.contents![language] = read(textarea);
		Localization.resizeTextArea(textarea);
		Localization.list!.updateInitText(item);
		Localization.changed = true;
	}
};

Localization.panelKeydown = function (event: KeyboardEvent) {
	if ((event.target as HTMLElement).tagName === 'TEXTAREA' && (event.ctrlKey || event.metaKey)) {
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

Localization.searcherInput = function (this: TextBox, event: InputEvent) {
	if (event.inputType === 'insertCompositionText') {
		return;
	}
	const text = this.input!.value;
	Localization.list!.searchNodesDebounced(text);
};

Localization.confirm = function (this: LocalizationShape, event?: Event) {
	if (this.target) {
		const item = read(this.list);
		if (item?.id === undefined) {
			return getFocus(this.list);
		}
		Selection.restoreContext();
		this.apply();
		this.target?.input?.(item.id);
	} else {
		this.apply();
	}
	Window.close!('localization');
}.bind(Localization);

Localization.apply = function (this: LocalizationShape, event?: Event) {
	if (this.changed) {
		this.changed = false;

		this.packLocalization();
		File.planToSave!(Data.manifest.project.localization);

		window.dispatchEvent(new Event('localizationchange'));
	}
}.bind(Localization);

Localization.fromExcel = async function (this: LocalizationShape, event: Event) {
	const items = await ipcRenderer.invoke('from-excel');
	if (JSON.stringify(items) == JSON.stringify(Data.localization.list) || !items.length) return;
	Data.localization.list = items;
	Localization.windowClose(event);
	Localization.windowClosed(event);
	Localization.open();
	this.changed = true;
	Localization.apply();
}.bind(Localization);

Localization.toExcel = function (this: LocalizationShape, event?: Event) {
	ipcRenderer.invoke('to-excel', {
		langs: this.languages,
		list: Data.localization.list
	});
}.bind(Localization);

// bindListClipboardMethods 改为 ensureDomBound 内调用（list 顶层为 null）

// 列表 - 保存滚动状态
Localization.list_saveScroll = function (this: TreeListElement) {
	const { localization } = Data;
	// 将数据保存在外部可以切换项目后重置
	if (localization.scrollTop === undefined) {
		Object.defineProperty(localization, 'scrollTop', {
			writable: true,
			value: 0
		});
	}
	localization.scrollTop = this.scrollTop;
};

// 列表 - 恢复滚动状态
Localization.list_restoreScroll = function (this: TreeListElement) {
	this.scrollTop = Data.localization.scrollTop ?? 0;
};

// 列表 - 取消搜索
Localization.list_cancelSearch = function (this: TreeListElement) {
	if (this.display === 'search') {
		const active = document.activeElement;
		Localization.searcher!.deleteInputContent();
		this.expandToSelection();
		this.scrollToSelection();
		active?.focus();
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
	for (const language of Localization.languages!) {
		contents[language] = '';
	}
	return {
		id: Localization.createId(),
		name: '',
		contents: contents
	};
};

// 列表 - 重写创建图标方法
Localization.list_createIcon = function (item: LocalizationItem) {
	const icon = document.createElement('node-icon');
	if (item.class !== 'folder') {
		addClass(icon, 'icon-string');
	} else {
		addClass(icon, 'icon-folder');
	}
	return icon;
};

// 列表 - 添加元素类名
Localization.list_addElementClass = function (item: LocalizationItem) {
	addClass(item.element, 'localization-item');
};

// 列表 - 更新项目类名
Localization.list_updateItemClass = function (item: LocalizationItem) {
	if (item.class !== 'folder') {
		addClass(item.element, 'reference');
	} else {
		removeClass(item.element, 'reference');
	}
};

// 列表 - 重写更新项目名称方法
Localization.list_updateItemName = function (this: TreeListElement, item: LocalizationItem) {
	TreeList.prototype.updateItemName.call(this, item);
	this.updateInitText(item);
};

// 列表 - 创建初始化文本
Localization.list_createInitText = function (item: LocalizationItem) {
	if (item.class !== 'folder') {
		const element = item.element!;
		const initText = document.createElement('div');
		addClass(initText, 'localization-init-text');
		addClass(initText, 'text');
		element.appendChild(initText);
		element.initText = initText;
		element.attrValue = '';
	}
};

// 列表 - 更新初始化文本
Localization.list_updateInitText = function (item: LocalizationItem) {
	const { element } = item;
	if (element?.initText !== undefined) {
		let value = '';
		for (const language of Localization.languages!) {
			if (item.contents![language]) {
				value = item.contents![language];
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
Localization.list_onCreate = function (item: LocalizationItem) {
	Localization.register(item);
};

// 列表 - 在删除数据时回调
Localization.list_onDelete = function (item: LocalizationItem) {
	Localization.unregister(item);
};

// 列表 - 在恢复数据时回调
Localization.list_onResume = function (item: LocalizationItem) {
	Localization.register(item);
};
