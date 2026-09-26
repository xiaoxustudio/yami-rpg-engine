import { getListConfig } from '@ui-kit';
import { createElementRegistry, registryElement } from '@app/utils/element-registry';
import { getSelectorInstance } from '@app/stores/selector.ts';
import { Window } from '@app/tools/window-object.ts';
import { getFocus, hide, on, show } from '@app/utils/element-utils.ts';
import { Command } from '@app/commands/command-object.ts';
import { Menu } from '@app/components/menu-list.ts';
import { TreeList } from '@app/components/tree-list.ts';
import { Data } from '@app/data/data-object.ts';
import { Easing } from '@app/data/transition-window.ts';
import { File } from '@app/file/file-system-core.ts';
import { PluginManager } from '@app/plugin/plugin.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { GlobalClipboard } from '@app/utils/clipboard';
import { reactive } from 'vue';
import type { EditorProjectShape } from '@app/stores/editor';

import { ctrl } from '@app/utils/event-accessors';

const Clipboard = GlobalClipboard;

export interface CustomCommandData {
	id: string;
	enabled: boolean;
	alias: string;
	keywords: string;
	parameters?: Record<string, unknown>;
}

export const commandForm = reactive<{ alias: string; keywords: string }>({
	alias: '',
	keywords: ''
});

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
	updateTextNode: CustomCommandMethod;
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

// oxlint-disable-next-line no-explicit-any
type CustomCommandMethod = ((...args: any[]) => any) | null;

interface CustomCommandShape {
	close: ((id?: string) => void) | null;
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
	listKeydown:
		| ((
				this: CustomCommandList,
				event: KeyboardEvent & { cmdOrCtrlKey: boolean; altKey: boolean }
		  ) => void)
		| null;
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
	paramInput:
		| ((this: CustomCommandShape, event: Event & { target?: EventTarget | null }) => void)
		| null;
	confirm: ((event: Event) => void) | null;
	apply: ((event: Event) => void) | null;
	list_edit: CustomCommandMethod;
	list_insert: CustomCommandMethod;
	list_toggle: CustomCommandMethod;
	list_copy: CustomCommandMethod;
	list_paste: CustomCommandMethod;
	list_saveSelection: CustomCommandMethod;
	list_restoreSelection: CustomCommandMethod;
	/**
	 * 与 Pinia store 双向桥接的两个键（见 `stores/custom-command.ts` 的
	 * `customCommandStateKeys = ['state', 'commands']`），类型与 store 的 `shallowRef` 对齐。
	 */
	state: string;
	commands: CustomCommandData[];
}

export const CustomCommand = {
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
	saveToProject: null,
	loadFromProject: null,
	close: null as ((id?: string) => void) | null
} satisfies Partial<CustomCommandShape> as CustomCommandShape;

/** 控件元素注册表——由 `Command.vue` 在模板里登记 */
export const customCommandEls = createElementRegistry();

function ensureDomBound() {
	if (CustomCommand.list) return;
	const list = registryElement<CustomCommandList>(customCommandEls, 'command-list');
	if (!list) return;
	CustomCommand.list = list;
	CustomCommand.overviewPane = registryElement<CustomCommandShape['overviewPane']>(
		customCommandEls,
		'command-overview-detail'
	)!;
	hide(CustomCommand.overviewPane);
	CustomCommand.overview = registryElement<CustomCommandShape['overview']>(
		customCommandEls,
		'command-overview'
	)!;
	CustomCommand.settingsPane = registryElement<CustomCommandShape['settingsPane']>(
		customCommandEls,
		'command-settings-detail'
	)!;
	hide(CustomCommand.settingsPane);
	// 注：这里原本先把 insert/toggle/copy/paste/saveSelection/restoreSelection 六个成员
	// 写成 `null as unknown as (...args) => void`，紧接着在同一个函数里（下面 6 行）
	// 又全部赋上真实现 —— 那 6 行是**纯死写**（中间没有任何读取），却各贡献一个
	// `null as unknown as`。直接删掉：语义等价，两条棘轮轴同步下降（2026-09-18）。
	list.delete = PluginManager.list_delete as (item: CustomCommandData | null) => void;
	list.updateTextNode = PluginManager.list_updateTextNode as (...args: unknown[]) => void;
	list.edit = CustomCommand.list_edit as (...args: unknown[]) => void;
	list.insert = CustomCommand.list_insert as (...args: unknown[]) => void;
	list.toggle = CustomCommand.list_toggle as (...args: unknown[]) => void;
	list.copy = CustomCommand.list_copy as (...args: unknown[]) => void;
	list.paste = CustomCommand.list_paste as (...args: unknown[]) => void;
	list.saveSelection = CustomCommand.list_saveSelection as (...args: unknown[]) => void;
	list.restoreSelection = CustomCommand.list_restoreSelection as (...args: unknown[]) => void;
}

CustomCommand.initialize = function (this: CustomCommandShape): void {
	ensureDomBound();
	if (!CustomCommand.list) return;
	const { list } = this;
	getListConfig(list).removable = true;
	getListConfig(list).foldable = false;
	list.bind(() => this.data);
	// ⚠️ 这处保留 `as unknown as`（第 81 轮试过并回退）：真正的病灶是本地别名
	// `type CustomCommandMethod = ((...args: any[]) => any) | null`（`updateTextNode` 的类型），
	// 它既带 `any` 又可空。适配器写法会撞上「输出 void vs any」与「可空」两件事，
	// 而按「不改行为」的原则又不能给它加空值判断（原来是**把可能为 null 的值登记进去**，
	// 调用点才抛）。⇒ 别名上的 `any` 需要另行整体收窄，不在这里硬做。
	getListConfig(list).updaters.push(list.updateTextNode as unknown as (item: unknown) => void);

	const frame = customCommandEls.get('command');
	frame?.addEventListener('close', this.windowClose!);
	frame?.addEventListener('closed', this.windowClosed!);
	on(list, 'keydown', this.listKeydown!);
	// list select/popup/open/change 经 Vue 模板转发（Command.vue @select/@popup/@open/@change → CustomCommand.list*）
	on(list, 'unselect', this.listUnselect!);
	// confirm 由 SFC 的 @confirm 驱动（`command-confirm` 按钮由 WindowFrame 生成，注册表取不到）
};

CustomCommand.open = function (this: CustomCommandShape): void {
	Window.open!('command');

	this.data = deepClone(Data.commands);

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
			commandForm.alias = data.alias;
			commandForm.keywords = data.keywords;
			show(this.settingsPane);
		}
	}
};

CustomCommand.unload = function (this: CustomCommandShape): void {
	this.meta = null;
	this.symbol = null;
	this.overview?.dispatchEvent(new Event('update'));
	hide(this.overviewPane);
	hide(this.settingsPane);
};

CustomCommand.loadOverview = function (this: CustomCommandShape): void {
	if (!this.meta) return;
	show(this.overviewPane);
	this.overview?.dispatchEvent(new Event('update'));
};

CustomCommand.createData = function (this: CustomCommandShape, id: string): CustomCommandData {
	return {
		id: id,
		enabled: true,
		alias: '',
		keywords: ''
	};
};

CustomCommand.getItemById = Easing.getItemById as (id: string) => CustomCommandData | null;

CustomCommand.windowClose = function (this: CustomCommandShape, event: Event): void {
	if (this.changed) {
		event.preventDefault();
		const get = (key: string) => t('confirmation.' + key);
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

CustomCommand.windowClosed = function (this: CustomCommandShape, _event: Event): void {
	this.list.saveSelection!();
	this.data = null;
	this.list.clear();
	window.removeEventListener('pointerdown', this.pointerdown!);
	window.removeEventListener('script-change', this.scriptChange! as EventListener);
}.bind(CustomCommand);

Object.defineProperty(CustomCommand, 'pointerdown', {
	get: () => PluginManager.pointerdown,
	configurable: true
});

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
	void CustomCommand.load!(event.value);
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
	const get = (key: string) => t('menuCustomCommandList.' + key);
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
	this: CustomCommandShape,
	_event: Event & { target?: EventTarget | null }
): void {
	CustomCommand.changed = true;
	const data = CustomCommand.list.read()!;
	data.alias = commandForm.alias;
	data.keywords = commandForm.keywords;
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
			commands = deepClone(commands);
		} else {
			TreeList.deleteCaches(commands!);
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
		this.update();
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
	const item = CustomCommand.getItemById!(id) ?? this.data?.[0];
	this.select(item);
	this.update();
	this.scrollToSelection();
};

const customCommandBridgeKeys = ['state', 'commands'] as const;
import { getCustomCommandStore } from '@app/stores/custom-command';
import type {} from '@app/types/editor-event';
import { clone as deepClone } from '@app/utils/object';

for (const key of customCommandBridgeKeys) {
	Object.defineProperty(CustomCommand, key, {
		get: () => getCustomCommandStore()[key],
		set: (value: unknown) => {
			// `Reflect.set` 与 `store[key] = value` 是同一个 `[[Set]]`；store 是 interface
			// （无隐式索引签名），「断言成 Record<…, any>」既过不了可比、又顺带引入一个 `any`。
			Reflect.set(getCustomCommandStore(), key, value);
		},
		configurable: true
	});
}
