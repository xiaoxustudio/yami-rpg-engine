/* oxlint-disable eslint/no-restricted-properties */
import { getFocus } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { commit } from '@app/composables/useCommandSchema';
import { Enum } from '@app/enum/enum-window.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { reactive } from 'vue';

Command.cases.castSkill = new CommandSchema({
	name: 'castSkill',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'mode', default: 'by-key' },
		{ key: 'key', default: () => Enum.getDefStringId!('shortcut-key') },
		{ key: 'skillId', default: '' },
		{ key: 'skill', default: { type: 'trigger' } },
		{ key: 'keyVar', default: '' },
		{ key: 'wait', default: false }
	],
	customParse({
		actor,
		mode,
		key,
		skillId,
		skill,
		keyVar,
		wait
	}: {
		actor: unknown;
		mode: string;
		key: unknown;
		skillId: unknown;
		skill: unknown;
		keyVar: unknown;
		wait: unknown;
	}) {
		const words = Command.words.push(Command.parseActor!(actor));
		switch (mode) {
			case 'by-key':
				words.push(Command.parseGroupEnumString!('shortcut-key', key));
				break;
			case 'by-id':
				words.push(Command.parseFileName!(skillId));
				break;
			case 'by-skill':
				words.push(Command.parseSkill!(skill));
				break;
			case 'by-variable':
				words.push(Command.parseVariableString!(keyVar));
				break;
		}
		words.push(Command.parseWait!(wait));
		return [
			{ color: 'skill' },
			{ text: t('command.castSkill') + Token(': ') },
			{ text: words.join() }
		];
	}
});

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
	getFocus(document.getElementById('castSkill-actor'));
};

const save = (): void => {
	const actor = form.actor;
	const mode = form.mode;
	const wait = form.wait;
	switch (mode) {
		case 'by-key': {
			const key = form.key;
			if (key === '') {
				getFocus(document.getElementById('castSkill-key'));
				return;
			}
			commit({ actor, mode, key, wait });
			break;
		}
		case 'by-id': {
			const skillId = form.skillId;
			if (skillId === '') {
				getFocus(document.getElementById('castSkill-skillId'));
				return;
			}
			commit({ actor, mode, skillId, wait });
			break;
		}
		case 'by-skill':
			commit({ actor, mode, skill: form.skill, wait });
			break;
		case 'by-variable':
			commit({ actor, mode, keyVar: form.keyVar, wait });
			break;
	}
};

const schema = Command.cases.castSkill;
schema.customLoad = load;
schema.customSave = save;
schema.onInitialize = (): void => {};

export function useCastSkillCommandSchema() {
	return { form, load, save };
}
