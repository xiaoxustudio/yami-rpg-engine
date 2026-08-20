import { reactive } from 'vue';
import { getWindowStore } from '@app/stores/window';
import { getFocus } from '@app/utils/element-utils';

export interface RegionGetterForm {
	type: string;
	presetId: string;
}

interface RegionGetterTarget {
	read?: () => any;
	input: (getter: Record<string, unknown>) => void;
	isPluginInput?: boolean;
}

interface RegionGetterWindow {
	form: RegionGetterForm;
	open: (target: RegionGetterTarget, defaults?: Partial<RegionGetterForm>) => void;
	confirm: () => void;
	onWindowClosed: () => void;
}

type RegionGetterFrame = HTMLElement & {
	setForm?: (data: Partial<RegionGetterForm>) => void;
	getForm?: () => RegionGetterForm;
};

const form = reactive<RegionGetterForm>({
	type: 'trigger',
	presetId: ''
});
let callback: ((getter: Record<string, unknown>) => void) | null = null;

const getFrame = (): RegionGetterFrame | null =>
	document.getElementById('regionGetter') as RegionGetterFrame | null;

const open = (target: RegionGetterTarget, defaults?: Partial<RegionGetterForm>): void => {
	callback = (getter: Record<string, unknown>) => target.input(getter);
	getWindowStore().open('regionGetter');

	let presetId = defaults?.presetId ?? '';
	const region = target.read?.() ?? {};
	switch (region.type) {
		case 'trigger':
			break;
		case 'by-id':
			presetId = region.presetId;
			break;
	}
	Object.assign(form, { type: region.type, presetId });
	getFrame()?.setForm?.(form);
	getFocus(document.getElementById('regionGetter-type'));
};

const confirm = (): void => {
	const data = getFrame()?.getForm?.() ?? form;
	let getter: Record<string, unknown> | undefined;
	switch (data.type) {
		case 'trigger':
			getter = { type: data.type };
			break;
		case 'by-id':
			if (data.presetId === '') {
				getFocus(document.getElementById('regionGetter-presetId'));
				return;
			}
			getter = { type: data.type, presetId: data.presetId };
			break;
	}
	callback?.(getter!);
	getWindowStore().close('regionGetter');
};

const onWindowClosed = (): void => {
	callback = null;
};

export function useRegionGetterWindow(): RegionGetterWindow {
	return { form, open, confirm, onWindowClosed };
}
