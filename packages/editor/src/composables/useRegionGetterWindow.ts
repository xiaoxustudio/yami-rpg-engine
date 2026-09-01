/* oxlint-disable eslint/no-restricted-properties */
import { reactive } from 'vue';
import { getWindowStore } from '@app/stores/window';
import { requestFocus } from '@app/directives/focus';

export interface RegionGetterForm {
	type: string;
	presetId: string;
}

interface RegionGetterTarget {
	// oxlint-disable-next-line no-explicit-any
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

const form = reactive<RegionGetterForm>({
	type: 'trigger',
	presetId: ''
});
let callback: ((getter: Record<string, unknown>) => void) | null = null;

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
	requestFocus('regionGetter-type');
};

const confirm = (): void => {
	const data = form;
	let getter: Record<string, unknown> | undefined;
	switch (data.type) {
		case 'trigger':
			getter = { type: data.type };
			break;
		case 'by-id':
			if (data.presetId === '') {
				requestFocus('regionGetter-presetId');
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
