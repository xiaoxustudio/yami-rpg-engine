/* oxlint-disable eslint/no-restricted-properties */
import { $ } from '@app/utils/dom';
import { Window } from '@app/tools/window-object.ts';
import { getFocus, on } from '@app/utils/element-utils.ts';
import { Command } from '@app/commands/command-object.ts';
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
	initialize: (() => void) | null;
	// 幂等初始化：属性窗口为懒挂载，ParamList.bind 时的 initialize 可能因元素未挂载而早退，
	// 由窗口组件在 onMounted 后调用 ensureSetup 兜底补做 key 选项/字段显隐联动
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
	// confirm 与窗口对象解耦，避免 ensureSetup 重复绑定或引用错位
	const thisConfirmClick = () => PropertyWindow.confirm!(new Event('click'));
	// 幂等初始化；key 下拉元素未挂载时返回 false（供挂载后重试）
	const ensureSetup = (): boolean => {
		const keyEl = $(`#${prefix}-property-key`);
		if (!keyEl) return false;

		if (!setupDone) {
			const items = keys.map((k: PropertyKeyConfig) => ({ name: k.name, value: k.value }));
			keyEl.loadItems(items);

			const relates = keys.map((k: PropertyKeyConfig) => {
				const caseValue = k.cases ?? k.value;
				const uiName = k.uiName ?? k.value;
				const targets = k.targets
					? k.targets.map((id: string) => $(`#${prefix}-property-${id}`))
					: [$(`#${prefix}-property-${uiName}`)];
				return { case: caseValue, targets };
			});
			keyEl.enableHiddenMode().relate(relates);

			if (subRelates) {
				for (const sr of subRelates) {
					const subRelates2 = sr.cases.map((c: { case: string; targets: string[] }) => ({
						case: c.case,
						targets: c.targets.map((id: string) => $(`#${prefix}-property-${id}`))
					}));
					$(`#${prefix}-property-${sr.selector}`).enableHiddenMode().relate(subRelates2);
				}
			}

			init?.call(PropertyWindow);
			if (init) {
				const onLocalize = () => {
					if (!document.getElementById(`${prefix}-property-key`)) return;
					init.call(PropertyWindow);
				};
				window.addEventListener('localize', onLocalize);
			}
			on($(`#${prefix}-property-confirm`), 'click', thisConfirmClick);
			setupDone = true;
		}

		// 属性窗口可能先于本函数完成数据载入（懒挂载时序）：按当前 key 立即刷新相关字段显隐
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
		// 若懒挂载窗口此刻已就绪则顺势补初始化（key 下拉选项与字段显隐联动）
		ensureSetup();
		getFocus($(`#${prefix}-property-key`));
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
