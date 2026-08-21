import { getListConfig } from '@ui-kit';
import { $ } from '@app/utils/dom';
import { getSelectorInstance } from '@app/stores/selector.ts';
import type { EditorProjectShape } from '@app/stores/editor';
import { Window } from '@app/tools/window-object.ts';
import { clear, getFocus, hide, on, read, show } from '@app/utils/element-utils.ts';
import { getVariable } from '@app/utils/safe';
import { ctrl } from '@app/utils/event-accessors';
import { Command } from '@app/commands/command-object.ts';
import { Attribute } from '@app/attribute/attribute-window.ts';
import { ActorGetter } from '@app/commands/accessors/actor-accessor-window.ts';
import { ElementGetter } from '@app/commands/accessors/element-accessor-window.ts';
import { EquipmentGetter } from '@app/commands/accessors/equipment-accessor-window.ts';
import { ItemGetter } from '@app/commands/accessors/item-accessor-window.ts';
import { PositionGetter } from '@app/commands/accessors/position-accessor-window.ts';
import { SkillGetter } from '@app/commands/accessors/skill-accessor-window.ts';
import { StateGetter } from '@app/commands/accessors/state-accessor-window.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Menu } from '@app/components/menu-list.ts';
import { TreeList, type TreeListElement } from '@app/components/tree-list.ts';
import { Data } from '@app/data/data-object.ts';
import { Easing } from '@app/data/transition-window.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { File } from '@app/file/file-system-core.ts';
import { getLocalStore } from '@app/stores/local';
import { t, createGetter } from '@app/i18n';
import { GlobalClipboard } from '@app/utils/clipboard';

interface PluginItemShape {
	id: string;
	enabled: boolean;
	parameters?: Record<string, unknown>;
	element?: HTMLElement & { textNode: Text };
}

export type ParameterShape = {
	key: string;
	type: string;
	value: unknown;
	group: string | null;
	options?: (string | number | boolean)[];
	dataItems?: { name: string; value: unknown }[];
	min?: number;
	max?: number;
	decimals?: number;
	filter?: string;
	alias?: string;
	desc?: string;
	validate?: {
		pattern: RegExp | null;
		notEmpty: boolean | null;
		minLength?: number;
		maxLength?: number;
	};
	[k: string]: unknown;
};

export type OverviewShape = {
	requires: { plugin: string; version: string }[];
	plugin?: string;
	author?: string;
	link?: string;
	version?: string;
	deprecated?: string | boolean;
	desc?: string;
	code?: string;
};

export type PluginMetaShape = {
	overview: OverviewShape;
	parameters: ParameterShape[];
	manager: {
		states: Record<string, boolean>;
		update: (parameters: Record<string, unknown>) => void;
		[k: string]: unknown;
	};
	langMap: { update(): { get(key: string | undefined): string } };
	[k: string]: unknown;
};

type OptionParameterShape = {
	key: string;
	type: string;
	value?: unknown;
	options?: (string | number | boolean)[];
	parent?: OptionParameterShape | null;
	wrap?: { priority: number };
	[k: string]: unknown;
};

type LanguagePackShape = {
	name: string;
	code?: string;
	base?: string;
	map?: Record<string, string>;
	[k: string]: unknown;
};

type PluginScriptShape = {
	id: string;
	parameters: Record<string, unknown> | null;
} & Record<string, unknown>;

interface ClipboardShape {
	has(format: string): boolean;
	read(format: string): unknown;
	write(format: string, object: unknown): void;
}

interface PluginManagerShape {
	list: HTMLElement | null;
	overviewPane: HTMLElement | null;
	overview: HTMLElement | null;
	parameterPane: HTMLElement | null;
	data: PluginItemShape[] | null;
	meta: PluginMetaShape | null;
	symbol: symbol | null;
	detailed: boolean;
	changed: boolean;
	initialize: (() => void) | null;
	open: (() => void) | null;
	load: ((item?: PluginItemShape) => Promise<void>) | null;
	unload: (() => void) | null;
	loadOverview: (() => void) | null;
	createData: (...args: unknown[]) => PluginItemShape;
	getItemById: ((...args: unknown[]) => ReturnType<typeof Easing.getItemById>) | null;
	switchOverviewMode: (() => void) | null;
	parseMeta: ((...args: unknown[]) => void) | null;
	reconstruct: (...args: unknown[]) => boolean;
	saveToProject: ((...args: unknown[]) => void) | null;
	loadFromProject: ((...args: unknown[]) => void) | null;
	windowClose: ((...args: unknown[]) => void) | null;
	windowClosed: ((...args: unknown[]) => void) | null;
	keydown: ((...args: unknown[]) => void) | null;
	pointerdown: ((...args: unknown[]) => void) | null;
	scriptChange: ((...args: unknown[]) => void) | null;
	listKeydown: ((...args: unknown[]) => void) | null;
	listSelect: ((...args: unknown[]) => void) | null;
	listUnselect: ((...args: unknown[]) => void) | null;
	listChange: ((...args: unknown[]) => void) | null;
	listPopup: ((...args: unknown[]) => void) | null;
	listOpen: ((...args: unknown[]) => void) | null;
	overviewPointerdown: ((...args: unknown[]) => void) | null;
	parameterPaneUpdate: ((...args: unknown[]) => void) | null;
	confirm: ((...args: unknown[]) => void) | null;
	apply: ((...args: unknown[]) => void) | null;
	checkValidate: ((...args: unknown[]) => boolean) | null;
	list_edit: ((item: PluginItemShape) => void) | null;
	list_insert: ((dItem: PluginItemShape) => void) | null;
	list_toggle: ((item: PluginItemShape) => void) | null;
	list_copy: ((item: PluginItemShape) => void) | null;
	list_paste: ((dItem: PluginItemShape) => void) | null;
	list_delete: (item: PluginItemShape) => void;
	list_saveSelection: (() => void) | null;
	list_restoreSelection: (() => void) | null;
	list_updateTextNode: ((item: PluginItemShape) => void) | null;
	reload: (() => void) | null;
	[k: string]: any;
}

export const PluginManager: PluginManagerShape = {
	list: null,
	overviewPane: null,
	overview: null,
	parameterPane: null,
	data: null,
	meta: null,
	symbol: null,
	detailed: false,
	changed: false,
	initialize: null,
	open: null,
	load: null,
	unload: null,
	loadOverview: null,
	createData: null as unknown as (...args: unknown[]) => PluginItemShape,
	getItemById: null,
	switchOverviewMode: null,
	parseMeta: null,
	reconstruct: null as unknown as (...args: unknown[]) => boolean,
	saveToProject: null,
	loadFromProject: null,
	windowClose: null,
	windowClosed: null,
	keydown: null,
	pointerdown: null,
	scriptChange: null,
	listKeydown: null,
	listSelect: null,
	listUnselect: null,
	listChange: null,
	listPopup: null,
	listOpen: null,
	overviewPointerdown: null,
	parameterPaneUpdate: null,
	confirm: null,
	apply: null,
	checkValidate: null,
	list_edit: null,
	list_insert: null,
	list_toggle: null,
	list_copy: null,
	list_paste: null,
	list_delete: null as unknown as (item: PluginItemShape) => void,
	list_saveSelection: null,
	list_restoreSelection: null,
	list_updateTextNode: null,
	reload: null
};

function ensureDomBound() {
	if (PluginManager.list) return;
	const list = $('#plugin-list');
	if (!list) return;
	PluginManager.list = list;
	PluginManager.overviewPane = $('#plugin-overview-detail');
	hide(PluginManager.overviewPane);
	PluginManager.overview = $('#plugin-overview');
	PluginManager.parameterPane = $('#plugin-parameter-pane');
	hide(PluginManager.parameterPane);
	list.insert = null as unknown as (...args: unknown[]) => any;
	list.toggle = null as unknown as (...args: unknown[]) => any;
	list.copy = null as unknown as (...args: unknown[]) => any;
	list.paste = null as unknown as (...args: unknown[]) => any;
	list.delete = null as unknown as (...args: unknown[]) => any;
	list.saveSelection = null as unknown as (...args: unknown[]) => any;
	list.restoreSelection = null as unknown as (...args: unknown[]) => any;
	list.updateTextNode = PluginManager.list_updateTextNode as unknown as (
		...args: unknown[]
	) => any;
	list.edit = PluginManager.list_edit as unknown as (...args: unknown[]) => any;
	list.insert = PluginManager.list_insert as unknown as (...args: unknown[]) => any;
	list.toggle = PluginManager.list_toggle as unknown as (...args: unknown[]) => any;
	list.copy = PluginManager.list_copy as unknown as (...args: unknown[]) => any;
	list.paste = PluginManager.list_paste as unknown as (...args: unknown[]) => any;
	list.delete = PluginManager.list_delete as unknown as (...args: unknown[]) => any;
	list.saveSelection = PluginManager.list_saveSelection as unknown as (...args: unknown[]) => any;
	list.restoreSelection = PluginManager.list_restoreSelection as unknown as (
		...args: unknown[]
	) => any;
}

// pane methods 注意：不再重写 ParameterPane.createDetailBox / clear，因为它们在 ParameterPane.initialize 中被重写

PluginManager.initialize = function (this: typeof PluginManager) {
	ensureDomBound();
	const list = this.list as TreeListElement | null;
	if (!list) return;
	getListConfig(list).removable = true;
	getListConfig(list).foldable = false;
	list.bind(() => this.data);
	getListConfig(list).updaters.push(list.updateTextNode);

	if (this.parameterPane) {
		(this.parameterPane as TreeListElement).bind(list);
	}

	on($('#plugin'), 'close', this.windowClose!);
	on($('#plugin'), 'closed', this.windowClosed!);
	on(list, 'keydown', this.listKeydown!);
	// list select/popup/open 经 Vue 模板转发（Plugin.vue @select/@popup/@open → PluginManager.list*）
	on(list, 'unselect', this.listUnselect!);
	// list change 经 Vue 模板转发（Plugin.vue @change → PluginManager.listChange）
	on(this.overview, 'pointerdown', this.overviewPointerdown!);
	on(this.parameterPane, 'update', this.parameterPaneUpdate!);
	on($('#plugin-confirm'), 'click', this.confirm!);
};

PluginManager.open = function (this: typeof PluginManager) {
	Window.open!('plugin');

	this.data = Object.clone(Data.plugins);

	(this.list as TreeListElement).restoreSelection();

	getFocus(this.list);

	window.addEventListener('keydown', this.keydown!);
	window.addEventListener('pointerdown', this.pointerdown!);
	window.addEventListener('script-change', this.scriptChange!);
};

PluginManager.load = async function (this: typeof PluginManager, item?: PluginItemShape) {
	const symbol = (this.symbol = Symbol());
	const meta = await Data.scripts[item!.id];
	if (this.symbol === symbol) {
		this.symbol = null;
		this.meta = meta;
		this.loadOverview!();
		(this.parameterPane as TreeListElement).update();
	}
};

PluginManager.unload = function (this: typeof PluginManager) {
	this.meta = null;
	this.symbol = null;
	hide(this.overviewPane);
	hide(this.parameterPane);
	clear(this.parameterPane);
	this.overview?.dispatchEvent(new Event('update'));
};

PluginManager.loadOverview = function (this: typeof PluginManager) {
	if (!this.meta) return;
	show(this.overviewPane);
	this.overview?.dispatchEvent(new Event('update'));
};

PluginManager.createData = function (this: typeof PluginManager, id?: string) {
	return {
		id: id ?? '',
		enabled: true,
		parameters: {}
	};
} as unknown as (...args: unknown[]) => PluginItemShape;

PluginManager.getItemById = Easing.getItemById as unknown as (
	...args: unknown[]
) => ReturnType<typeof Easing.getItemById>;

PluginManager.switchOverviewMode = function (this: typeof PluginManager) {
	if (this.meta) {
		this.detailed = !this.detailed;
		this.loadOverview!();
	}
};

PluginManager.parseMeta = (function IIFE() {
	const event = new Event('script-change');
	const selector = /\/\*\s*@plugin\s[\s\S]+?(?=\*\/)/;
	const statement = /@([a-z\-[\]]+)([\s\S]*?)(?=\s@|$)/g;
	const httpLink = /^https?:\/\/.+$/;
	const option = /^(.+?)\{([\s\S]+?)\}$/;
	const color = /^[0-9a-f]{8}$/;
	const separator = /\s*,\s*/;
	const spacing = /\s+/;
	const strExp = /(?:'[^']*'|"[^"]")(?=\s*,?)/g;
	const langName = /^([a-zA-Z-]+)(?:\s+extends\s+([a-zA-Z-]+))?/;
	const langProp = /(#\S+)\s+([\s\S]+?)(?=\s+#|$)/g;
	const parseInitialValue = () => {
		switch (type) {
			case 'boolean':
				return false;
			case 'number[]':
			case 'string[]':
				return [];
			case 'keycode':
				return '';
			case 'color':
				return 'ffffffff';
			case 'variable-getter':
			case 'variable-setter':
				return VariableGetter.createDefaultForPlugin!();
			case 'actor-getter':
				return ActorGetter.createDefaultForPlugin!();
			case 'skill-getter':
				return SkillGetter.createDefaultForPlugin!();
			case 'state-getter':
				return StateGetter.createDefaultForPlugin!();
			case 'equipment-getter':
				return EquipmentGetter.createDefaultForPlugin!();
			case 'item-getter':
				return ItemGetter.createDefaultForPlugin!();
			case 'element-getter':
				return ElementGetter.createDefaultForPlugin!();
			case 'position-getter':
				return PositionGetter.createDefaultForPlugin!();
			case 'repeatable-group':
				return [];
			default:
				return '';
		}
	};
	const parseBoolean = (string: string) => {
		switch (string) {
			case 'true':
				return true;
			case 'false':
				return false;
			default:
				return null;
		}
	};
	const parseNumber = (string: string) => {
		const number = parseFloat(string);
		if (!isNaN(number)) {
			return number;
		}
		return null;
	};
	const parseString = (string: string) => {
		const last = string.length - 1;
		const head = string[0];
		const foot = string[last];
		if ((head === "'" && foot === "'") || (head === '"' && foot === '"')) {
			return string.slice(1, last);
		}
		return null;
	};
	const parseNumberList = () => {
		if (content[0] === '[' && content[content.length - 1] === ']') {
			const numbers: number[] = [];
			const slices = content.slice(1, -1).split(separator);
			for (const slice of slices) {
				const number = parseNumber(slice);
				if (number !== null) {
					numbers.push(number);
				}
			}
			return numbers;
		}
		return null;
	};
	const parseStringList = () => {
		if (content[0] === '[' && content[content.length - 1] === ']') {
			const strings: string[] = [];
			let match;
			while ((match = strExp.exec(content))) {
				const string = parseString(match[0]);
				if (string !== null) {
					strings.push(string);
				}
			}
			return strings;
		}
		return null;
	};
	const parseColor = () => {
		if (color.test(content)) {
			return content;
		}
		return null;
	};
	const parseOption = () => {
		const match = option.exec(content);
		if (match) {
			const key = match[1].trim();
			const set = match[2].trim();
			const values: (string | number | boolean)[] = [];
			const slices = set.split(separator);
			for (const slice of slices) {
				const value = parseString(slice) ?? parseNumber(slice) ?? parseBoolean(slice);
				if (value !== null) {
					values.push(value);
				}
			}
			if (values.length !== 0) {
				return { key, values };
			}
		}
		return null;
	};
	const parseOptionAlias = () => {
		const match = option.exec(content);
		if (match) {
			const key = match[1].trim();
			const values = match[2].trim().split(separator);
			return { key, values };
		}
		return {
			key: content,
			values: []
		};
	};
	const parseDefault = () => {
		switch (parameter.type) {
			case 'boolean':
				return parseBoolean(content);
			case 'number':
			case 'variable-number':
				return parseNumber(content);
			case 'string':
				return parseString(content);
			case 'option': {
				const value = parseString(content) ?? parseNumber(content) ?? parseBoolean(content);
				return parameter.options!.includes(value as string | number | boolean)
					? value
					: null;
			}
			case 'number[]':
				return parseNumberList();
			case 'string[]':
				return parseStringList();
			case 'keycode':
				return parseString(content);
			case 'color':
				return parseColor();
			default:
				return null;
		}
	};
	const setPlugin = () => {
		overview.plugin = content;
	};
	const setAuthor = () => {
		overview.author = content;
	};
	const setLink = () => {
		if (httpLink.test(content)) {
			overview.link = content;
		}
	};
	const setVersion = () => {
		overview.version = content;
	};
	const setDeprecated = () => {
		overview.deprecated = content || true;
	};
	const setRequire = () => {
		const slices = content.split(spacing);
		const name = slices[0];
		if (!name) return;
		overview.requires.push({
			plugin: name,
			version: slices[1] || ''
		});
	};
	const setParameter = () => {
		if (!paramMap[content]) {
			parameter = {
				key: content,
				type: type,
				value: parseInitialValue(),
				group: currentGroup
			};
			parameters.push(parameter);
			paramMap[content] = parameter;
		}
	};
	const setAttribute = () => {
		if (!paramMap[content]) {
			parameter = {
				key: content,
				type: type,
				value: '',
				group: currentGroup
			};
			Object.defineProperties(parameter, {
				filter: { writable: true, value: 'any' }
			});
			parameters.push(parameter);
			paramMap[content] = parameter;
		}
	};
	const setEnum = () => {
		if (!paramMap[content]) {
			parameter = {
				key: content,
				type: type,
				value: '',
				group: currentGroup
			};
			Object.defineProperties(parameter, {
				filter: { writable: true, value: 'any' }
			});
			parameters.push(parameter);
			paramMap[content] = parameter;
		}
	};
	const setNumber = () => {
		if (!paramMap[content]) {
			parameter = {
				key: content,
				type: type,
				value: 0,
				group: currentGroup
			};
			Object.defineProperties(parameter, {
				min: { writable: true, value: -1000000000 },
				max: { writable: true, value: +1000000000 },
				decimals: { writable: true, value: 10 }
			});
			parameters.push(parameter);
			paramMap[content] = parameter;
		}
	};
	const setCond = () => {
		if (parameter === null) return;
		const option = parseOption();
		if (option) {
			manager.append(option);
		}
	};
	const setOption = () => {
		const option = parseOption();
		if (option === null) return;
		const { key, values } = option;
		if (!paramMap[key]) {
			parameter = {
				key: key,
				type: type,
				value: values[0],
				options: values,
				group: currentGroup
			};
			Object.defineProperty(parameter, 'dataItems', {
				configurable: true,
				value: values.map((value: string | number | boolean) => {
					return {
						name: value.toString(),
						value: value
					};
				})
			});
			parameters.push(parameter);
			paramMap[key] = parameter;
		}
	};
	const setClamp = () => {
		switch (parameter?.type) {
			case 'number':
			case 'variable-number':
				break;
			default:
				return;
		}
		const slices = content.split(spacing);
		if (slices.length === 2) {
			const numbers = [0, 0];
			for (let i = 0; i < 2; i++) {
				const number = parseNumber(slices[i]);
				if (number === null) return;
				numbers[i] = number;
			}
			const min = Math.max(-1000000000, Math.min(...numbers));
			const max = Math.min(+1000000000, Math.max(...numbers));
			parameter.value = Math.clamp(parameter.value as number, min, max);
			parameter.min = min;
			parameter.max = max;
		}
	};
	const setFile = () => {
		if (!paramMap[content]) {
			parameter = {
				key: content,
				type: type,
				value: '',
				group: currentGroup
			};
			Object.defineProperties(parameter, {
				filter: { writable: true, value: '' }
			});
			parameters.push(parameter);
			paramMap[content] = parameter;
		}
	};
	const fileFilters: Record<string, boolean> = {
		actor: true,
		skill: true,
		trigger: true,
		item: true,
		equipment: true,
		state: true,
		event: true,
		scene: true,
		tileset: true,
		ui: true,
		animation: true,
		particle: true,
		image: true,
		audio: true,
		video: true,
		script: true,
		font: true,
		other: true
	};
	const attrFilters: Record<string, number> = {
		actor: 1,
		skill: 1,
		state: 1,
		item: 1,
		equipment: 1,
		element: 1
	};
	const enumFilters: Record<string, number> = {
		'shortcut-key': 1,
		'cooldown-key': 1,
		'equipment-slot': 1,
		'global-event': 1,
		'scene-event': 1,
		'actor-event': 1,
		'skill-event': 1,
		'state-event': 1,
		'equipment-event': 1,
		'item-event': 1,
		'region-event': 1,
		'light-event': 1,
		'animation-event': 1,
		'particle-event': 1,
		'parallax-event': 1,
		'tilemap-event': 1,
		'element-event': 1
	};
	const setFilter = () => {
		switch (parameter?.type) {
			case 'file': {
				const slices = content.split(spacing);
				let i = slices.length;
				while (--i >= 0) {
					if (!fileFilters[slices[i]]) {
						slices.splice(i, 1);
					}
				}
				if (slices.length !== 0) {
					parameter.filter = slices.join(' ');
				}
				break;
			}
			case 'attribute':
			case 'attribute-key':
				if (attrFilters[content]) {
					parameter.filter = content;
				}
				break;
			case 'enum':
			case 'enum-value':
				if (enumFilters[content]) {
					parameter.filter = content;
				}
				break;
		}
	};
	const setDecimals = () => {
		switch (parameter?.type) {
			case 'number':
			case 'variable-number':
				break;
			default:
				return;
		}
		const decimals = parseNumber(content);
		if (decimals !== null && decimals >= 0 && decimals <= 10) {
			parameter.decimals = decimals;
		}
	};
	const setDefault = () => {
		if (parameter === null) return;
		const value = parseDefault();
		if (value !== null) {
			parameter.value = value;
		}
	};
	const setPlaceholder = () => {
		if (parameter === null) return;
		switch (parameter.type) {
			case 'string':
			case 'number':
			case 'variable-number':
				break;
			default:
				return;
		}
		parameter.placeholder = content;
	};
	const setAlias = () => {
		if (parameter === null) return;
		if (parameter.type === 'option') {
			const alias = parseOptionAlias();
			Object.defineProperty(parameter, 'alias', {
				configurable: true,
				value: alias.key
			});
			const lang = langMap;
			const names = alias.values;
			const items = parameter.dataItems!;
			const length = Math.min(items.length, names.length);
			for (let i = 0; i < length; i++) {
				const name = names[i];
				if (name === '') {
					continue;
				}
				if (name[0] === '#') {
					Object.defineProperty(items[i], 'name', {
						configurable: true,
						get: () => lang.get(name)
					});
				} else {
					items[i].name = name;
				}
			}
		} else {
			Object.defineProperty(parameter, 'alias', {
				configurable: true,
				value: content
			});
		}
	};
	const setDesc = () => {
		if (parameter === null) {
			overview.desc = content;
			return;
		}
		Object.defineProperty(parameter, 'desc', {
			configurable: true,
			value: content
		});
	};
	const setSuffix = () => {
		if (parameter === null) return;
		parameter.suffix = content;
	};
	const setPrefix = () => {
		if (parameter === null) return;
		parameter.prefix = content;
	};
	const setReadonly = () => {
		if (parameter === null) return;
		parameter.readonly = true;
	};
	const setHidden = () => {
		if (parameter === null) return;
		parameter.hidden = true;
	};
	const setValidate = () => {
		if (parameter === null) return;
		const validate: {
			pattern: RegExp | null;
			notEmpty: boolean | null;
			[key: string]: number | RegExp | boolean | null;
		} = { pattern: null, notEmpty: null };
		const parts = content.split(/\s+/);
		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			const sep = part.indexOf(':');
			const key = sep === -1 ? part : part.slice(0, sep);
			const val = sep === -1 ? '' : part.slice(sep + 1);
			switch (key) {
				case 'min':
				case 'max':
				case 'minLength':
				case 'maxLength': {
					const num = parseNumber(val);
					if (num !== null) validate[key] = num;
					break;
				}
				case 'pattern': {
					try {
						if (val[0] === '/' && val.lastIndexOf('/') > 0) {
							const lst = val.lastIndexOf('/');
							validate.pattern = new RegExp(val.slice(1, lst), val.slice(lst + 1));
						} else {
							validate.pattern = new RegExp(val);
						}
					} catch (e) {}
					break;
				}
				case 'notEmpty':
					validate.notEmpty = true;
					break;
			}
		}
		if (Object.keys(validate).length) {
			Object.defineProperty(parameter, 'validate', {
				configurable: true,
				value: validate
			});
		}
	};

	const setLang = () => {
		const match = langName.exec(content);
		if (match) {
			langMap.append({
				name: match[1],
				base: match[2] ?? '',
				code: content
			});
		}
	};
	const setGroup = () => {
		currentGroup = content || null;
	};
	const setGroupRepeatable = () => {
		const groupName = content || null;
		if (!groupName) return;
		const groupParams: ParameterShape[] = [];
		const remaining: ParameterShape[] = [];
		for (const p of parameters) {
			if (p.group === groupName) {
				groupParams.push(p);
			} else {
				remaining.push(p);
			}
		}
		if (groupParams.length === 0) return;
		for (const p of groupParams) {
			delete paramMap[p.key];
		}
		const key = groupName;
		parameter = {
			key,
			type: 'repeatable-group',
			value: [],
			group: null,
			repeatableGroup: {
				name: groupName,
				parameters: groupParams
			}
		};
		remaining.push(parameter);
		parameters.length = 0;
		parameters.push(...remaining);
		paramMap[key] = parameter;
		currentGroup = null;
	};

	class OptionManager extends Array {
		wraps: Record<string, ConditionWrap>;
		states: Record<string, boolean>;
		constructor() {
			super();
			this.wraps = {};
			this.states = {};
		}

		append({ key, values }: { key: string; values: (string | number | boolean)[] }) {
			const { wraps, states } = this;
			const pKey = parameter.key;
			const owner = paramMap[key];
			if (
				owner === undefined ||
				owner === parameter ||
				owner.type !== 'option' ||
				states[pKey]
			) {
				return false;
			}
			let wrap = wraps[key];
			if (wrap === undefined) {
				wrap = new ConditionWrap(owner);
				wraps[key] = wrap;
				this.push(wrap);
			}
			states[pKey] = true;
			wrap.relate(values);
			return true;
		}

		sort() {
			for (let { owner } of this) {
				let priority = 0;
				while ((owner = owner.parent)) {
					const { wrap } = owner;
					wrap!.priority = Math.max(wrap!.priority, ++priority);
				}
			}
			return super.sort(OptionManager.sorter);
		}

		update(parameters: Record<string, unknown>) {
			const { states } = this;
			for (const wrap of this) {
				wrap.switch(states, parameters);
			}
		}

		static sorter = (a: ConditionWrap, b: ConditionWrap) => b.priority - a.priority;
	}

	class ConditionWrap {
		owner: OptionParameterShape;
		map: Record<string, string[]>;
		priority: number;
		constructor(owner: OptionParameterShape) {
			this.owner = owner;
			this.map = {};
			this.priority = 0;
			Object.defineProperty(owner, 'wrap', { value: this });
		}

		relate(values: (string | number | boolean)[]) {
			const { owner } = this;
			if (parameter.type === 'option') {
				let node: OptionParameterShape | null | undefined = owner;
				while ((node = node.parent)) {
					if (node === parameter) {
						return;
					}
				}
				Object.defineProperty(parameter, 'parent', { value: owner });
			}
			const { map } = this;
			const { key } = parameter;
			const { options } = owner;
			for (const value of values) {
				if (options!.includes(value)) {
					map[value as string] === undefined
						? (map[value as string] = [key])
						: map[value as string].push(key);
				}
			}
		}

		switch(states: Record<string, boolean>, parameters: Record<string, unknown>) {
			let active;
			const { owner, map } = this;
			const { key, options } = owner;
			if (states[key] !== false) {
				active = parameters[key];
				if (!options!.includes(active as string | number | boolean)) {
					active = owner.value;
				}
			}
			const actives = map[active as string] ?? Array.empty;
			for (const option of options!) {
				const keys = map[option as string];
				if (keys === undefined) continue;
				for (const key of keys) {
					states[key] = actives.includes(key);
				}
			}
		}
	}

	class LanguageMap {
		language: string;
		active: Record<string, string>;
		packs: LanguagePackShape[];
		constructor() {
			this.language = '';
			this.active = {};
			this.packs = [];
		}

		update() {
			if (this.language !== getLocalStore().language) {
				this.language = getLocalStore().language;
				const packs = this.packs;
				let active = packs[0];
				let matchedWeight = 0;
				const sKeys = getLocalStore().language.split('-');
				for (const pack of packs) {
					const dKeys = pack.name.split('-');
					if (sKeys[0] === dKeys[0]) {
						let weight = 0;
						for (let sKey of sKeys) {
							if (dKeys.includes(sKey)) {
								weight++;
							}
						}
						if (matchedWeight < weight) {
							matchedWeight = weight;
							active = pack;
						}
					}
				}
				if (active) {
					this.parse(active);
					this.active = active.map!;
				}
			}
			return this;
		}

		parse(pack: LanguagePackShape) {
			const code = pack.code;
			if (code !== undefined) {
				delete pack.code;
				let match;
				const base = pack.base;
				const map = (pack.map = {} as Record<string, string>);
				while ((match = langProp.exec(code))) {
					map[match[1]] = match[2];
				}
				if (!base) return;
				for (const pack of this.packs) {
					if (pack.name === base) {
						this.parse(pack);
						// 避免循环继承报错
						try {
							Object.setPrototypeOf(map, pack.map!);
						} catch (error: unknown) {}
					}
				}
			}
		}

		get(key: string) {
			if (key && key[0] === '#') {
				return this.active[key] ?? key;
			}
			return key;
		}

		append(pack: LanguagePackShape) {
			const { name } = pack;
			const { packs } = this;
			for (const pack of packs) {
				if (pack.name === name) {
					return;
				}
			}
			packs.push(pack);
		}
	}

	const processors: Record<string, () => void> = {
		plugin: setPlugin,
		author: setAuthor,
		link: setLink,
		version: setVersion,
		deprecated: setDeprecated,
		require: setRequire,
		boolean: setParameter,
		number: setNumber,
		'variable-number': setNumber,
		string: setParameter,
		'number[]': setParameter,
		'string[]': setParameter,
		keycode: setParameter,
		color: setParameter,
		option: setOption,
		easing: setParameter,
		team: setParameter,
		variable: setParameter,
		attribute: setAttribute,
		'attribute-key': setAttribute,
		'attribute-group': setParameter,
		enum: setEnum,
		'enum-value': setEnum,
		'enum-group': setParameter,
		actor: setParameter,
		region: setParameter,
		light: setParameter,
		animation: setParameter,
		particle: setParameter,
		parallax: setParameter,
		tilemap: setParameter,
		element: setParameter,
		'element-id': setParameter,
		file: setFile,
		filter: setFilter,
		'variable-getter': setParameter,
		'variable-setter': setParameter,
		'actor-getter': setParameter,
		'skill-getter': setParameter,
		'state-getter': setParameter,
		'equipment-getter': setParameter,
		'item-getter': setParameter,
		'element-getter': setParameter,
		'position-getter': setParameter,
		clamp: setClamp,
		decimals: setDecimals,
		placeholder: setPlaceholder,
		default: setDefault,
		alias: setAlias,
		desc: setDesc,
		suffix: setSuffix,
		prefix: setPrefix,
		readonly: setReadonly,
		hidden: setHidden,
		validate: setValidate,

		cond: setCond,
		lang: setLang,
		group: setGroup,
		'group[]': setGroupRepeatable
	};

	let overview = null as unknown as OverviewShape;
	let parameters = null as unknown as ParameterShape[];
	let paramMap = null as unknown as Record<string, ParameterShape>;
	let langMap = null as unknown as LanguageMap;
	let manager = null as unknown as OptionManager;
	let parameter = null as unknown as ParameterShape;
	let type = '';
	let content = '';
	let currentGroup: string | null = null;

	return function (this: typeof PluginManager, meta: PluginMetaShape, code: string) {
		overview = { requires: [] };
		parameters = [];
		paramMap = {};
		langMap = new LanguageMap();
		manager = new OptionManager();
		currentGroup = null;
		let match = selector.exec(code);
		if (match) {
			const code = match[0];
			// 当元数据代码未改变时不用重新解析
			if (meta.overview?.code === code) {
				return;
			}
			overview.code = code;
			while ((match = statement.exec(code))) {
				type = match[1];
				content = match[2].trim();
				processors[type]?.();
			}
		}

		const updating = !!meta.overview;
		meta.parameters = parameters;
		Data.manifest.changed = true;
		Object.defineProperties(meta, {
			overview: {
				configurable: true,
				value: overview
			},
			langMap: {
				configurable: true,
				value: langMap
			},
			manager: {
				configurable: true,
				value: manager.sort()
			}
		});

		overview = null as unknown as OverviewShape;
		parameters = null as unknown as ParameterShape[];
		paramMap = null as unknown as Record<string, ParameterShape>;
		langMap = null as unknown as LanguageMap;
		manager = null as unknown as OptionManager;
		parameter = null as unknown as ParameterShape;
		type = '';
		content = '';

		if (updating) {
			(event as Event & { changedMeta?: PluginMetaShape }).changedMeta = meta;
			window.dispatchEvent(event);
		}
	};
})() as unknown as ((...args: unknown[]) => void) | null;

PluginManager.reconstruct = (function IIFE() {
	const guidRegExp = /^[0-9a-f]{16}$/;
	const colorRegExp = /^[0-9a-f]{8}$/;
	const checkValue = (parameter: ParameterShape, key: string, value: unknown) => {
		if (parameter.key !== key) {
			return false;
		}
		const { type } = parameter;
		switch (type) {
			case 'boolean':
			case 'string':
				return typeof value === type;
			case 'number':
				if (typeof value === type) {
					const { min, max, decimals } = parameter;
					return (
						Math.clamp(Math.roundTo(value as number, decimals!), min!, max!) === value
					);
				}
				if (typeof value === 'string') {
					const n = Number(value);
					if (!Number.isNaN(n)) {
						const { min, max, decimals } = parameter;
						return Math.clamp(Math.roundTo(n, decimals!), min!, max!) === n;
					}
				}
				return false;
			case 'variable-number':
				if (typeof value === 'number') {
					const { min, max, decimals } = parameter;
					return Math.clamp(Math.roundTo(value, decimals!), min!, max!) === value;
				}
				if (typeof value === 'string') {
					const n = Number(value);
					if (!Number.isNaN(n)) {
						const { min, max, decimals } = parameter;
						return Math.clamp(Math.roundTo(n, decimals!), min!, max!) === n;
					}
				}
				return VariableGetter.checkDataForPlugin!(value as { getter?: string });
			case 'option':
				return parameter.options!.includes(value as string | number | boolean);
			case 'easing':
				return !!Data.easings.map[value as string];
			case 'team':
				return !!Data.teams.map[value as string];
			case 'variable':
				return value === '' || !!getVariable(value as string);
			case 'attribute':
			case 'attribute-key':
				if (value === '') return true;
				if (parameter.filter === 'any') return !!Attribute.getAttribute(value as string);
				return !!Attribute.getGroupAttribute(parameter.filter as string, value as string);
			case 'attribute-group':
				return value === '' || !!Attribute.getGroup(value as string);
			case 'enum':
			case 'enum-value':
				if (value === '') return true;
				if (parameter.filter === 'any') return !!Enum.getString(value as string);
				return !!Enum.getGroupString(parameter.filter as string, value as string);
			case 'enum-group':
				return value === '' || !!Enum.getGroup(value as string);
			case 'actor':
			case 'region':
			case 'light':
			case 'animation':
			case 'particle':
			case 'parallax':
			case 'tilemap':
			case 'element':
			case 'element-id':
				return typeof value === 'string';
			case 'file':
				return value === '' || guidRegExp.test(value as string);
			case 'variable-getter':
			case 'variable-setter':
				return VariableGetter.checkDataForPlugin!(value as { getter?: string });
			case 'actor-getter':
				return ActorGetter.checkDataForPlugin!(value);
			case 'skill-getter':
				return SkillGetter.checkDataForPlugin!(value);
			case 'state-getter':
				return StateGetter.checkDataForPlugin!(value);
			case 'equipment-getter':
				return EquipmentGetter.checkDataForPlugin!(value);
			case 'item-getter':
				return ItemGetter.checkDataForPlugin!(value);
			case 'element-getter':
				return ElementGetter.checkDataForPlugin!(value);
			case 'position-getter':
				return PositionGetter.checkDataForPlugin!(value as { getter?: string });
			case 'number[]':
			case 'string[]':
				if (value instanceof Array) {
					const t = type.slice(0, -2);
					for (const item of value) {
						if (typeof item !== t) {
							if (
								t === 'number' &&
								typeof item === 'string' &&
								!Number.isNaN(Number(item))
							) {
								continue;
							}
							return false;
						}
					}
					return true;
				}
				return false;
			case 'keycode':
				return typeof value === 'string';
			case 'color':
				return colorRegExp.test(value as string);
			case 'repeatable-group':
				return value instanceof Array;
		}
		return true;
	};

	const readValue = (parameter: ParameterShape, value: unknown) => {
		const { type } = parameter;
		switch (type) {
			case 'boolean':
			case 'string':
				if (typeof value === type) return value;
				return parameter.value;
			case 'number':
				if (typeof value === 'number') {
					const { min, max, decimals } = parameter;
					return Math.clamp(Math.roundTo(value, decimals!), min!, max!);
				}
				if (typeof value === 'string') {
					const n = Number(value);
					if (!Number.isNaN(n)) {
						const { min, max, decimals } = parameter;
						return Math.clamp(Math.roundTo(n, decimals!), min!, max!);
					}
				}
				return parameter.value;
			case 'variable-number':
				if (typeof value === 'number') {
					const { min, max, decimals } = parameter;
					return Math.clamp(Math.roundTo(value, decimals!), min!, max!);
				} else if (typeof value === 'string') {
					const n = Number(value);
					if (!Number.isNaN(n)) {
						const { min, max, decimals } = parameter;
						return Math.clamp(Math.roundTo(n, decimals!), min!, max!);
					}
				} else if (VariableGetter.checkDataForPlugin!(value as { getter?: string })) {
					return value;
				}
				return parameter.value;
			case 'option': {
				if (parameter.options!.includes(value as string | number | boolean)) return value;
				if (typeof value === 'number' && parameter.options![value] !== undefined) {
					return parameter.options![value];
				}
				if (typeof value === 'string') {
					const n = Number(value);
					if (!Number.isNaN(n) && parameter.options!.includes(n)) {
						return n;
					}
				}
				if (typeof value === 'number' && parameter.options!.includes(String(value))) {
					return String(value);
				}
				return parameter.value;
			}
			case 'easing':
				if (Data.easings.map[value as string]) return value;
				return Data.easings[0].id;
			case 'team':
				if (Data.teams.map[value as string]) return value;
				return Data.teams.list[0].id;
			case 'variable':
				if (getVariable(value as string)) return value;
				return '';
			case 'attribute':
			case 'attribute-key':
				if (parameter.filter === 'any') {
					if (Attribute.getAttribute(value as string)) return value;
				} else {
					if (Attribute.getGroupAttribute(parameter.filter as string, value as string))
						return value;
				}
				return '';
			case 'attribute-group':
				if (Attribute.getGroup(value as string)) return value;
				return '';
			case 'enum':
			case 'enum-value':
				if (parameter.filter === 'any') {
					if (Enum.getString(value as string)) return value;
				} else {
					if (Enum.getGroupString(parameter.filter as string, value as string))
						return value;
				}
				return '';
			case 'enum-group':
				if (Enum.getGroup(value as string)) return value;
				return '';
			case 'actor':
			case 'region':
			case 'light':
			case 'animation':
			case 'particle':
			case 'parallax':
			case 'tilemap':
			case 'element':
			case 'element-id':
				if (typeof value === 'string') return value;
				return '';
			case 'file':
				if (guidRegExp.test(value as string)) return value;
				return '';
			case 'variable-getter':
			case 'variable-setter':
				if (VariableGetter.checkDataForPlugin!(value as { getter?: string })) return value;
				return VariableGetter.createDefaultForPlugin!();
			case 'actor-getter':
				if (ActorGetter.checkDataForPlugin!(value)) return value;
				return ActorGetter.createDefaultForPlugin!();
			case 'skill-getter':
				if (SkillGetter.checkDataForPlugin!(value)) return value;
				return SkillGetter.createDefaultForPlugin!();
			case 'state-getter':
				if (StateGetter.checkDataForPlugin!(value)) return value;
				return StateGetter.createDefaultForPlugin!();
			case 'equipment-getter':
				if (EquipmentGetter.checkDataForPlugin!(value)) return value;
				return EquipmentGetter.createDefaultForPlugin!();
			case 'item-getter':
				if (ItemGetter.checkDataForPlugin!(value)) return value;
				return ItemGetter.createDefaultForPlugin!();
			case 'element-getter':
				if (ElementGetter.checkDataForPlugin!(value)) return value;
				return ElementGetter.createDefaultForPlugin!();
			case 'position-getter':
				if (PositionGetter.checkDataForPlugin!(value as { getter?: string })) return value;
				return PositionGetter.createDefaultForPlugin!();
			case 'number[]':
			case 'string[]':
				if (value instanceof Array) {
					const t = type.slice(0, -2);
					const arr: (string | number)[] = [];
					for (const item of value) {
						if (typeof item !== t) {
							if (
								t === 'number' &&
								typeof item === 'string' &&
								!Number.isNaN(Number(item))
							) {
								arr.push(Number(item));
								continue;
							}
							return parameter.value;
						}
						arr.push(item);
					}
					return arr;
				}
				return parameter.value;
			case 'keycode':
				if (typeof value === 'string') return value;
				return parameter.value;
			case 'color':
				if (colorRegExp.test(value as string)) {
					return value;
				}
				return parameter.value;
			case 'repeatable-group':
				if (value instanceof Array) return value;
				return parameter.value;
		}
	};
	return function (this: typeof PluginManager, script: PluginScriptShape) {
		const { id, parameters } = script;
		const oEntries = Object.entries(parameters ?? {});
		const meta = Data.manifest.guidMap[id];
		const mParameters = meta?.parameters;
		// 未找到元数据参数时保留脚本参数
		if (mParameters === undefined) {
			return false;
		}
		meta.manager.update(parameters);
		let reconstruct = false;
		const length = mParameters.length;
		if (length !== oEntries.length) {
			reconstruct = true;
		} else {
			const oMap = {} as Record<string, unknown>;
			for (const [k, v] of oEntries) {
				oMap[k] = v;
			}
			for (const mParam of mParameters) {
				if (!(mParam.key in oMap) || !checkValue(mParam, mParam.key, oMap[mParam.key])) {
					reconstruct = true;
					break;
				}
			}
		}
		if (reconstruct) {
			const newParameters = {} as Record<string, unknown>;
			for (const mParam of mParameters) {
				const key = mParam.key;
				const arg = parameters?.[key];
				const value = readValue(mParam, arg);
				newParameters[key] = value;
			}
			script.parameters = newParameters;
			return true;
		}
		return false;
	};
})() as unknown as (...args: unknown[]) => boolean;

PluginManager.checkValidate = function (
	this: typeof PluginManager,
	parameter: ParameterShape,
	value: unknown
) {
	if (!parameter.validate) return true;
	const v = parameter.validate;
	if (v.notEmpty && (value === '' || value == null)) return false;
	if (v.minLength != null && typeof value === 'string' && value.length < v.minLength)
		return false;
	if (v.maxLength != null && typeof value === 'string' && value.length > v.maxLength)
		return false;
	if (v.pattern && typeof value === 'string' && !v.pattern.test(value)) return false;
	return true;
} as unknown as ((...args: unknown[]) => boolean) | null;

PluginManager.saveToProject = function (this: typeof PluginManager, project: EditorProjectShape) {
	const { plugin } = project;
	plugin.detailed = this.detailed;
} as unknown as ((...args: unknown[]) => void) | null;

PluginManager.loadFromProject = function (this: typeof PluginManager, project: EditorProjectShape) {
	const { plugin } = project;
	this.detailed = plugin.detailed;
} as unknown as ((...args: unknown[]) => void) | null;

PluginManager.windowClose = function (this: typeof PluginManager, event: Event) {
	if (this.changed) {
		event.preventDefault();
		const get = createGetter('confirmation');
		Window.confirm!(
			{
				message: get('closeUnsavedPlugins')
			},
			[
				{
					label: get('yes'),
					click: () => {
						this.changed = false;
						Window.close!('plugin');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
}.bind(PluginManager) as unknown as ((...args: unknown[]) => void) | null;

PluginManager.windowClosed = function (this: typeof PluginManager, event: Event) {
	(this.list as TreeListElement).saveSelection();
	this.data = null;
	clear(this.list);
	window.removeEventListener('keydown', this.keydown!);
	window.removeEventListener('pointerdown', this.pointerdown!);
	window.removeEventListener('script-change', this.scriptChange!);
}.bind(PluginManager) as unknown as ((...args: unknown[]) => void) | null;

PluginManager.keydown = function (this: typeof PluginManager, event: KeyboardEvent) {
	if (event.ctrlKey || event.metaKey) {
		switch (event.code) {
			case 'KeyD':
				PluginManager.switchOverviewMode!();
				break;
		}
	}
} as unknown as ((...args: unknown[]) => void) | null;

PluginManager.pointerdown = function (this: typeof PluginManager, event: PointerEvent) {
	// 阻止鼠标在窗口外部双击会选中概述内容的行为 并且调用失去焦点方法避免阻止后失效
	if (event.target === document.documentElement) {
		event.preventDefault();
		document.activeElement!.blur();
	}
} as unknown as ((...args: unknown[]) => void) | null;

PluginManager.scriptChange = function (
	this: typeof PluginManager,
	event: Event & { changedMeta?: PluginMetaShape }
) {
	if (PluginManager.meta === event.changedMeta) {
		PluginManager.loadOverview!();
	}
} as unknown as ((...args: unknown[]) => void) | null;

PluginManager.listKeydown = function (this: TreeListElement, event: KeyboardEvent) {
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
				this.insert(item);
				break;
			case 'Slash':
				this.toggle(item);
				break;
			case 'Delete':
				this.delete(item);
				break;
		}
	}
} as unknown as ((...args: unknown[]) => void) | null;

PluginManager.listSelect = function (
	this: typeof PluginManager,
	event: Event & { value?: PluginItemShape }
) {
	PluginManager.load!(event.value!);
} as unknown as ((...args: unknown[]) => void) | null;

// 列表 - 取消选择事件
PluginManager.listUnselect = function (this: typeof PluginManager, event: Event) {
	PluginManager.unload!();
} as unknown as ((...args: unknown[]) => void) | null;

PluginManager.listChange = function (this: typeof PluginManager, event: Event) {
	PluginManager.changed = true;
} as unknown as ((...args: unknown[]) => void) | null;

PluginManager.listPopup = function (
	this: typeof PluginManager,
	event: PointerEvent & { value?: PluginItemShape | null }
) {
	const list = PluginManager.list as TreeListElement;
	const item = event.value;
	const selected = !!item;
	const pastable = (GlobalClipboard as unknown as ClipboardShape).has('yami.data.plugin');
	const deletable = selected;
	const get = createGetter('menuPluginList');
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
					list.edit(item);
				}
			},
			{
				label: get('insert'),
				accelerator: 'Insert',
				click: () => {
					list.insert(item);
				}
			},
			{
				label: get('toggle'),
				accelerator: '/',
				enabled: selected,
				click: () => {
					list.toggle(item);
				}
			},
			{
				label: get('copy'),
				accelerator: ctrl('C'),
				enabled: selected,
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
				enabled: deletable,
				click: () => {
					list.delete(item);
				}
			}
		]
	);
} as unknown as ((...args: unknown[]) => void) | null;

PluginManager.listOpen = function (
	this: typeof PluginManager,
	event: Event & { value?: PluginItemShape }
) {
	(PluginManager.list as TreeListElement).edit(event.value);
} as unknown as ((...args: unknown[]) => void) | null;

PluginManager.overviewPointerdown = (function IIFE() {
	const once = { once: true };
	const pointerup = (event: PointerEvent) => {
		if (PluginManager.overview!.contains(event.target as Node)) {
			Menu.popup(
				{
					x: event.clientX,
					y: event.clientY
				},
				[
					{
						label: t('menuPluginOverview.detail'),
						accelerator: ctrl('D'),
						checked: PluginManager.detailed,
						click: () => {
							PluginManager.switchOverviewMode!();
						}
					}
				]
			);
		}
	};
	return function (this: typeof PluginManager, event: PointerEvent) {
		switch (event.button) {
			case 2:
				window.addEventListener('pointerup', pointerup, once);
				break;
		}
	};
})() as unknown as ((...args: unknown[]) => void) | null;

PluginManager.parameterPaneUpdate = function (this: TreeListElement, event: Event) {
	if (this.wraps.length !== 0) {
		show(this);
	} else {
		hide(this);
	}
} as unknown as ((...args: unknown[]) => void) | null;

PluginManager.confirm = function (this: typeof PluginManager, event: Event) {
	this.apply!();
	Window.close!('plugin');
}.bind(PluginManager) as unknown as ((...args: unknown[]) => void) | null;

PluginManager.apply = function (this: typeof PluginManager, event: Event) {
	if (this.changed) {
		this.changed = false;

		let plugins = this.data;
		if (event instanceof Event) {
			plugins = Object.clone(plugins);
		} else {
			TreeList.deleteCaches(
				plugins as unknown as Parameters<typeof TreeList.deleteCaches>[0]
			);
		}
		Data.plugins = plugins;
		File.planToSave!(Data.manifest.project.plugins);
	}
}.bind(PluginManager) as unknown as ((...args: unknown[]) => void) | null;

// 列表 - 编辑
PluginManager.list_edit = function (this: TreeListElement, item: PluginItemShape) {
	getSelectorInstance()?.open?.(
		{
			filter: 'script',
			read: () => item.id,
			input: (id: string) => {
				if (item.id !== id) {
					item.id = id;
					item.parameters = {};
					PluginManager.changed = true;
					(PluginManager.parameterPane as TreeListElement).update();
				}
				this.update();
			}
		},
		false
	);
};

// 列表 - 插入
PluginManager.list_insert = function (this: TreeListElement, dItem: PluginItemShape) {
	getSelectorInstance()?.open?.(
		{
			filter: 'script',
			read: () => '',
			input: (id: string) => {
				this.addNodeTo(PluginManager.createData(id), dItem);
			}
		},
		false
	);
};

// 列表 - 开关
PluginManager.list_toggle = function (this: TreeListElement, item: PluginItemShape) {
	if (item) {
		item.enabled = !item.enabled;
		this.update();
		PluginManager.changed = true;
	}
};

// 列表 - 复制
PluginManager.list_copy = function (this: TreeListElement, item: PluginItemShape) {
	if (item) {
		(GlobalClipboard as unknown as ClipboardShape).write('yami.data.plugin', item);
	}
};

// 列表 - 粘贴
PluginManager.list_paste = function (this: TreeListElement, dItem: PluginItemShape) {
	const copy = (GlobalClipboard as unknown as ClipboardShape).read('yami.data.plugin');
	if (copy) {
		this.addNodeTo(copy, dItem);
	}
};

// 列表 - 删除
PluginManager.list_delete = function (this: TreeListElement, item: PluginItemShape) {
	const get = createGetter('confirmation');
	const name = Command.removeTextTags(Command.parseFileName(item.id));
	Window.confirm!(
		{
			message: get('deleteSingleFile').replace('<filename>', name)
		},
		[
			{
				label: get('yes'),
				click: () => {
					const items = this.data;
					const index = items.indexOf(item);
					this.deleteNode(item);
					const last = items.length - 1;
					this.select(items[Math.min(index, last)]);
				}
			},
			{
				label: get('no')
			}
		]
	);
};

// 列表 - 保存选项状态
PluginManager.list_saveSelection = function (this: TreeListElement) {
	const { plugins } = Data;
	// 将数据保存在外部可以切换项目后重置
	if (plugins.selection === undefined) {
		Object.defineProperty(plugins, 'selection', {
			writable: true,
			value: ''
		});
	}
	const selection = read(this);
	if (selection) {
		plugins.selection = selection.id;
	}
};

// 列表 - 恢复选项状态
PluginManager.list_restoreSelection = function (this: TreeListElement) {
	const id = Data.plugins.selection;
	const item = PluginManager.getItemById!(id) ?? this.data?.[0];
	this.select(item);
	this.update();
	this.scrollToSelection();
};

// 列表 - 更新文本节点
PluginManager.list_updateTextNode = function (this: TreeListElement, item: PluginItemShape) {
	const textNode = item.element!.textNode;
	const text = Command.removeTextTags(Command.parseFileName(item.id));
	if (textNode.nodeValue !== text) {
		textNode.nodeValue = text;
	}
};

// 注意：不再重写 ParameterPane.createDetailBox / clear，以保留参数面板按 @group 分组的多 detail-box 渲染能力 （原生 ParameterPane 已支持，见 components/parameter-pane.js）

const pluginBridgeKeys = ['plugins'] as const;
import { getPluginStore } from '@app/stores/plugin';

for (const key of pluginBridgeKeys) {
	Object.defineProperty(PluginManager, key, {
		get: () => getPluginStore()[key],
		set: (value: unknown) => {
			(getPluginStore() as unknown as Record<(typeof pluginBridgeKeys)[number], any>)[key] =
				value;
		},
		configurable: true
	});
}
