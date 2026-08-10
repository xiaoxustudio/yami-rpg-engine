import { $, getElementWriter } from '@/util/dom.ts';
import { getSelectorInstance } from '@app/stores/selector.ts';
import { Window } from '@/tools/window-object.ts';
import { clear, getFocus, hide, on, show } from '@/util/element-utils.ts';
import { Command } from './command-object.ts';
import { Menu } from '@/components/menu-list.ts';
import { TreeList } from '@/components/tree-list.ts';
import { Data } from '@/data/data-object.ts';
import { Easing } from '@/data/transition-window.ts';
import { File } from '@/file/file-system-core.ts';
import { PluginManager } from '@/plugin/plugin.ts';
import { Local } from '@/tools/localization.ts';
import { ScriptListInterface } from '@/tools/script-list.ts';
import { getGlobalClipboard } from '@/types/global-clipboard.ts';
import type { EditorProjectShape } from '@app/stores/editor';

import { ctrl } from '@/util/event-accessors.ts';

const Clipboard = getGlobalClipboard();

interface CustomCommandData {
	id: string;
	enabled: boolean;
	alias: string;
	keywords: string;
	parameters?: Record<string, unknown>;
}

// 自定义指令列表元素契约
interface CustomCommandList {
	removable: boolean;
	creators: CustomCommandMethod[];
	updaters: CustomCommandMethod[];
	insert: ((dItem?: CustomCommandData | null) => void) | null;
	toggle: ((item: CustomCommandData | null) => void) | null;
	copy: ((item: CustomCommandData | null) => void) | null;
	paste: ((dItem?: CustomCommandData | null) => void) | null;
	delete: (item: CustomCommandData | null) => void;
	saveSelection: (() => void) | null;
	restoreSelection: (() => void) | null;
	updateNodeElement: CustomCommandMethod;
	addElementClass: CustomCommandMethod;
	updateTextNode: CustomCommandMethod;
	updateToggleStyle: (item: CustomCommandData) => void;
	createEditIcon: CustomCommandMethod;
	edit: (item: CustomCommandData) => void;
	bind(getter: () => CustomCommandData[] | null): void;
	addEventListener(type: string, listener: (event: Event) => void): void;
	on<E extends Event>(type: string, listener: (event: E) => void): void;
	getFocus(): void;
	read(): CustomCommandData | null;
	clear(): void;
	update(): void;
	select(item: CustomCommandData): void;
	scrollToSelection(): void;
	addNodeTo(node: CustomCommandData, dItem?: unknown): void;
	data: CustomCommandData[];
}

type CustomCommandMethod = ((...args: any[]) => any) | null;

interface CustomCommandShape {
	close: ((id?: string) => void) | null;
	state: string | null;
	commands: CustomCommandData[] | null;
	saveToProject: ((project: EditorProjectShape) => void) | null;
	loadFromProject: ((project: EditorProjectShape) => void) | null;

	list: CustomCommandList;
	overviewPane: HTMLElement & {
		hide(): HTMLElement & { hide(): HTMLElement };
		show(): HTMLElement;
	};
	overview: HTMLElement & {
		clear(): HTMLElement;
		appendChild<T extends Node>(node: T): T;
	};
	settingsPane: HTMLElement & { hide(): HTMLElement; show(): HTMLElement };
	data: CustomCommandData[] | null;
	meta: unknown;
	symbol: symbol | null;
	changed: boolean;
	initialize: (() => void) | null;
	open: (() => void) | null;
	load: ((item: CustomCommandData) => Promise<void>) | null;
	unload: (() => void) | null;
	loadOverview: (() => void) | null;
	createData: ((id: string) => CustomCommandData) | null;
	getItemById: ((id: string) => CustomCommandData | null) | null;
	windowClose: ((event: Event) => void) | null;
	windowClosed: ((event: Event) => void) | null;
	pointerdown: CustomCommandMethod;
	scriptChange: ((event: Event & { changedMeta: unknown }) => void) | null;
	listKeydown: ((this: CustomCommandList, event: KeyboardEvent) => void) | null;
	listSelect: ((event: Event & { value: CustomCommandData }) => void) | null;
	listUnselect: (() => void) | null;
	listChange: (() => void) | null;
	listPopup:
		| ((
				this: CustomCommandList,
				event: PointerEvent & {
					value: CustomCommandData | null;
					clientX: number;
					clientY: number;
				}
		  ) => void)
		| null;
	listOpen:
		| ((this: CustomCommandList, event: Event & { value: CustomCommandData }) => void)
		| null;
	paramInput: ((this: HTMLElement & { id: string; read(): string }, event: Event) => void) | null;
	confirm: ((event: Event) => void) | null;
	apply: ((event: Event) => void) | null;
	list_edit: CustomCommandMethod;
	list_insert: CustomCommandMethod;
	list_toggle: CustomCommandMethod;
	list_copy: CustomCommandMethod;
	list_paste: CustomCommandMethod;
	list_saveSelection: CustomCommandMethod;
	list_restoreSelection: CustomCommandMethod;
}

export const CustomCommand: CustomCommandShape = {
	list: null as unknown as CustomCommandList,
	overviewPane: null as unknown as HTMLElement & {
		hide(): HTMLElement & { hide(): HTMLElement };
		show(): HTMLElement;
	},
	overview: null as unknown as CustomCommandShape['overview'],
	settingsPane: null as unknown as HTMLElement & { hide(): HTMLElement; show(): HTMLElement },
	data: null,
	meta: null,
	symbol: null,
	changed: false,
	initialize: null,
	open: null,
	load: null,
	unload: null,
	loadOverview: null,
	createData: null,
	getItemById: null,
	windowClose: null,
	windowClosed: null,
	pointerdown: null,
	scriptChange: null,
	listKeydown: null,
	listSelect: null,
	listUnselect: null,
	listChange: null,
	listPopup: null,
	listOpen: null,
	paramInput: null,
	confirm: null,
	apply: null,
	list_edit: null,
	list_insert: null,
	list_toggle: null,
	list_copy: null,
	list_paste: null,
	list_saveSelection: null,
	list_restoreSelection: null,
	state: null as string | null,
	commands: null as CustomCommandData[] | null,
	saveToProject: null,
	loadFromProject: null,
	close: null as ((id?: string) => void) | null
};

function ensureDomBound() {
	if (CustomCommand.list) return;
	const list = $('#command-list');
	if (!list) return;
	CustomCommand.list = list as unknown as CustomCommandList;
	CustomCommand.overviewPane = $('#command-overview-detail');
	hide(CustomCommand.overviewPane);
	CustomCommand.overview = $('#command-overview') as unknown as CustomCommandShape['overview'];
	CustomCommand.settingsPane = $('#command-settings-detail');
	hide(CustomCommand.settingsPane);
	list.insert = null as unknown as (...args: unknown[]) => any;
	list.toggle = null as unknown as (...args: unknown[]) => any;
	list.copy = null as unknown as (...args: unknown[]) => any;
	list.paste = null as unknown as (...args: unknown[]) => any;
	list.delete = PluginManager.list_delete as (item: CustomCommandData | null) => void;
	list.saveSelection = null as unknown as (...args: unknown[]) => any;
	list.restoreSelection = null as unknown as (...args: unknown[]) => any;
	list.updateNodeElement = Easing.list_updateNodeElement as unknown as (
		...args: unknown[]
	) => any;
	list.addElementClass = PluginManager.list_addElementClass as unknown as (
		...args: unknown[]
	) => any;
	list.updateTextNode = PluginManager.list_updateTextNode as unknown as (
		...args: unknown[]
	) => any;
	list.updateToggleStyle = PluginManager.list_updateToggleStyle as unknown as (
		...args: unknown[]
	) => any;
	list.createEditIcon = PluginManager.list_createEditIcon as unknown as (
		...args: unknown[]
	) => any;
	list.edit = CustomCommand.list_edit as unknown as (item?: unknown) => unknown;
	list.insert = CustomCommand.list_insert as unknown as (...args: unknown[]) => any;
	list.toggle = CustomCommand.list_toggle as unknown as (...args: unknown[]) => any;
	list.copy = CustomCommand.list_copy as unknown as (...args: unknown[]) => any;
	list.paste = CustomCommand.list_paste as unknown as (...args: unknown[]) => any;
	list.saveSelection = CustomCommand.list_saveSelection as unknown as (...args: unknown[]) => any;
	list.restoreSelection = CustomCommand.list_restoreSelection as unknown as (
		...args: unknown[]
	) => any;
}

CustomCommand.initialize = function (this: CustomCommandShape): void {
	ensureDomBound();
	if (!CustomCommand.list) return;
	const { list } = this;
	list.removable = true;
	list.bind(() => this.data);
	list.creators?.push(list.addElementClass);
	list.creators?.push(list.updateToggleStyle);
	list.updaters?.push(list.updateTextNode);
	list.creators?.push(list.createEditIcon);

	$('#command').addEventListener('close', this.windowClose!);
	$('#command').addEventListener('closed', this.windowClosed!);
	list.on('keydown', this.listKeydown!);
	// list select/popup/open/change 经 Vue 模板转发（Command.vue @select/@popup/@open/@change → CustomCommand.list*）
	list.on('unselect', this.listUnselect!);
	list.on('pointerdown', ScriptListInterface.listPointerdown);
	document
		.querySelectorAll('#command-alias, #command-keywords')
		.forEach((el) => el.addEventListener('input', this.paramInput!));
	on($('#command-confirm') as HTMLElement, 'click', this.confirm!);
	on($('#command-apply') as HTMLElement, 'click', this.apply!);
};

CustomCommand.open = function (this: CustomCommandShape): void {
	Window.open!('command');

	this.data = Object.clone(Data.commands);

	this.list.restoreSelection!();

	getFocus(this.list);

	window.addEventListener('pointerdown', this.pointerdown!);
	window.addEventListener('script-change', this.scriptChange! as EventListener);
};

CustomCommand.load = async function (
	this: CustomCommandShape,
	item: CustomCommandData
): Promise<void> {
	const symbol = (this.symbol = Symbol());
	const meta = await Data.scripts[item.id];
	if (this.symbol === symbol) {
		this.symbol = null;
		this.meta = meta;
		this.loadOverview!();
		const data = this.list.read();
		if (data) {
			const write = getElementWriter('command', data);
			write('alias');
			write('keywords');
			show(this.settingsPane);
		}
	}
};

CustomCommand.unload = function (this: CustomCommandShape): void {
	this.meta = null;
	this.symbol = null;
	clear(this.overview);
	hide(this.overviewPane);
	hide(this.settingsPane);
};

CustomCommand.loadOverview = function (this: CustomCommandShape): void {
	const { meta } = this;
	if (!meta) return;
	const elements = PluginManager.createOverview(meta, true);
	const overview = clear(this.overview);
	for (const element of elements) {
		overview.appendChild(element);
	}
	show(this.overviewPane);
};

CustomCommand.createData = function (this: CustomCommandShape, id: string): CustomCommandData {
	return {
		id: id,
		enabled: true,
		alias: '',
		keywords: ''
	};
};

CustomCommand.getItemById = Easing.getItemById;

CustomCommand.windowClose = function (this: CustomCommandShape, event: Event): void {
	if (this.changed) {
		event.preventDefault();
		const get = Local.createGetter!('confirmation');
		Window.confirm!(
			{
				message: get('closeUnsavedCommands')
			},
			[
				{
					label: get('yes'),
					click: () => {
						this.changed = false;
						Window.close!('command');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
}.bind(CustomCommand);

CustomCommand.windowClosed = function (this: CustomCommandShape, event: Event): void {
	this.list.saveSelection!();
	this.data = null;
	this.list.clear();
	window.removeEventListener('pointerdown', this.pointerdown!);
	window.removeEventListener('script-change', this.scriptChange! as EventListener);
}.bind(CustomCommand);

CustomCommand.pointerdown = PluginManager.pointerdown;

CustomCommand.scriptChange = function (event: Event & { changedMeta: unknown }): void {
	if (CustomCommand.meta === event.changedMeta) {
		CustomCommand.loadOverview!();
	}
};

CustomCommand.listKeydown = function (
	this: CustomCommandList,
	event: KeyboardEvent & { cmdOrCtrlKey: boolean; altKey: boolean }
): void {
	const item = this.read();
	if (event.ctrlKey || event.metaKey) {
		switch (event.code) {
			case 'KeyC':
				this.copy!(item);
				break;
			case 'KeyV':
				this.paste!();
				break;
		}
	} else if (event.altKey) {
		return;
	} else {
		switch (event.code) {
			case 'Insert':
				this.insert!(item);
				break;
			case 'Slash':
				this.toggle!(item);
				break;
			case 'Delete':
				this.delete(item);
				break;
		}
	}
};

CustomCommand.listSelect = function (event: Event & { value: CustomCommandData }): void {
	CustomCommand.load!(event.value);
};

CustomCommand.listUnselect = function (): void {
	CustomCommand.unload!();
};

CustomCommand.listChange = function (): void {
	CustomCommand.changed = true;
};

CustomCommand.listPopup = function (
	this: CustomCommandList,
	event: PointerEvent & {
		value: CustomCommandData | null;
		clientX: number;
		clientY: number;
	}
): void {
	const list = CustomCommand.list;
	const item = event.value;
	const selected = !!item;
	const pastable = Clipboard.has('yami.data.customCommand');
	const deletable = selected;
	const get = Local.createGetter!('menuCustomCommandList');
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
					list.edit(item!);
				}
			},
			{
				label: get('insert'),
				accelerator: 'Insert',
				click: () => {
					list.insert!(item);
				}
			},
			{
				label: get('toggle'),
				accelerator: '/',
				enabled: selected,
				click: () => {
					list.toggle!(item);
				}
			},
			{
				label: get('copy'),
				accelerator: ctrl('C'),
				enabled: selected,
				click: () => {
					list.copy!(item);
				}
			},
			{
				label: get('paste'),
				accelerator: ctrl('V'),
				enabled: pastable,
				click: () => {
					list.paste!(item);
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
};

CustomCommand.listOpen = function (
	this: CustomCommandList,
	event: Event & {
		value: CustomCommandData;
	}
): void {
	const list = CustomCommand.list;
	list.edit(event.value);
};

CustomCommand.paramInput = function (
	this: HTMLElement & { id: string; read(): string },
	event: Event
): void {
	CustomCommand.changed = true;
	const data = CustomCommand.list.read()!;
	switch (this.id) {
		case 'command-alias':
			(data as CustomCommandData).alias = this.read();
			break;
		case 'command-keywords':
			(data as CustomCommandData).keywords = this.read();
			break;
	}
};

CustomCommand.confirm = function (this: CustomCommandShape, event: Event): void {
	this.apply!(event);
	Window.close!('command');
}.bind(CustomCommand);

CustomCommand.apply = function (this: CustomCommandShape, event: Event): void {
	if (this.changed) {
		this.changed = false;

		let commands = this.data;
		if (event instanceof Event) {
			commands = Object.clone(commands);
		} else {
			TreeList.deleteCaches(commands);
		}
		Data.commands = commands;
		File.planToSave!(Data.manifest.project.commands);
		Command.custom.loadCommandList!();
	}
}.bind(CustomCommand);

CustomCommand.list_edit = function (this: CustomCommandList, item: CustomCommandData): void {
	getSelectorInstance()?.open?.(
		{
			filter: 'script',
			read: () => item.id,
			input: (id: string) => {
				if (item.id !== id) {
					item.id = id;
					item.parameters = {};
					CustomCommand.changed = true;
					// CustomCommand.parameterPane.update()
				}
				this.update();
			}
		},
		false
	);
};

CustomCommand.list_insert = function (this: CustomCommandList, dItem?: unknown): void {
	getSelectorInstance()?.open?.(
		{
			filter: 'script',
			read: () => '',
			input: (id: string) => {
				this.addNodeTo(CustomCommand.createData!(id), dItem);
			}
		},
		false
	);
};

CustomCommand.list_toggle = function (
	this: CustomCommandList,
	item: CustomCommandData | null
): void {
	if (item) {
		(item as CustomCommandData).enabled = !item.enabled;
		this.updateToggleStyle(item);
		CustomCommand.changed = true;
	}
};

CustomCommand.list_copy = function (item: CustomCommandData | null): void {
	if (item) {
		Clipboard.write('yami.data.customCommand', item);
	}
};

CustomCommand.list_paste = function (this: CustomCommandList, dItem?: unknown): void {
	const copy = Clipboard.read('yami.data.customCommand');
	if (copy) {
		this.addNodeTo(copy, dItem);
	}
};

CustomCommand.list_saveSelection = function (this: CustomCommandList): void {
	const { commands } = Data;
	if (commands.selection === undefined) {
		Object.defineProperty(commands, 'selection', {
			writable: true,
			value: ''
		});
	}
	const selection = this.read();
	if (selection) {
		commands.selection = selection.id;
	}
};

CustomCommand.list_restoreSelection = function (this: CustomCommandList): void {
	const id = Data.commands.selection;
	const item = CustomCommand.getItemById!(id) ?? this.data[0];
	this.select(item);
	this.update();
	this.scrollToSelection();
};
