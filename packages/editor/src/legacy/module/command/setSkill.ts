import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

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
			.push(Local.get!('command.setSkill.' + operation));
		switch (operation) {
			case 'set-cooldown':
			case 'increase-cooldown':
			case 'decrease-cooldown':
				words.push(Command.parseVariableNumber!(cooldown, 'ms'));
				break;
		}
		return [
			{ color: 'skill' },
			{ text: Local.get!('command.setSkill') + Token(': ') },
			{ text: words.join() }
		];
	}
});
