import { reactive } from 'vue';
import { getWindowStore } from '@app/stores/window';
import { presetGetterBridge } from '@app/composables/preset-getter-bridge';
import { getFocus } from '@app/utils/element-utils';
import { PresetObject } from '@app/composables/usePresetObjectWindow';

export interface PresetGetterForm {
	type: string;
	presetId: string;
	variable: { type: string; key: string };
}

interface PresetGetterTarget {
	// oxlint-disable-next-line no-explicit-any
	dataValue?: any;
	// oxlint-disable-next-line no-explicit-any
	read?: () => any;
	input: (getter: Record<string, unknown>) => void;
	isPluginInput?: boolean;
}

/**
 * 类型下拉元素：元素契约迁移的中间态 —— 控件由窗口的模板 ref 交过来（不再按 id 查注册表），
 * 但「元素优先」的 API 仍挂在 DOM 元素上（`attachElementApi`），所以这里按结构类型声明它。
 * P3 阶段把包装层的 attachElementApi 删掉后，这里会变成组件实例的引用类型。
 */
export type PresetGetterTypeElement = HTMLElement & {
	loadItems?: (items: unknown[]) => unknown;
	enableHiddenMode?: () => { relate?: (entries: unknown) => unknown } | undefined;
};

/** 窗口在 onMounted 里按模板 ref 交过来的三个元素（元素契约迁移后不再走注册表）。 */
export interface PresetGetterElements {
	type: PresetGetterTypeElement | null;
	presetId: HTMLElement | null;
	variable: HTMLElement | null;
}

interface PresetGetterWindow {
	form: PresetGetterForm;
	initialize: (fields?: PresetGetterElements) => void;
	open: (target: PresetGetterTarget) => void;
	confirm: () => void;
	onWindowClosed: () => void;
}

interface PresetAccessorConfig {
	domKey: string;
	presetCategory: string;
	items: { name: string; value: string }[];
}

function createPresetGetterWindow(config: PresetAccessorConfig): PresetGetterWindow {
	const { domKey, presetCategory, items } = config;
	const form = reactive<PresetGetterForm>({
		type: 'trigger',
		presetId: '',
		variable: { type: 'local', key: '' }
	});
	let callback: ((getter: Record<string, unknown>) => void) | null = null;
	/**
	 * 控件元素：由窗口在 onMounted 时按模板 ref 交过来。
	 * 之前是 `composableEls.get(\`${domKey}-type\`)` —— 即「按 id 去全局注册表找裸元素」，
	 * 元素契约收尾要拆的就是这条路径。
	 */
	let fields: PresetGetterElements = { type: null, presetId: null, variable: null };

	const initialize = (next?: PresetGetterElements): void => {
		if (next) fields = { ...fields, ...next };
		const typeEl = fields.type;
		if (!typeEl) return;
		typeEl.loadItems?.(items);
		typeEl.enableHiddenMode?.()?.relate?.([
			{ case: 'by-id', targets: [fields.presetId] },
			{ case: 'variable', targets: [fields.variable] }
		]);
	};

	const open = (target: PresetGetterTarget): void => {
		callback = (getter: Record<string, unknown>) => target.input(getter);
		getWindowStore().open(domKey);

		let presetId = PresetObject.getDefaultPresetId(presetCategory);
		let variable = { type: 'local', key: '' };
		const data = target.read?.();
		switch (data.type) {
			case 'trigger':
			case 'latest':
				break;
			case 'by-id':
				presetId = data.presetId;
				break;
			case 'variable':
				variable = data.variable;
				break;
		}
		Object.assign(form, { type: data.type, presetId, variable });
		// 表单桥来自模块（窗口组件 onMounted 时登记），不再从窗口根元素的 DOM 属性上取
		presetGetterBridge(domKey)?.get()?.setForm?.(form);
		getFocus(fields.type);
	};

	const confirm = (): void => {
		const data = presetGetterBridge(domKey)?.get()?.getForm?.() ?? form;
		let getter: Record<string, unknown> | undefined;
		switch (data.type) {
			case 'trigger':
			case 'latest':
				getter = { type: data.type };
				break;
			case 'by-id': {
				if (data.presetId === '') {
					getFocus(fields.presetId);
					return;
				}
				getter = { type: data.type, presetId: data.presetId };
				break;
			}
			case 'variable': {
				if ((data.variable as { key: string }).key === '') {
					getFocus(fields.variable);
					return;
				}
				getter = { type: data.type, variable: data.variable };
				break;
			}
		}
		callback?.(getter!);
		getWindowStore().close(domKey);
	};

	const onWindowClosed = (): void => {
		callback = null;
	};

	return { form, initialize, open, confirm, onWindowClosed };
}

let lightWindow: PresetGetterWindow | null = null;
let objectWindow: PresetGetterWindow | null = null;

export function useLightGetterWindow(): PresetGetterWindow {
	if (!lightWindow) {
		lightWindow = createPresetGetterWindow({
			domKey: 'lightGetter',
			presetCategory: 'light',
			items: [
				{ name: 'Event Trigger Light', value: 'trigger' },
				{ name: 'Latest Light', value: 'latest' },
				{ name: 'By Light ID', value: 'by-id' },
				{ name: 'Variable', value: 'variable' }
			]
		});
	}
	return lightWindow;
}

export function useObjectGetterWindow(): PresetGetterWindow {
	if (!objectWindow) {
		objectWindow = createPresetGetterWindow({
			domKey: 'objectGetter',
			presetCategory: 'any',
			items: [
				{ name: 'Event Trigger Object', value: 'trigger' },
				{ name: 'Latest Scene Object', value: 'latest' },
				{ name: 'By Object ID', value: 'by-id' },
				{ name: 'Variable', value: 'variable' }
			]
		});
	}
	return objectWindow;
}
