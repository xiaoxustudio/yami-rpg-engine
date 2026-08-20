import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

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
