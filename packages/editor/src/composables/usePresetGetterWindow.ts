import { reactive } from 'vue';
import { getWindowStore } from '@app/stores/window';
import { composableEls } from '@app/composables/element-registry';
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

interface PresetGetterWindow {
	form: PresetGetterForm;
	initialize: () => void;
	open: (target: PresetGetterTarget) => void;
	confirm: () => void;
	onWindowClosed: () => void;
}

type PresetGetterFrame = HTMLElement & {
	setForm?: (data: Partial<PresetGetterForm>) => void;
	getForm?: () => PresetGetterForm;
};

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

	const getFrame = (): PresetGetterFrame | null =>
		composableEls.get(domKey) as PresetGetterFrame | null;

	const initialize = (): void => {
		const typeEl = composableEls.get(`${domKey}-type`);
		if (!typeEl) return;
		typeEl.loadItems(items);
		typeEl.enableHiddenMode().relate([
			{ case: 'by-id', targets: [composableEls.get(`${domKey}-presetId`)] },
			{ case: 'variable', targets: [composableEls.get(`${domKey}-variable`)] }
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
		getFrame()?.setForm?.(form);
		getFocus(composableEls.get(`${domKey}-type`));
	};

	const confirm = (): void => {
		const data = getFrame()?.getForm?.() ?? form;
		let getter: Record<string, unknown> | undefined;
		switch (data.type) {
			case 'trigger':
			case 'latest':
				getter = { type: data.type };
				break;
			case 'by-id': {
				if (data.presetId === '') {
					getFocus(composableEls.get(`${domKey}-presetId`));
					return;
				}
				getter = { type: data.type, presetId: data.presetId };
				break;
			}
			case 'variable': {
				if ((data.variable as { key: string }).key === '') {
					getFocus(composableEls.get(`${domKey}-variable`));
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
