import { reactive } from 'vue';
import { getWindowStore } from '@app/stores/window';
import { requestFocus } from '@app/directives/focus';

export interface AncestorGetterForm {
	type: string;
	presetId: string;
	variable: { type: string; key: string };
}

interface AncestorGetterTarget {
	// oxlint-disable-next-line no-explicit-any
	read?: () => any;
	input: (getter: Record<string, unknown>) => void;
	isPluginInput?: boolean;
}

interface AncestorGetterWindow {
	form: AncestorGetterForm;
	open: (target: AncestorGetterTarget, defaults?: Partial<AncestorGetterForm>) => void;
	confirm: () => void;
	onWindowClosed: () => void;
}

const form = reactive<AncestorGetterForm>({
	type: 'trigger',
	presetId: '',
	variable: { type: 'local', key: '' }
});
let callback: ((getter: Record<string, unknown>) => void) | null = null;

const open = (target: AncestorGetterTarget, defaults?: Partial<AncestorGetterForm>): void => {
	callback = (getter: Record<string, unknown>) => target.input(getter);
	getWindowStore().open('ancestorGetter');

	let presetId = defaults?.presetId ?? '';
	let variable = { type: 'local', key: '' };
	const element = target.read?.() ?? {};
	switch (element.type) {
		case 'trigger':
		case 'latest':
			break;
		case 'by-id':
			presetId = element.presetId;
			break;
		case 'variable':
			variable = element.variable;
			break;
	}
	Object.assign(form, { type: element.type, presetId, variable });
	requestFocus('ancestorGetter-type');
};

const confirm = (): void => {
	const data = form;
	let getter: Record<string, unknown> | undefined;
	switch (data.type) {
		case 'trigger':
		case 'latest':
			getter = { type: data.type };
			break;
		case 'by-id':
			if (data.presetId === '') {
				requestFocus('ancestorGetter-presetId');
				return;
			}
			getter = { type: data.type, presetId: data.presetId };
			break;
		case 'variable':
			if (data.variable.key === '') {
				requestFocus('ancestorGetter-variable');
				return;
			}
			getter = { type: data.type, variable: data.variable };
			break;
	}
	callback?.(getter!);
	getWindowStore().close('ancestorGetter');
};

const onWindowClosed = (): void => {
	callback = null;
};

export function useAncestorGetterWindow(): AncestorGetterWindow {
	return { form, open, confirm, onWindowClosed };
}
