import { reactive } from 'vue';
import { getWindowStore } from '@app/stores/window';
import { getFocus } from '@app/utils/element-utils';

export interface TriggerGetterForm {
	type: string;
	variable: { type: string; key: string };
}

interface TriggerGetterTarget {
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

type TriggerGetterFrame = HTMLElement & {
	setForm?: (data: Partial<TriggerGetterForm>) => void;
	getForm?: () => TriggerGetterForm;
};

const form = reactive<TriggerGetterForm>({
	type: 'trigger',
	variable: { type: 'local', key: '' }
});
let callback: ((getter: Record<string, unknown>) => void) | null = null;

const getFrame = (): TriggerGetterFrame | null =>
	document.getElementById('triggerGetter') as TriggerGetterFrame | null;

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
	getFrame()?.setForm?.(form);
	getFocus(document.getElementById('triggerGetter-type'));
};

const confirm = (): void => {
	const data = getFrame()?.getForm?.() ?? form;
	let getter: Record<string, unknown> | undefined;
	switch (data.type) {
		case 'trigger':
		case 'latest':
			getter = { type: data.type };
			break;
		case 'variable':
			if (data.variable.key === '') {
				getFocus(document.getElementById('triggerGetter-variable'));
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
