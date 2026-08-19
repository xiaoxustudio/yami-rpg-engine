import { reactive } from 'vue';
import { Window } from '@app/legacy/tools/window-object.ts';
import { getFocus } from '@app/utils/element-utils';

export interface SkillGetterForm {
	type: string;
	actor: { type: string };
	key: string;
	skillId: string;
	variable: { type: string; key: string };
}

interface SkillGetterTarget {
	read?: () => any;
	input: (getter: Record<string, unknown>) => void;
	isPluginInput?: boolean;
}

interface SkillGetterWindow {
	form: SkillGetterForm;
	open: (target: SkillGetterTarget, defaults?: Partial<SkillGetterForm>) => void;
	confirm: () => void;
	onWindowClosed: () => void;
}

type SkillGetterFrame = HTMLElement & {
	setForm?: (data: Partial<SkillGetterForm>) => void;
	getForm?: () => SkillGetterForm;
};

const form = reactive<SkillGetterForm>({
	type: 'trigger',
	actor: { type: 'trigger' },
	key: '',
	skillId: '',
	variable: { type: 'local', key: '' }
});
let callback: ((getter: Record<string, unknown>) => void) | null = null;
let pluginInput = false;

const getFrame = (): SkillGetterFrame | null =>
	document.getElementById('skillGetter') as SkillGetterFrame | null;

const open = (target: SkillGetterTarget, defaults?: Partial<SkillGetterForm>): void => {
	callback = (getter: Record<string, unknown>) => target.input(getter);
	pluginInput = target.isPluginInput === true;
	Window.open!('skillGetter');

	let actor = { type: 'trigger' };
	let key = defaults?.key ?? '';
	let skillId = '';
	let variable = { type: 'local', key: '' };
	const skill = target.read?.() ?? {};
	switch (skill.type) {
		case 'by-key':
			actor = skill.actor;
			key = skill.key;
			break;
		case 'by-id':
			actor = skill.actor;
			skillId = skill.skillId;
			break;
		case 'variable':
			variable = skill.variable;
			break;
	}
	Object.assign(form, { type: skill.type, actor, key, skillId, variable });
	getFrame()?.setForm?.(form);
	getFocus(document.getElementById('skillGetter-type'));
};

const confirm = (): void => {
	const data = getFrame()?.getForm?.() ?? form;
	let getter: Record<string, unknown> | undefined;
	switch (data.type) {
		case 'trigger':
		case 'latest':
			getter = { type: data.type };
			break;
		case 'by-key': {
			const actor = data.actor;
			const key = data.key;
			if (key === '') {
				getFocus(document.getElementById('skillGetter-key'));
				return;
			}
			getter = { type: data.type, actor, key };
			break;
		}
		case 'by-id': {
			const actor = data.actor;
			const skillId = data.skillId;
			if (skillId === '') {
				getFocus(document.getElementById('skillGetter-skillId'));
				return;
			}
			getter = { type: data.type, actor, skillId };
			break;
		}
		case 'variable':
			if (data.variable.key === '') {
				getFocus(document.getElementById('skillGetter-variable'));
				return;
			}
			getter = { type: data.type, variable: data.variable };
			break;
	}
	if (pluginInput) {
		getter = { getter: 'skill', ...getter };
	}
	callback?.(getter!);
	Window.close!('skillGetter');
};

const onWindowClosed = (): void => {
	callback = null;
};

export function useSkillGetterWindow(): SkillGetterWindow {
	return { form, open, confirm, onWindowClosed };
}
