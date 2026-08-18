import '@app/legacy/module/command/castSkill.ts';
import { getFocus, read, write } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { Enum } from '@app/legacy/enum/enum-window.ts';
import { reactive } from 'vue';

const form = reactive<Record<string, unknown>>({});

const createDefault = (): Record<string, unknown> => {
	const data: Record<string, unknown> = {};
	for (const field of Command.cases.castSkill.fields) {
		const value = typeof field.default === 'function' ? field.default() : field.default;
		if (value !== undefined) {
			data[field.key] = value;
		}
	}
	return data;
};

const load = (params: Record<string, unknown> = {}): void => {
	document.getElementById('castSkill-key')?.loadItems?.(Enum.getStringItems!('shortcut-key'));
	Object.assign(form, createDefault(), params);
	write(document.getElementById('castSkill-actor'), form.actor);
	write(document.getElementById('castSkill-mode'), form.mode);
	write(document.getElementById('castSkill-key'), form.key);
	write(document.getElementById('castSkill-keyVar'), form.keyVar);
	write(document.getElementById('castSkill-skillId'), form.skillId);
	write(document.getElementById('castSkill-skill'), form.skill);
	write(document.getElementById('castSkill-wait'), form.wait);
	getFocus(document.getElementById('castSkill-actor'));
};

const save = (): void => {
	const actor = read(document.getElementById('castSkill-actor')) ?? form.actor;
	const mode = read(document.getElementById('castSkill-mode')) ?? form.mode;
	const wait = read(document.getElementById('castSkill-wait')) ?? form.wait;
	switch (mode) {
		case 'by-key': {
			const key = read(document.getElementById('castSkill-key')) ?? form.key;
			if (key === '') {
				getFocus(document.getElementById('castSkill-key'));
				return;
			}
			Command.save?.({ actor, mode, key, wait });
			break;
		}
		case 'by-id': {
			const skillId = read(document.getElementById('castSkill-skillId')) ?? form.skillId;
			if (skillId === '') {
				getFocus(document.getElementById('castSkill-skillId'));
				return;
			}
			Command.save?.({ actor, mode, skillId, wait });
			break;
		}
		case 'by-skill':
			Command.save?.({
				actor,
				mode,
				skill: read(document.getElementById('castSkill-skill')) ?? form.skill,
				wait
			});
			break;
		case 'by-variable':
			Command.save?.({
				actor,
				mode,
				keyVar: read(document.getElementById('castSkill-keyVar')) ?? form.keyVar,
				wait
			});
			break;
	}
};

const schema = Command.cases.castSkill;
schema.customLoad = load;
schema.customSave = save;
schema.onInitialize = (): void => {};

export function useCastSkillCommandSchema() {
	return { load, save };
}
