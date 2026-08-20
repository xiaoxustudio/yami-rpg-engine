import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.changeActorSkill = new CommandSchema({
	name: 'changeActorSkill',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'operation', default: 'add' },
		{ key: 'skillId', default: '' },
		{ key: 'skill', default: { type: 'trigger' } }
	],
	parseOperation(operation: string) {
		return t('command.changeActorSkill.' + operation);
	},
	customParse({
		actor,
		operation,
		skill,
		skillId
	}: {
		actor: unknown;
		operation: string;
		skill: unknown;
		skillId: unknown;
	}) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(this.parseOperation!(operation));
		switch (operation) {
			case 'add':
			case 'remove':
				words.push(Command.parseVariableFile!(skillId));
				break;
			case 'remove-instance':
				words.push(Command.parseSkill!(skill));
				break;
		}
		return [
			{ color: 'actor' },
			{ text: t('command.changeActorSkill') + Token(': ') },
			{ text: words.join() }
		];
	}
});
