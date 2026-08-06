import { $ } from '@/util/dom.ts';
import {
	addClass,
	clear,
	getFocus,
	hide,
	on,
	read,
	removeClass,
	show
} from '@/util/element-utils.ts';
import { getVariable } from '@/util/safe.ts';
import { ctrl } from '@/util/event-accessors.ts';
import { Command } from '@/command/command-object.ts';
import { Attribute } from '@/attribute/attribute-window.ts';
import { ActorGetter } from '@/command/actor-accessor-window.ts';
import { ElementGetter } from '@/command/element-accessor-window.ts';
import { EquipmentGetter } from '@/command/equipment-accessor-window.ts';
import { ItemGetter } from '@/command/item-accessor-window.ts';
import { PositionGetter } from '@/command/position-accessor-window.ts';
import { SkillGetter } from '@/command/skill-accessor-window.ts';
import { StateGetter } from '@/command/state-accessor-window.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { Menu } from '@/components/menu-list.ts';
import { TreeList } from '@/components/tree-list.ts';
import { Data } from '@/data/data-object.ts';
import { Easing } from '@/data/transition-window.ts';
import { Enum } from '@/enum/enum-window.ts';
import { File } from '@/file/file-system-core.ts';
import { Local } from '@/tools/localization.ts';
import { ScriptListInterface } from '@/tools/script-list.ts';
function getWindow() {
	return (window as any).Window;
}

export const PluginManager = {
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
	createOverview: null,
	createData: null,
	getItemById: null,
	switchOverviewMode: null,
	parseMeta: null,
	reconstruct: null,
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
	list_edit: null as any,
	list_insert: null as any,
	list_toggle: null as any,
	list_copy: null as any,
	list_paste: null as any,
	list_delete: null as any,
	list_saveSelection: null as any,
	list_restoreSelection: null as any,
	list_addElementClass: null as any,
	list_updateTextNode: null as any,
	list_updateToggleStyle: null as any,
	list_createEditIcon: null as any
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
	list.insert = null;
	list.toggle = null;
	list.copy = null;
	list.paste = null;
	list.delete = null;
	list.saveSelection = null;
	list.restoreSelection = null;
	list.updateNodeElement = Easing.list_updateNodeElement;
	list.addElementClass = PluginManager.list_addElementClass;
	list.updateTextNode = PluginManager.list_updateTextNode;
	list.updateToggleStyle = PluginManager.list_updateToggleStyle;
	list.createEditIcon = PluginManager.list_createEditIcon;
	list.edit = PluginManager.list_edit;
	list.insert = PluginManager.list_insert;
	list.toggle = PluginManager.list_toggle;
	list.copy = PluginManager.list_copy;
	list.paste = PluginManager.list_paste;
	list.delete = PluginManager.list_delete;
	list.saveSelection = PluginManager.list_saveSelection;
	list.restoreSelection = PluginManager.list_restoreSelection;
}

// pane methods 注意：不再重写 ParameterPane.createDetailBox / clear，因为它们在 ParameterPane.initialize 中被重写

PluginManager.initialize = function () {
	ensureDomBound();
	if (!PluginManager.list) return;
	const { list } = this;
	list.removable = true;
	list.bind(() => this.data);
	list.creators.push(list.addElementClass);
	list.creators.push(list.updateToggleStyle);
	list.updaters.push(list.updateTextNode);
	list.creators.push(list.createEditIcon);

	this.parameterPane.bind(list);

	on($('#plugin'), 'close', this.windowClose);
	on($('#plugin'), 'closed', this.windowClosed);
	on(list, 'keydown', this.listKeydown);
	// list select/popup/open 经 Vue 模板转发（Plugin.vue @select/@popup/@open → PluginManager.list*）
	on(list, 'unselect', this.listUnselect);
	// list change 经 Vue 模板转发（Plugin.vue @change → PluginManager.listChange）
	on(list, 'pointerdown', ScriptListInterface.listPointerdown);
	on(this.overview, 'pointerdown', this.overviewPointerdown);
	on(this.parameterPane, 'update', this.parameterPaneUpdate);
	on($('#plugin-confirm'), 'click', this.confirm);
	on($('#plugin-apply'), 'click', this.apply);
};

PluginManager.open = function () {
	getWindow().open('plugin');

	this.data = Object.clone(Data.plugins);

	this.list.restoreSelection();

	getFocus(this.list);

	window.addEventListener('keydown', this.keydown);
	window.addEventListener('pointerdown', this.pointerdown);
	window.addEventListener('script-change', this.scriptChange);
};

PluginManager.load = async function (item) {
	const symbol = (this.symbol = Symbol());
	const meta = await Data.scripts[item.id];
	if (this.symbol === symbol) {
		this.symbol = null;
		this.meta = meta;
		this.loadOverview();
		this.parameterPane.update();
	}
};

PluginManager.unload = function () {
	this.meta = null;
	this.symbol = null;
	clear(this.overview);
	hide(this.overviewPane);
	hide(this.parameterPane);
	clear(this.parameterPane);
};

PluginManager.loadOverview = function () {
	const { meta, detailed } = this;
	if (!meta) return;
	const elements = this.createOverview(meta, detailed);
	const overview = clear(this.overview);
	for (const element of elements) {
		overview.appendChild(element);
	}
	show(this.overviewPane);
};

PluginManager.createOverview = function (meta, detailed) {
	const elements = [];
	const get = Local.createGetter('plugin');
	const langMap = meta.langMap.update();
	const { plugin, author, link, version, desc } = meta.overview;
	if (plugin) {
		const title = document.createElement('div');
		addClass(title, 'plugin-title');
		addClass(title, 'text');
		elements.push(title);
		const text = document.createElement('div');
		text.textContent = langMap.get(plugin);
		addClass(text, 'plugin-name');
		addClass(text, 'text');
		title.appendChild(text);
		if (version) {
			const text = document.createElement('div');
			text.textContent = ' ver' + version;
			addClass(text, 'plugin-version');
			addClass(text, 'text');
			title.appendChild(text);
		}
		if (meta.overview.deprecated) {
			const text = document.createElement('div');
			text.textContent =
				typeof meta.overview.deprecated === 'string'
					? get('deprecated') + ': ' + meta.overview.deprecated
					: get('deprecated');
			addClass(text, 'plugin-deprecated');
			addClass(text, 'text');
			title.appendChild(text);
		}
	}
	if (author) {
		if (elements.length) {
			elements.push(document.createTextNode('\n'));
		}
		const label = document.createElement('div');
		label.textContent = `${get('author')}: `;
		addClass(label, 'plugin-label');
		addClass(label, 'text');
		elements.push(label);
		const text = document.createElement('div');
		text.textContent = author;
		addClass(text, 'plugin-type');
		addClass(text, 'text');
		if (link) {
			addClass(text, 'plugin-link');
			text.onclick = () => File.openURL(link);
		}
		elements.push(text);
	}
	if (desc) {
		if (elements.length) {
			elements.push(document.createTextNode('\n\n'));
		}
		elements.push(document.createTextNode(langMap.get(desc)));
	}
	// 依赖校验：缺失的依赖在概览区显示告警
	if (meta.overview.requires?.length) {
		const guidMap = Data.manifest.guidMap;
		const loaded = new Set();
		for (const id in guidMap) {
			const p = guidMap[id]?.overview?.plugin;
			if (p) loaded.add(p);
		}
		const missing = meta.overview.requires.filter((req) => !loaded.has(req.plugin));
		if (missing.length) {
			if (elements.length) {
				elements.push(document.createTextNode('\n\n'));
			}
			const warn = document.createElement('div');
			addClass(warn, 'plugin-require-warn');
			addClass(warn, 'text');
			warn.textContent = get('requireMissing') + missing.map((req) => req.plugin).join(', ');
			elements.push(warn);
		}
	}
	if (detailed) {
		const { parameters } = meta;
		const { states } = meta.manager;
		if (elements.length && parameters.length) {
			elements.push(document.createTextNode('\n\n'));
		}
		for (const parameter of parameters) {
			const { key, type, alias, desc } = parameter;
			const elWrap = document.createElement('div');
			addClass(elWrap, 'plugin-wrap');
			addClass(elWrap, 'text');
			elements.push(elWrap);
			const elKey = document.createElement('div');
			elKey.textContent = langMap.get(alias) ?? key;
			addClass(elKey, 'plugin-key');
			addClass(elKey, 'text');
			elWrap.appendChild(elKey);
			const delimiter = document.createElement('div');
			delimiter.textContent = ': ';
			addClass(delimiter, 'plugin-label');
			addClass(delimiter, 'text');
			elWrap.appendChild(delimiter);
			switch (type) {
				case 'attribute':
				case 'attribute-key': {
					const elType = document.createElement('div');
					let attrType = 'attribute';
					if (parameter.filter !== 'any') {
						attrType += '.' + parameter.filter;
					}
					let text = get(attrType);
					if (type === 'attribute-key') {
						text += `(${get('key')})`;
					}
					elType.textContent = text;
					addClass(elType, 'plugin-type');
					addClass(elType, 'text');
					elWrap.appendChild(elType);
					break;
				}
				case 'attribute-group': {
					const elType = document.createElement('div');
					elType.textContent = get('attribute.group');
					addClass(elType, 'plugin-type');
					addClass(elType, 'text');
					elWrap.appendChild(elType);
					break;
				}
				case 'enum':
				case 'enum-value': {
					const elType = document.createElement('div');
					let enumType = 'enum';
					if (parameter.filter !== 'any') {
						enumType += '.' + parameter.filter;
					}
					let text = get(enumType);
					if (type === 'enum-value') {
						text += `(${get('value')})`;
					}
					elType.textContent = text;
					addClass(elType, 'plugin-type');
					addClass(elType, 'text');
					elWrap.appendChild(elType);
					break;
				}
				case 'enum-group': {
					const elType = document.createElement('div');
					elType.textContent = get('enum.group');
					addClass(elType, 'plugin-type');
					addClass(elType, 'text');
					elWrap.appendChild(elType);
					break;
				}
				case 'element-id': {
					const elType = document.createElement('div');
					elType.textContent = `${get('element')}(${get('id')})`;
					addClass(elType, 'plugin-type');
					addClass(elType, 'text');
					elWrap.appendChild(elType);
					break;
				}
				case 'file':
					// 如果设置了类型过滤
					if (parameter.filter) {
						const types = parameter.filter.split(' ');
						for (let i = 0; i < types.length; i++) {
							if (i !== 0) {
								const elSeparator = document.createElement('div');
								elSeparator.textContent = '|';
								addClass(elSeparator, 'plugin-label');
								addClass(elSeparator, 'text');
								elWrap.appendChild(elSeparator);
							}
							const elType = document.createElement('div');
							elType.textContent = get(`file.${types[i]}`);
							addClass(elType, 'plugin-type');
							addClass(elType, 'text');
							elWrap.appendChild(elType);
						}
						break;
					}
				// 否则跳转到默认分支
				default:
					const elType = document.createElement('div');
					elType.textContent = get(type);
					addClass(elType, 'plugin-type');
					addClass(elType, 'text');
					elWrap.appendChild(elType);
					break;
			}
			if (key in states) {
				const elCond = document.createElement('div');
				elCond.textContent = '?';
				addClass(elCond, 'plugin-label');
				addClass(elCond, 'text');
				elWrap.appendChild(elCond);
			}
			if (desc) {
				const elDesc = document.createElement('div');
				elDesc.textContent = langMap.get(desc);
				addClass(elDesc, 'plugin-param-desc');
				addClass(elDesc, 'text');
				elWrap.appendChild(elDesc);
			}
		}
	}
	if (!elements.length) {
		elements.push(document.createTextNode('No Description'));
	}
	return elements;
};

PluginManager.createData = function (id) {
	return {
		id: id ?? '',
		enabled: true,
		parameters: {}
	};
};

PluginManager.getItemById = Easing.getItemById;

PluginManager.switchOverviewMode = function () {
	if (this.meta) {
		this.detailed = !this.detailed;
		this.loadOverview();
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
				return VariableGetter.createDefaultForPlugin();
			case 'actor-getter':
				return ActorGetter.createDefaultForPlugin();
			case 'skill-getter':
				return SkillGetter.createDefaultForPlugin();
			case 'state-getter':
				return StateGetter.createDefaultForPlugin();
			case 'equipment-getter':
				return EquipmentGetter.createDefaultForPlugin();
			case 'item-getter':
				return ItemGetter.createDefaultForPlugin();
			case 'element-getter':
				return ElementGetter.createDefaultForPlugin();
			case 'position-getter':
				return PositionGetter.createDefaultForPlugin();
			case 'repeatable-group':
				return [];
			default:
				return '';
		}
	};
	const parseBoolean = (string) => {
		switch (string) {
			case 'true':
				return true;
			case 'false':
				return false;
			default:
				return null;
		}
	};
	const parseNumber = (string) => {
		const number = parseFloat(string);
		if (!isNaN(number)) {
			return number;
		}
		return null;
	};
	const parseString = (string) => {
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
			const numbers = [];
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
			const strings = [];
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
			const values = [];
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
				return parameter.options.includes(value) ? value : null;
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
				value: values.map((value) => {
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
			parameter.value = Math.clamp(parameter.value, min, max);
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
	const fileFilters = {
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
	const attrFilters = {
		actor: 1,
		skill: 1,
		state: 1,
		item: 1,
		equipment: 1,
		element: 1
	};
	const enumFilters = {
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
			const items = parameter.dataItems;
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
		const validate = { pattern: null, notEmpty: null };
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
		const groupParams = [];
		const remaining = [];
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
		wraps: any;
		states: any;
		constructor() {
			super();
			this.wraps = {};
			this.states = {};
		}

		append({ key, values }) {
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
					wrap.priority = Math.max(wrap.priority, ++priority);
				}
			}
			return super.sort(OptionManager.sorter);
		}

		update(parameters: any) {
			const { states } = this;
			for (const wrap of this) {
				wrap.switch(states, parameters);
			}
		}

		static sorter = (a, b) => b.priority - a.priority;
	}

	class ConditionWrap {
		owner: any;
		map: any;
		priority: number;
		constructor(owner: any) {
			this.owner = owner;
			this.map = {};
			this.priority = 0;
			Object.defineProperty(owner, 'wrap', { value: this });
		}

		relate(values: any) {
			const { owner } = this;
			if (parameter.type === 'option') {
				let node = owner;
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
				if (options.includes(value)) {
					map[value] === undefined ? (map[value] = [key]) : map[value].push(key);
				}
			}
		}

		switch(states: any, parameters: any) {
			let active;
			const { owner, map } = this;
			const { key, options } = owner;
			if (states[key] !== false) {
				active = parameters[key];
				if (!options.includes(active)) {
					active = owner.value;
				}
			}
			const actives = map[active] ?? Array.empty;
			for (const option of options) {
				const keys = map[option];
				if (keys === undefined) continue;
				for (const key of keys) {
					states[key] = actives.includes(key);
				}
			}
		}
	}

	class LanguageMap {
		language: string;
		active: any;
		packs: any[];
		constructor() {
			this.language = '';
			this.active = {};
			this.packs = [];
		}

		update() {
			if (this.language !== Local.language) {
				this.language = Local.language;
				const packs = this.packs;
				let active = packs[0];
				let matchedWeight = 0;
				const sKeys = Local.language.split('-');
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
					this.active = active.map;
				}
			}
			return this;
		}

		parse(pack: any) {
			const code = pack.code;
			if (code !== undefined) {
				delete pack.code;
				let match;
				const base = pack.base;
				const map = (pack.map = {});
				while ((match = langProp.exec(code))) {
					map[match[1]] = match[2];
				}
				if (!base) return;
				for (const pack of this.packs) {
					if (pack.name === base) {
						this.parse(pack);
						// 避免循环继承报错
						try {
							Object.setPrototypeOf(map, pack.map);
						} catch (error: any) {}
					}
				}
			}
		}

		get(key: any) {
			if (key && key[0] === '#') {
				return this.active[key] ?? key;
			}
			return key;
		}

		append(pack: any) {
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

	const processors = {
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

	let overview = null;
	let parameters = null;
	let paramMap = null;
	let langMap = null;
	let manager = null;
	let parameter = null;
	let type = '';
	let content = '';
	let currentGroup = null;

	return function (meta, code) {
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
				// console.log(type, content)
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

		overview = null;
		parameters = null;
		paramMap = null;
		langMap = null;
		manager = null;
		parameter = null;
		type = '';
		content = '';

		if (updating) {
			(event as any).changedMeta = meta;
			window.dispatchEvent(event);
		}
	};
})();

PluginManager.reconstruct = (function IIFE() {
	const guidRegExp = /^[0-9a-f]{16}$/;
	const colorRegExp = /^[0-9a-f]{8}$/;
	const checkValue = (parameter, key, value) => {
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
					return Math.clamp(Math.roundTo(value, decimals), min, max) === value;
				}
				if (typeof value === 'string') {
					const n = Number(value);
					if (!Number.isNaN(n)) {
						const { min, max, decimals } = parameter;
						return Math.clamp(Math.roundTo(n, decimals), min, max) === n;
					}
				}
				return false;
			case 'variable-number':
				if (typeof value === 'number') {
					const { min, max, decimals } = parameter;
					return Math.clamp(Math.roundTo(value, decimals), min, max) === value;
				}
				if (typeof value === 'string') {
					const n = Number(value);
					if (!Number.isNaN(n)) {
						const { min, max, decimals } = parameter;
						return Math.clamp(Math.roundTo(n, decimals), min, max) === n;
					}
				}
				return VariableGetter.checkDataForPlugin(value);
			case 'option':
				return parameter.options.includes(value);
			case 'easing':
				return !!Data.easings.map[value];
			case 'team':
				return !!Data.teams.map[value];
			case 'variable':
				return value === '' || !!getVariable(value);
			case 'attribute':
			case 'attribute-key':
				if (value === '') return true;
				if (parameter.filter === 'any') return !!Attribute.getAttribute(value);
				return !!Attribute.getGroupAttribute(parameter.filter, value);
			case 'attribute-group':
				return value === '' || !!Attribute.getGroup(value);
			case 'enum':
			case 'enum-value':
				if (value === '') return true;
				if (parameter.filter === 'any') return !!Enum.getString(value);
				return !!Enum.getGroupString(parameter.filter, value);
			case 'enum-group':
				return value === '' || !!Enum.getGroup(value);
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
				return value === '' || guidRegExp.test(value);
			case 'variable-getter':
			case 'variable-setter':
				return VariableGetter.checkDataForPlugin(value);
			case 'actor-getter':
				return ActorGetter.checkDataForPlugin(value);
			case 'skill-getter':
				return SkillGetter.checkDataForPlugin(value);
			case 'state-getter':
				return StateGetter.checkDataForPlugin(value);
			case 'equipment-getter':
				return EquipmentGetter.checkDataForPlugin(value);
			case 'item-getter':
				return ItemGetter.checkDataForPlugin(value);
			case 'element-getter':
				return ElementGetter.checkDataForPlugin(value);
			case 'position-getter':
				return PositionGetter.checkDataForPlugin(value);
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
				return colorRegExp.test(value);
			case 'repeatable-group':
				return value instanceof Array;
		}
		return true;
	};

	const readValue = (parameter, value) => {
		const { type } = parameter;
		switch (type) {
			case 'boolean':
			case 'string':
				if (typeof value === type) return value;
				return parameter.value;
			case 'number':
				if (typeof value === 'number') {
					const { min, max, decimals } = parameter;
					return Math.clamp(Math.roundTo(value, decimals), min, max);
				}
				if (typeof value === 'string') {
					const n = Number(value);
					if (!Number.isNaN(n)) {
						const { min, max, decimals } = parameter;
						return Math.clamp(Math.roundTo(n, decimals), min, max);
					}
				}
				return parameter.value;
			case 'variable-number':
				if (typeof value === 'number') {
					const { min, max, decimals } = parameter;
					return Math.clamp(Math.roundTo(value, decimals), min, max);
				} else if (typeof value === 'string') {
					const n = Number(value);
					if (!Number.isNaN(n)) {
						const { min, max, decimals } = parameter;
						return Math.clamp(Math.roundTo(n, decimals), min, max);
					}
				} else if (VariableGetter.checkDataForPlugin(value)) {
					return value;
				}
				return parameter.value;
			case 'option': {
				if (parameter.options.includes(value)) return value;
				if (typeof value === 'number' && parameter.options[value] !== undefined) {
					return parameter.options[value];
				}
				if (typeof value === 'string') {
					const n = Number(value);
					if (!Number.isNaN(n) && parameter.options.includes(n)) {
						return n;
					}
				}
				if (typeof value === 'number' && parameter.options.includes(String(value))) {
					return String(value);
				}
				return parameter.value;
			}
			case 'easing':
				if (Data.easings.map[value]) return value;
				return Data.easings[0].id;
			case 'team':
				if (Data.teams.map[value]) return value;
				return Data.teams.list[0].id;
			case 'variable':
				if (getVariable(value)) return value;
				return '';
			case 'attribute':
			case 'attribute-key':
				if (parameter.filter === 'any') {
					if (Attribute.getAttribute(value)) return value;
				} else {
					if (Attribute.getGroupAttribute(parameter.filter, value)) return value;
				}
				return '';
			case 'attribute-group':
				if (Attribute.getGroup(value)) return value;
				return '';
			case 'enum':
			case 'enum-value':
				if (parameter.filter === 'any') {
					if (Enum.getString(value)) return value;
				} else {
					if (Enum.getGroupString(parameter.filter, value)) return value;
				}
				return '';
			case 'enum-group':
				if (Enum.getGroup(value)) return value;
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
				if (guidRegExp.test(value)) return value;
				return '';
			case 'variable-getter':
			case 'variable-setter':
				if (VariableGetter.checkDataForPlugin(value)) return value;
				return VariableGetter.createDefaultForPlugin();
			case 'actor-getter':
				if (ActorGetter.checkDataForPlugin(value)) return value;
				return ActorGetter.createDefaultForPlugin();
			case 'skill-getter':
				if (SkillGetter.checkDataForPlugin(value)) return value;
				return SkillGetter.createDefaultForPlugin();
			case 'state-getter':
				if (StateGetter.checkDataForPlugin(value)) return value;
				return StateGetter.createDefaultForPlugin();
			case 'equipment-getter':
				if (EquipmentGetter.checkDataForPlugin(value)) return value;
				return EquipmentGetter.createDefaultForPlugin();
			case 'item-getter':
				if (ItemGetter.checkDataForPlugin(value)) return value;
				return ItemGetter.createDefaultForPlugin();
			case 'element-getter':
				if (ElementGetter.checkDataForPlugin(value)) return value;
				return ElementGetter.createDefaultForPlugin();
			case 'position-getter':
				if (PositionGetter.checkDataForPlugin(value)) return value;
				return PositionGetter.createDefaultForPlugin();
			case 'number[]':
			case 'string[]':
				if (value instanceof Array) {
					const t = type.slice(0, -2);
					const arr = [];
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
				if (colorRegExp.test(value)) {
					return value;
				}
				return parameter.value;
			case 'repeatable-group':
				if (value instanceof Array) return value;
				return parameter.value;
		}
	};
	return function (script) {
		const { id, parameters } = script;
		const oEntries = Object.entries(parameters);
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
			const oMap = {};
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
			const newParameters = {};
			for (const mParam of mParameters) {
				const key = mParam.key;
				const arg = parameters[key];
				const value = readValue(mParam, arg);
				newParameters[key] = value;
			}
			script.parameters = newParameters;
			return true;
		}
		return false;
	};
})();

PluginManager.checkValidate = function (parameter, value) {
	if (!parameter.validate) return true;
	const v = parameter.validate;
	if (v.notEmpty && (value === '' || value == null)) return false;
	if (v.minLength != null && typeof value === 'string' && value.length < v.minLength)
		return false;
	if (v.maxLength != null && typeof value === 'string' && value.length > v.maxLength)
		return false;
	if (v.pattern && typeof value === 'string' && !v.pattern.test(value)) return false;
	return true;
};

PluginManager.saveToProject = function (project) {
	const { plugin } = project;
	plugin.detailed = this.detailed;
};

PluginManager.loadFromProject = function (project) {
	const { plugin } = project;
	this.detailed = plugin.detailed;
};

PluginManager.windowClose = function (event) {
	if (this.changed) {
		event.preventDefault();
		const get = Local.createGetter('confirmation');
		getWindow().confirm(
			{
				message: get('closeUnsavedPlugins')
			},
			[
				{
					label: get('yes'),
					click: () => {
						this.changed = false;
						getWindow().close('plugin');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
}.bind(PluginManager);

PluginManager.windowClosed = function (event) {
	this.list.saveSelection();
	this.data = null;
	clear(this.list);
	window.removeEventListener('keydown', this.keydown);
	window.removeEventListener('pointerdown', this.pointerdown);
	window.removeEventListener('script-change', this.scriptChange);
}.bind(PluginManager);

PluginManager.keydown = function (event) {
	if (event.cmdOrCtrlKey) {
		switch (event.code) {
			case 'KeyD':
				PluginManager.switchOverviewMode();
				break;
		}
	}
};

PluginManager.pointerdown = function (event) {
	// 阻止鼠标在窗口外部双击会选中概述内容的行为 并且调用失去焦点方法避免阻止后失效
	if (event.target === document.documentElement) {
		event.preventDefault();
		document.activeElement.blur();
	}
};

PluginManager.scriptChange = function (event) {
	if (PluginManager.meta === event.changedMeta) {
		PluginManager.loadOverview();
	}
};

PluginManager.listKeydown = function (event) {
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
};

PluginManager.listSelect = function (event) {
	PluginManager.load(event.value);
};

// 列表 - 取消选择事件
PluginManager.listUnselect = function (event) {
	PluginManager.unload();
};

PluginManager.listChange = function (event) {
	PluginManager.changed = true;
};

PluginManager.listPopup = function (event) {
	const list = PluginManager.list;
	const item = event.value;
	const selected = !!item;
	const pastable = (Clipboard as any).has('yami.data.plugin');
	const deletable = selected;
	const get = Local.createGetter('menuPluginList');
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
};

PluginManager.listOpen = function (event) {
	this.edit(event.value);
};

PluginManager.overviewPointerdown = (function IIFE() {
	const once = { once: true };
	const pointerup = (event) => {
		if (PluginManager.overview.contains(event.target)) {
			Menu.popup(
				{
					x: event.clientX,
					y: event.clientY
				},
				[
					{
						label: Local.get('menuPluginOverview.detail'),
						accelerator: ctrl('D'),
						checked: PluginManager.detailed,
						click: () => {
							PluginManager.switchOverviewMode();
						}
					}
				]
			);
		}
	};
	return function (event) {
		switch (event.button) {
			case 2:
				window.addEventListener('pointerup', pointerup, once);
				break;
		}
	};
})();

PluginManager.parameterPaneUpdate = function (event) {
	if (this.wraps.length !== 0) {
		show(this);
	} else {
		hide(this);
	}
};

PluginManager.confirm = function (event) {
	this.apply();
	getWindow().close('plugin');
}.bind(PluginManager);

PluginManager.apply = function (event) {
	if (this.changed) {
		this.changed = false;

		let plugins = this.data;
		if (event instanceof Event) {
			plugins = Object.clone(plugins);
		} else {
			TreeList.deleteCaches(plugins);
		}
		Data.plugins = plugins;
		File.planToSave(Data.manifest.project.plugins);
	}
}.bind(PluginManager);

// 列表 - 编辑
PluginManager.list_edit = function (item) {
	(window as any).Selector?.open?.(
		{
			filter: 'script',
			read: () => item.id,
			input: (id) => {
				if (item.id !== id) {
					item.id = id;
					item.parameters = {};
					PluginManager.changed = true;
					PluginManager.parameterPane.update();
				}
				this.update();
			}
		},
		false
	);
};

// 列表 - 插入
PluginManager.list_insert = function (dItem) {
	(window as any).Selector?.open?.(
		{
			filter: 'script',
			read: () => '',
			input: (id) => {
				this.addNodeTo(PluginManager.createData(id), dItem);
			}
		},
		false
	);
};

// 列表 - 开关
PluginManager.list_toggle = function (item) {
	if (item) {
		item.enabled = !item.enabled;
		this.updateToggleStyle(item);
		PluginManager.changed = true;
	}
};

// 列表 - 复制
PluginManager.list_copy = function (item) {
	if (item) {
		(Clipboard as any).write('yami.data.plugin', item);
	}
};

// 列表 - 粘贴
PluginManager.list_paste = function (dItem) {
	const copy = (Clipboard as any).read('yami.data.plugin');
	if (copy) {
		this.addNodeTo(copy, dItem);
	}
};

// 列表 - 删除
PluginManager.list_delete = function (item) {
	const get = Local.createGetter('confirmation');
	const name = Command.removeTextTags(Command.parseFileName(item.id));
	getWindow().confirm(
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
PluginManager.list_saveSelection = function () {
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
PluginManager.list_restoreSelection = function () {
	const id = Data.plugins.selection;
	const item = PluginManager.getItemById(id) ?? this.data[0];
	this.select(item);
	this.update();
	this.scrollToSelection();
};

// 列表 - 添加元素类名
PluginManager.list_addElementClass = function (item) {
	addClass(item.element, 'plugin-item');
};

// 列表 - 更新文本节点
PluginManager.list_updateTextNode = function (item) {
	const textNode = item.element.textNode;
	const text = Command.removeTextTags(Command.parseFileName(item.id));
	if (textNode.nodeValue !== text) {
		textNode.nodeValue = text;
	}
};

// 列表 - 更新开关样式
PluginManager.list_updateToggleStyle = function (item) {
	return item.enabled ? removeClass(item.element, 'weak') : addClass(item.element, 'weak');
};

// 列表 - 创建编辑图标
PluginManager.list_createEditIcon = function (item) {
	const box = document.createElement('div');
	addClass(box, 'box');
	box.textContent = '\uf044';
	addClass(box, 'script-edit-button');
	addClass(box, 'plugin-item-button');
	item.element.appendChild(box);
};

// 注意：不再重写 ParameterPane.createDetailBox / clear，以保留参数面板按 @group 分组的多 detail-box 渲染能力 （原生 ParameterPane 已支持，见 components/parameter-pane.js）
