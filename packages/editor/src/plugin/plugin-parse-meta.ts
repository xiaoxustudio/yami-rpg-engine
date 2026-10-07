import { PluginManager } from './plugin.ts';
import type {
	OverviewShape,
	ParameterShape,
	OptionParameterShape,
	PluginMetaShape
} from './plugin.ts';
import { LanguageMap } from './language-map.ts';
import { Data } from '@app/data/data-object.ts';
import { ActorGetter } from '@app/commands/accessors/actor-accessor-window.ts';
import { ElementGetter } from '@app/commands/accessors/element-accessor-window.ts';
import { EquipmentGetter } from '@app/commands/accessors/equipment-accessor-window.ts';
import { ItemGetter } from '@app/commands/accessors/item-accessor-window.ts';
import { PositionGetter } from '@app/commands/accessors/position-accessor-window.ts';
import { SkillGetter } from '@app/commands/accessors/skill-accessor-window.ts';
import { StateGetter } from '@app/commands/accessors/state-accessor-window.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { clamp } from '@app/utils/math';

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
		switch (parameter!.type) {
			case 'boolean':
				return parseBoolean(content);
			case 'number':
			case 'variable-number':
				return parseNumber(content);
			case 'string':
				return parseString(content);
			case 'option': {
				const value = parseString(content) ?? parseNumber(content) ?? parseBoolean(content);
				return parameter!.options!.includes(value as string | number | boolean)
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
			parameter.value = clamp(parameter.value as number, min, max);
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
					} catch (_e) {
						console.warn('插件校验正则无效，已忽略', val);
					}
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
			const pKey = parameter!.key;
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
			if (parameter!.type === 'option') {
				let node: OptionParameterShape | null | undefined = owner;
				while ((node = node.parent)) {
					if (node === parameter) {
						return;
					}
				}
				Object.defineProperty(parameter, 'parent', { value: owner });
			}
			const { map } = this;
			const { key } = parameter!;
			const { options } = owner;
			for (const value of values) {
				if (options!.includes(value)) {
					if (map[value as string] === undefined) map[value as string] = [key];
					else map[value as string].push(key);
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
			const actives = map[active as string] ?? [];
			for (const option of options!) {
				const keys = map[option as string];
				if (keys === undefined) continue;
				for (const key of keys) {
					states[key] = actives.includes(key);
				}
			}
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

	let overview: OverviewShape = { requires: [] };
	let parameters: ParameterShape[] = [];
	let paramMap: Record<string, ParameterShape> = {};
	let langMap: LanguageMap = new LanguageMap();
	let manager: OptionManager = new OptionManager();
	let parameter: ParameterShape | null = null;
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

		parameter = null;
		type = '';
		content = '';

		if (updating) {
			(event as Event & { changedMeta?: PluginMetaShape }).changedMeta = meta;
			window.dispatchEvent(event);
		}
	};
})() as ((...args: unknown[]) => void) | null;
