import { getGetterWindowsStore } from '@app/stores/getter-windows';
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

// 表单真源在 `stores/getter-windows.ts`（原先是本文件的模块级 `reactive`）。
// 逐字段访问器 ⇒ `Object.assign(form, …)`、`const data = form` 与模板 v-model 都不用改。
const form: SkillGetterForm = {
	get type(): SkillGetterForm['type'] {
		return getGetterWindowsStore().skillGetterForm.type;
	},
	set type(value: SkillGetterForm['type']) {
		getGetterWindowsStore().skillGetterForm.type = value;
	},
	get actor(): SkillGetterForm['actor'] {
		return getGetterWindowsStore().skillGetterForm.actor;
	},
	set actor(value: SkillGetterForm['actor']) {
		getGetterWindowsStore().skillGetterForm.actor = value;
	},
	get key(): SkillGetterForm['key'] {
		return getGetterWindowsStore().skillGetterForm.key;
	},
	set key(value: SkillGetterForm['key']) {
		getGetterWindowsStore().skillGetterForm.key = value;
	},
	get skillId(): SkillGetterForm['skillId'] {
		return getGetterWindowsStore().skillGetterForm.skillId;
	},
	set skillId(value: SkillGetterForm['skillId']) {
		getGetterWindowsStore().skillGetterForm.skillId = value;
	},
	get variable(): SkillGetterForm['variable'] {
		return getGetterWindowsStore().skillGetterForm.variable;
	},
	set variable(value: SkillGetterForm['variable']) {
		getGetterWindowsStore().skillGetterForm.variable = value;
	}
};
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
