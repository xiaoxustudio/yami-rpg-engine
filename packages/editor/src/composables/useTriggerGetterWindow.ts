import { getGetterWindowsStore } from '@app/stores/getter-windows';
import { getWindowStore } from '@app/stores/window';
import { requestFocus } from '@app/directives/focus';

export interface TriggerGetterForm {
	type: string;
	variable: { type: string; key: string };
}

interface TriggerGetterTarget {
	// oxlint-disable-next-line no-explicit-any
	read?: () => any;
	input: (getter: Record<string, unknown>) => void;
	isPluginInput?: boolean;
}

interface TriggerGetterWindow {
	form: TriggerGetterForm;
	open: (target: TriggerGetterTarget) => void;
	confirm: () => void;
	onWindowClosed: () => void;
}

const form: TriggerGetterForm = {
	get type(): TriggerGetterForm['type'] {
		return getGetterWindowsStore().triggerGetterForm.type;
	},
	set type(value: TriggerGetterForm['type']) {
		getGetterWindowsStore().triggerGetterForm.type = value;
	},
	get variable(): TriggerGetterForm['variable'] {
		return getGetterWindowsStore().triggerGetterForm.variable;
	},
	set variable(value: TriggerGetterForm['variable']) {
		getGetterWindowsStore().triggerGetterForm.variable = value;
	}
};
let callback: ((getter: Record<string, unknown>) => void) | null = null;

const open = (target: TriggerGetterTarget): void => {
	callback = (getter: Record<string, unknown>) => target.input(getter);
	getWindowStore().open('triggerGetter');

	let variable = { type: 'local', key: '' };
	const trigger = target.read?.() ?? {};
	switch (trigger.type) {
		case 'trigger':
		case 'latest':
			break;
		case 'variable':
			variable = trigger.variable;
			break;
	}
	Object.assign(form, { type: trigger.type, variable });
	requestFocus('triggerGetter-type');
};

const confirm = (): void => {
	const data = form;
	let getter: Record<string, unknown> | undefined;
	switch (data.type) {
		case 'trigger':
		case 'latest':
			getter = { type: data.type };
			break;
		case 'variable':
			if (data.variable.key === '') {
				requestFocus('triggerGetter-variable');
				return;
			}
			getter = { type: data.type, variable: data.variable };
			break;
	}
	callback?.(getter!);
	getWindowStore().close('triggerGetter');
};

const onWindowClosed = (): void => {
	callback = null;
};

export function useTriggerGetterWindow(): TriggerGetterWindow {
	return { form, open, confirm, onWindowClosed };
}
