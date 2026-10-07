import { Window } from '@app/tools/window-object.ts';
import { getFocus } from '@app/utils/element-utils.ts';
import { Command } from '@app/commands/command-object.ts';
import type { AccessorFieldControl, AccessorFields } from '@app/types/shapes.ts';
import { Token } from '@app/commands/token.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { reactive } from 'vue';

interface PropertyKeyConfig {
	name: string;
	value: string;
	cases?: string[];
	uiName?: string;
	default?: unknown;
	targets?: string[];
}

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
	form: Record<string, unknown>;
	fields?: AccessorFields | null;
	initialize: (() => void) | null;
	ensureSetup: (() => void) | null;
	parse: ((data: { key: string; value: unknown }, listData?: boolean) => string) | null;
	open: ((data?: { key: string; value: unknown }) => void) | null;
	save: (() => { key: string; value: unknown }) | null;
	confirm: ((event: Event) => { key: string; value: unknown }) | null;
}

export function createPropertyWindow(config: PropertyWindowConfig): PropertyWindow {
	const { prefix, locale, keys, parseValue, parsers, init, openData, saveData, subRelates } =
		config;

	const form = reactive<Record<string, unknown>>({ key: '' });

	const PropertyWindow: PropertyWindow = {
		target: null,
		form,
		initialize: null,
		ensureSetup: null,
		parse: null,
		open: null,
		save: null,
		confirm: null
	};

	let setupDone = false;
	const fieldOf = (id: string): AccessorFieldControl | undefined =>
		PropertyWindow.fields?.get(`${prefix}-property-${id}`) ?? undefined;
	const fieldRootOf = (id: string): HTMLElement | null | undefined => {
		const control = fieldOf(id);
		if (control === undefined) return undefined;
		return control instanceof HTMLElement ? control : control.root;
	};
	const ensureSetup = (): boolean => {
		const keyEl = fieldOf('key');
		if (!keyEl) return false;

		if (!setupDone) {
			const items = keys.map((k: PropertyKeyConfig) => ({ name: k.name, value: k.value }));
			keyEl.loadItems?.(items);

			const relates = keys.map((k: PropertyKeyConfig) => {
				const caseValue = k.cases ?? k.value;
				const uiName = k.uiName ?? k.value;
				const targets = k.targets
					? k.targets.map((id: string) => fieldRootOf(id))
					: [fieldRootOf(uiName)];
				return { case: caseValue, targets };
			});
			keyEl.enableHiddenMode?.()?.relate?.(relates);

			if (subRelates) {
				for (const sr of subRelates) {
					const subRelates2 = sr.cases.map((c: { case: string; targets: string[] }) => ({
						case: c.case,
						targets: c.targets.map((id: string) => fieldRootOf(id))
					}));
					fieldOf(sr.selector)?.enableHiddenMode?.()?.relate?.(subRelates2);
				}
			}

			init?.call(PropertyWindow);
			if (init) {
				const onLocalize = () => {
					if (!PropertyWindow.fields?.get(`${prefix}-property-key`)) return;
					init.call(PropertyWindow);
				};
				window.addEventListener('localize', onLocalize);
			}
			setupDone = true;
		}

		if (PropertyWindow.form.key !== undefined && PropertyWindow.form.key !== '') {
			keyEl.write?.(PropertyWindow.form.key);
		}
		return true;
	};

	PropertyWindow.initialize = function () {
		ensureSetup();
	};
	PropertyWindow.ensureSetup = function () {
		ensureSetup();
	};

	PropertyWindow.parse = function (
		this: PropertyWindow,
		{ key, value }: { key: string; value: unknown },
		listData?: boolean
	) {
		const get = (key: string) => t(locale + '.' + key);
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

		Object.assign(form, defaults, { key });
		ensureSetup();
		getFocus(fieldRootOf('key'));
	};

	PropertyWindow.save = function (this: PropertyWindow) {
		const key = form.key as string;
		let value;

		if (saveData) {
			value = saveData(key, (k: string) => form[k]);
		} else {
			const keyObj = keys.find((k: PropertyKeyConfig) => k.value === key);
			value = form[keyObj?.uiName ?? key];
		}

		Window.close!(`${prefix}-property`);
		return { key, value };
	};

	PropertyWindow.confirm = function (this: PropertyWindow, _event: Event) {
		return PropertyWindow.target?.save?.() as { key: string; value: unknown };
	};

	return PropertyWindow;
}
