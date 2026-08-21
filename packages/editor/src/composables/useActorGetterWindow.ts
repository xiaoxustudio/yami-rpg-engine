import { reactive } from 'vue';
import { getWindowStore } from '@app/stores/window';
import { getFocus } from '@app/utils/element-utils';

export interface ActorGetterForm {
	type: string;
	memberId: number;
	actorId: string;
	presetId: string;
	variable: { type: string; key: string };
}

interface ActorGetterTarget {
	read?: () => any;
	input: (getter: Record<string, unknown>) => void;
	isPluginInput?: boolean;
}

interface ActorGetterWindow {
	form: ActorGetterForm;
	open: (target: ActorGetterTarget, defaults?: Partial<ActorGetterForm>) => void;
	confirm: () => void;
	onWindowClosed: () => void;
}

const form = reactive<ActorGetterForm>({
	type: 'trigger',
	memberId: 0,
	actorId: '',
	presetId: '',
	variable: { type: 'local', key: '' }
});
let callback: ((getter: Record<string, unknown>) => void) | null = null;
let pluginInput = false;

const open = (target: ActorGetterTarget, defaults?: Partial<ActorGetterForm>): void => {
	callback = (getter: Record<string, unknown>) => target.input(getter);
	pluginInput = target.isPluginInput === true;
	getWindowStore().open('actorGetter');

	let memberId = 0;
	let actorId = '';
	let presetId = defaults?.presetId ?? '';
	let variable = { type: 'local', key: '' };
	const actor = target.read?.() ?? {};
	switch (actor.type) {
		case 'member':
			memberId = actor.memberId;
			break;
		case 'global':
			actorId = actor.actorId;
			break;
		case 'by-id':
			presetId = actor.presetId;
			break;
		case 'variable':
			variable = actor.variable;
			break;
	}
	Object.assign(form, { type: actor.type, memberId, actorId, presetId, variable });
	getFocus(document.getElementById('actorGetter-type'));
};

const confirm = (): void => {
	const data = form;
	let getter: Record<string, unknown> | undefined;
	switch (data.type) {
		case 'trigger':
		case 'caster':
		case 'latest':
		case 'target':
		case 'player':
			getter = { type: data.type };
			break;
		case 'member':
			getter = { type: data.type, memberId: data.memberId };
			break;
		case 'global':
			if (data.actorId === '') {
				getFocus(document.getElementById('actorGetter-actorId'));
				return;
			}
			getter = { type: data.type, actorId: data.actorId };
			break;
		case 'by-id':
			if (data.presetId === '') {
				getFocus(document.getElementById('actorGetter-presetId'));
				return;
			}
			getter = { type: data.type, presetId: data.presetId };
			break;
		case 'variable':
			if (data.variable.key === '') {
				getFocus(document.getElementById('actorGetter-variable'));
				return;
			}
			getter = { type: data.type, variable: data.variable };
			break;
	}
	if (pluginInput) {
		getter = { getter: 'actor', ...getter };
	}
	callback?.(getter!);
	getWindowStore().close('actorGetter');
};

const onWindowClosed = (): void => {
	callback = null;
};

export function useActorGetterWindow(): ActorGetterWindow {
	return { form, open, confirm, onWindowClosed };
}
