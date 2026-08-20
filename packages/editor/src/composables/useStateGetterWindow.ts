import { reactive } from 'vue';
import { getWindowStore } from '@app/stores/window';
import { getFocus } from '@app/utils/element-utils';

export interface StateGetterForm {
	type: string;
	actor: { type: string };
	stateId: string;
	variable: { type: string; key: string };
}

interface StateGetterTarget {
	read?: () => any;
	input: (getter: Record<string, unknown>) => void;
	isPluginInput?: boolean;
}

interface StateGetterWindow {
	form: StateGetterForm;
	open: (target: StateGetterTarget) => void;
	confirm: () => void;
	onWindowClosed: () => void;
}

type StateGetterFrame = HTMLElement & {
	setForm?: (data: Partial<StateGetterForm>) => void;
	getForm?: () => StateGetterForm;
};

const form = reactive<StateGetterForm>({
	type: 'trigger',
	actor: { type: 'trigger' },
	stateId: '',
	variable: { type: 'local', key: '' }
});
let callback: ((getter: Record<string, unknown>) => void) | null = null;
let pluginInput = false;

const getFrame = (): StateGetterFrame | null =>
	document.getElementById('stateGetter') as StateGetterFrame | null;

const open = (target: StateGetterTarget): void => {
	callback = (getter: Record<string, unknown>) => target.input(getter);
	pluginInput = target.isPluginInput === true;
	getWindowStore().open('stateGetter');

	let actor = { type: 'trigger' };
	let stateId = '';
	let variable = { type: 'local', key: '' };
	const state = target.read?.() ?? {};
	switch (state.type) {
		case 'by-id':
			actor = state.actor;
			stateId = state.stateId;
			break;
		case 'variable':
			variable = state.variable;
			break;
	}
	Object.assign(form, { type: state.type, actor, stateId, variable });
	getFrame()?.setForm?.(form);
	getFocus(document.getElementById('stateGetter-type'));
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
			const actor = data.actor;
			const stateId = data.stateId;
			if (stateId === '') {
				getFocus(document.getElementById('stateGetter-stateId'));
				return;
			}
			getter = { type: data.type, actor, stateId };
			break;
		}
		case 'variable':
			if (data.variable.key === '') {
				getFocus(document.getElementById('stateGetter-variable'));
				return;
			}
			getter = { type: data.type, variable: data.variable };
			break;
	}
	if (pluginInput) {
		getter = { getter: 'state', ...getter };
	}
	callback?.(getter!);
	getWindowStore().close('stateGetter');
};

const onWindowClosed = (): void => {
	callback = null;
};

export function useStateGetterWindow(): StateGetterWindow {
	return { form, open, confirm, onWindowClosed };
}
