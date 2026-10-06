import { getGetterWindowsStore } from '@app/stores/getter-windows';
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

const form: AncestorGetterForm = {
	get type(): AncestorGetterForm['type'] {
		return getGetterWindowsStore().ancestorGetterForm.type;
	},
	set type(value: AncestorGetterForm['type']) {
		getGetterWindowsStore().ancestorGetterForm.type = value;
	},
	get presetId(): AncestorGetterForm['presetId'] {
		return getGetterWindowsStore().ancestorGetterForm.presetId;
	},
	set presetId(value: AncestorGetterForm['presetId']) {
		getGetterWindowsStore().ancestorGetterForm.presetId = value;
	},
	get variable(): AncestorGetterForm['variable'] {
		return getGetterWindowsStore().ancestorGetterForm.variable;
	},
	set variable(value: AncestorGetterForm['variable']) {
		getGetterWindowsStore().ancestorGetterForm.variable = value;
	}
};
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
