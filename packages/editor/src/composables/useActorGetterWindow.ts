import { getGetterWindowsStore } from '@app/stores/getter-windows';
import { getWindowStore } from '@app/stores/window';
import { requestFocus } from '@app/directives/focus';

export interface ActorGetterForm {
	type: string;
	memberId: number;
	actorId: string;
	presetId: string;
	variable: { type: string; key: string };
}

interface ActorGetterTarget {
	// oxlint-disable-next-line no-explicit-any
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

// 表单真源在 `stores/getter-windows.ts`（原先是本文件的模块级 `reactive`）。
// 逐字段访问器 ⇒ `Object.assign(form, …)`、`const data = form` 与模板 v-model 都不用改。
const form: ActorGetterForm = {
	get type(): ActorGetterForm['type'] {
		return getGetterWindowsStore().actorGetterForm.type;
	},
	set type(value: ActorGetterForm['type']) {
		getGetterWindowsStore().actorGetterForm.type = value;
	},
	get memberId(): ActorGetterForm['memberId'] {
		return getGetterWindowsStore().actorGetterForm.memberId;
	},
	set memberId(value: ActorGetterForm['memberId']) {
		getGetterWindowsStore().actorGetterForm.memberId = value;
	},
	get actorId(): ActorGetterForm['actorId'] {
		return getGetterWindowsStore().actorGetterForm.actorId;
	},
	set actorId(value: ActorGetterForm['actorId']) {
		getGetterWindowsStore().actorGetterForm.actorId = value;
	},
	get presetId(): ActorGetterForm['presetId'] {
		return getGetterWindowsStore().actorGetterForm.presetId;
	},
	set presetId(value: ActorGetterForm['presetId']) {
		getGetterWindowsStore().actorGetterForm.presetId = value;
	},
	get variable(): ActorGetterForm['variable'] {
		return getGetterWindowsStore().actorGetterForm.variable;
	},
	set variable(value: ActorGetterForm['variable']) {
		getGetterWindowsStore().actorGetterForm.variable = value;
	}
};
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
	requestFocus('actorGetter-type');
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
				requestFocus('actorGetter-actorId');
				return;
			}
			getter = { type: data.type, actorId: data.actorId };
			break;
		case 'by-id':
			if (data.presetId === '') {
				requestFocus('actorGetter-presetId');
				return;
			}
			getter = { type: data.type, presetId: data.presetId };
			break;
		case 'variable':
			if (data.variable.key === '') {
				requestFocus('actorGetter-variable');
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
