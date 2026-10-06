import { getGetterWindowsStore } from '@app/stores/getter-windows';
import { getWindowStore } from '@app/stores/window';
import { requestFocus } from '@app/directives/focus';

export interface StateGetterForm {
	type: string;
	actor: { type: string };
	stateId: string;
	variable: { type: string; key: string };
}

interface StateGetterTarget {
	// oxlint-disable-next-line no-explicit-any
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

const form: StateGetterForm = {
	get type(): StateGetterForm['type'] {
		return getGetterWindowsStore().stateGetterForm.type;
	},
	set type(value: StateGetterForm['type']) {
		getGetterWindowsStore().stateGetterForm.type = value;
	},
	get actor(): StateGetterForm['actor'] {
		return getGetterWindowsStore().stateGetterForm.actor;
	},
	set actor(value: StateGetterForm['actor']) {
		getGetterWindowsStore().stateGetterForm.actor = value;
	},
	get stateId(): StateGetterForm['stateId'] {
		return getGetterWindowsStore().stateGetterForm.stateId;
	},
	set stateId(value: StateGetterForm['stateId']) {
		getGetterWindowsStore().stateGetterForm.stateId = value;
	},
	get variable(): StateGetterForm['variable'] {
		return getGetterWindowsStore().stateGetterForm.variable;
	},
	set variable(value: StateGetterForm['variable']) {
		getGetterWindowsStore().stateGetterForm.variable = value;
	}
};
let callback: ((getter: Record<string, unknown>) => void) | null = null;
let pluginInput = false;

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
	requestFocus('stateGetter-type');
};

const confirm = (): void => {
	const data = form;
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
				requestFocus('stateGetter-stateId');
				return;
			}
			getter = { type: data.type, actor, stateId };
			break;
		}
		case 'variable':
			if (data.variable.key === '') {
				requestFocus('stateGetter-variable');
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
