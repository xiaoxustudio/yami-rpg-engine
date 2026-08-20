import { $, getElementReader, getElementWriter } from '@app/utils/dom';
import { Window } from '@app/legacy/tools/window-object.ts';
import { getFocus } from '@app/utils/element-utils.ts';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { createGetter } from '@app/i18n';

interface PropertyKeyConfig {
	name: string;
	value: string;
	cases?: string[];
	uiName?: string;
	default?: unknown;
	targets?: string[];
}

type ParserFn = (value: unknown, get: (key: string) => string, name: string) => string;

interface PropertyWindowConfig {
	prefix: string;
	locale: string;
	keys: PropertyKeyConfig[];
	parseValue?: (key: string, value: unknown, get: (key: string) => string) => string;
	parsers?: Record<
		string,
		(value: unknown, get: (key: string) => string, name: string) => string
	>;
	init?: (this: PropertyWindow) => void;
	openData?: (defaults: Record<string, unknown>, key: string, value: unknown) => void;
	saveData?: (key: string, read: (k: string) => unknown) => unknown;
	subRelates?: Array<{
		selector: string;
		cases: Array<{ case: string; targets: string[] }>;
	}>;
}

interface PropertyWindow {
	target: (Record<string, unknown> & { save?: (() => unknown) | null }) | null;
	initialize: (() => void) | null;
	parse: ((data: { key: string; value: unknown }, listData?: boolean) => string) | null;
	open: ((data?: { key: string; value: unknown }) => void) | null;
	save: (() => { key: string; value: unknown }) | null;
	confirm: ((event: Event) => { key: string; value: unknown }) | null;
}

export function createPropertyWindow(config: PropertyWindowConfig): PropertyWindow {
	const { prefix, locale, keys, parseValue, parsers, init, openData, saveData, subRelates } =
		config;

	const PropertyWindow: PropertyWindow = {
		target: null,
		initialize: null,
		parse: null,
		open: null,
		save: null,
		confirm: null
	};

	PropertyWindow.initialize = function (this: PropertyWindow) {
		if (!$(`#${prefix}-property-key`)) return;
		const items = keys.map((k: PropertyKeyConfig) => ({ name: k.name, value: k.value }));
		$(`#${prefix}-property-key`).loadItems(items);

		const relates = keys.map((k: PropertyKeyConfig) => {
			const caseValue = k.cases ?? k.value;
			const uiName = k.uiName ?? k.value;
			const targets = k.targets
				? k.targets.map((id: string) => $(`#${prefix}-property-${id}`))
				: [$(`#${prefix}-property-${uiName}`)];
			return { case: caseValue, targets };
		});
		$(`#${prefix}-property-key`).enableHiddenMode().relate(relates);

		if (subRelates) {
			for (const sr of subRelates) {
				const subRelates2 = sr.cases.map((c: { case: string; targets: string[] }) => ({
					case: c.case,
					targets: c.targets.map((id: string) => $(`#${prefix}-property-${id}`))
				}));
				$(`#${prefix}-property-${sr.selector}`).enableHiddenMode().relate(subRelates2);
			}
		}

		init?.call(this);

		if (init) {
			const onLocalize = () => {
				if (!document.getElementById(`${prefix}-property-key`)) return;
				init.call(PropertyWindow);
			};
			window.addEventListener('localize', onLocalize);
		}

		$(`#${prefix}-property-confirm`).on('click', this.confirm);
	};

	PropertyWindow.parse = function (
		this: PropertyWindow,
		{ key, value }: { key: string; value: unknown },
		listData?: boolean
	) {
		const get = createGetter(locale);
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

	PropertyWindow.open = function (this: PropertyWindow, data?: { key: string; value: unknown }) {
		const defaultKey = keys[0].value;
		const defaultVal = keys[0].default;
		const key = data?.key ?? defaultKey;
		const value = data?.value ?? defaultVal;

		Window.open!(`${prefix}-property`);

		const defaults = {} as Record<string, unknown>;
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

	PropertyWindow.save = function (this: PropertyWindow) {
		const read = getElementReader(`${prefix}-property`);
		const key = read('key');
		let value;

		if (saveData) {
			value = saveData(key, read);
		} else {
			const keyObj = keys.find((k: PropertyKeyConfig) => k.value === key);
			value = read(keyObj?.uiName ?? key);
		}

		Window.close!(`${prefix}-property`);
		return { key, value };
	};

	PropertyWindow.confirm = function (this: PropertyWindow, event: Event) {
		return PropertyWindow.target?.save?.() as { key: string; value: unknown };
	};

	return PropertyWindow;
}
