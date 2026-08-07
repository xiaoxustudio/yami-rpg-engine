import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { getFocus } from '@/util/element-utils.ts';
import { Command } from './command-object.ts';
import { Token } from './mark-string-manager.ts';
import { Local } from '@/tools/localization.ts';

interface PropertyKeyConfig {
	name: string;
	value: string;
	cases?: string[];
	uiName?: string;
	default?: any;
	targets?: string[];
}

type ParserFn = (value: any, get: (key: string) => string, name: string) => string;

interface PropertyWindowConfig {
	prefix: string;
	locale: string;
	keys: PropertyKeyConfig[];
	parseValue?: (key: string, value: any, get: (key: string) => string) => string;
	parsers?: Record<string, ParserFn>;
	init?: (this: any) => void;
	openData?: (defaults: Record<string, any>, key: string, value: any) => void;
	saveData?: (key: string, read: (k: string) => any) => any;
	subRelates?: Array<{
		selector: string;
		cases: Array<{ case: string; targets: string[] }>;
	}>;
}

// 属性窗口返回契约
interface PropertyWindow {
	target: any;
	initialize: (() => void) | null;
	parse: ((data: { key: string; value: any }, listData?: boolean) => string) | null;
	open: ((data?: { key: string; value: any }) => void) | null;
	save: (() => { key: string; value: any }) | null;
	confirm: ((event: Event) => { key: string; value: any }) | null;
}

export function createPropertyWindow(config: PropertyWindowConfig): PropertyWindow {
	const { prefix, locale, keys, parseValue, parsers, init, openData, saveData, subRelates } =
		config;

	const PropertyWindow = {
		target: null as any,
		initialize: null as any,
		parse: null as any,
		open: null as any,
		save: null as any,
		confirm: null as any
	};

	PropertyWindow.initialize = function (this: any) {
		if (!$(`#${prefix}-property-key`)) return;
		const items = keys.map((k: any) => ({ name: k.name, value: k.value }));
		$(`#${prefix}-property-key`).loadItems(items);

		const relates = keys.map((k: any) => {
			const caseValue = k.cases ?? k.value;
			const uiName = k.uiName ?? k.value;
			const targets = k.targets
				? k.targets.map((id: any) => $(`#${prefix}-property-${id}`))
				: [$(`#${prefix}-property-${uiName}`)];
			return { case: caseValue, targets };
		});
		$(`#${prefix}-property-key`).enableHiddenMode().relate(relates);

		if (subRelates) {
			for (const sr of subRelates) {
				const subRelates2 = sr.cases.map((c: any) => ({
					case: c.case,
					targets: c.targets.map((id: any) => $(`#${prefix}-property-${id}`))
				}));
				$(`#${prefix}-property-${sr.selector}`).enableHiddenMode().relate(subRelates2);
			}
		}

		init?.call(this);

		$(`#${prefix}-property-confirm`).on('click', this.confirm);
	};

	PropertyWindow.parse = function (this: any, { key, value }: any, listData: any) {
		const get = Local.createGetter!(locale);
		const name = get(key).replace('.', Token('.'));
		let string;

		if (parsers) {
			const parser = parsers[key];
			if (parser) {
				string = parser(value, get, name);
			}
		} else if (parseValue) {
			string = name + Token('(') + parseValue(key, value, get) + Token(')');
		}

		if (listData) {
			string = Command.removeTextTags!(string);
		}
		return string;
	};

	PropertyWindow.open = function (this: any, data: any) {
		const defaultKey = keys[0].value;
		const defaultVal = keys[0].default;
		const key = data?.key ?? defaultKey;
		const value = data?.value ?? defaultVal;

		Window.open!(`${prefix}-property`);

		const defaults = {} as Record<string, any>;
		for (const k of keys) {
			defaults[k.uiName ?? k.value] = k.default;
		}

		if (openData) {
			openData(defaults, key, value);
		} else {
			defaults[key] = value;
		}

		const write = getElementWriter(`${prefix}-property`, defaults);
		write('key', key);
		for (const k of keys) {
			write(k.uiName ?? k.value);
		}
		getFocus($(`#${prefix}-property-key`));
	};

	PropertyWindow.save = function (this: any) {
		const read = getElementReader(`${prefix}-property`);
		const key = read('key');
		let value;

		if (saveData) {
			value = saveData(key, read);
		} else {
			const keyObj = keys.find((k: any) => k.value === key);
			value = read(keyObj?.uiName ?? key);
		}

		Window.close!(`${prefix}-property`);
		return { key, value };
	};

	PropertyWindow.confirm = function (this: any, event: any) {
		return PropertyWindow.target?.save?.();
	};

	return PropertyWindow;
}
