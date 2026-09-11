import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { requestFocus } from '@app/directives/focus';

Command.cases.setSkill = new CommandSchema({
	name: 'setSkill',
	fields: [
		{ key: 'skill', default: { type: 'trigger' } },
		{ key: 'operation', default: 'set-cooldown' },
		{ key: 'cooldown', default: 0 }
	],
	customParse({
		skill,
		operation,
		cooldown
	}: {
		skill: unknown;
		operation: string;
		cooldown: unknown;
	}) {
		const words = Command.words
			.push(Command.parseSkill!(skill))
			.push(t('command.setSkill.' + operation));
		switch (operation) {
			case 'set-cooldown':
			case 'increase-cooldown':
			case 'decrease-cooldown':
				words.push(Command.parseVariableNumber!(cooldown, 'ms'));
				break;
		}
		return [
			{ color: 'skill' },
			{ text: t('command.setSkill') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetSkillCommandSchema() {
	const { form, load, commit } = useCommandSchema('setSkill', {
		skipWrite: true,
		onLoad() {
			requestFocus('setSkill-skill');
		}
	});
	const onSave = (): void => {
		const skill = form.skill;
		const operation = form.operation;
		switch (operation) {
			case 'set-cooldown':
			case 'increase-cooldown':
			case 'decrease-cooldown': {
				commit({ skill, operation, cooldown: form.cooldown });
				break;
			}
		}
	};
	Command.cases.setSkill.customSave = onSave;
	return { form, save: onSave, load };
}
