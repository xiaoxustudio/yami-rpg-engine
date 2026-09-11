import { reactive } from 'vue';
import { getWindowStore } from '@app/stores/window';
import { requestFocus } from '@app/directives/focus';

export interface SkillGetterForm {
	type: string;
	actor: { type: string };
	key: string;
	skillId: string;
	variable: { type: string; key: string };
}

interface SkillGetterTarget {
	// oxlint-disable-next-line no-explicit-any
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

const form = reactive<SkillGetterForm>({
	type: 'trigger',
	actor: { type: 'trigger' },
	key: '',
	skillId: '',
	variable: { type: 'local', key: '' }
});
let callback: ((getter: Record<string, unknown>) => void) | null = null;
let pluginInput = false;

const open = (target: SkillGetterTarget, defaults?: Partial<SkillGetterForm>): void => {
	callback = (getter: Record<string, unknown>) => target.input(getter);
	pluginInput = target.isPluginInput === true;
	getWindowStore().open('skillGetter');

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
	requestFocus('skillGetter-type');
};

const confirm = (): void => {
	const data = form;
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
				requestFocus('skillGetter-key');
				return;
			}
			getter = { type: data.type, actor, key };
			break;
		}
		case 'by-id': {
			const actor = data.actor;
			const skillId = data.skillId;
			if (skillId === '') {
				requestFocus('skillGetter-skillId');
				return;
			}
			getter = { type: data.type, actor, skillId };
			break;
		}
		case 'variable':
			if (data.variable.key === '') {
				requestFocus('skillGetter-variable');
				return;
			}
			getter = { type: data.type, variable: data.variable };
			break;
	}
	if (pluginInput) {
		getter = { getter: 'skill', ...getter };
	}
	callback?.(getter!);
	getWindowStore().close('skillGetter');
};

const onWindowClosed = (): void => {
	callback = null;
};

export function useSkillGetterWindow(): SkillGetterWindow {
	return { form, open, confirm, onWindowClosed };
}
