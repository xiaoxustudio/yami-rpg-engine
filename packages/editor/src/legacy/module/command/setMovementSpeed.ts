import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setMovementSpeed = new CommandSchema({
	name: 'setMovementSpeed',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'property', default: 'base' },
		{ key: 'base', default: 0 },
		{ key: 'factor', default: 0 }
	],
	customParse({
		actor,
		property,
		base,
		factor
	}: {
		actor: unknown;
		property: string;
		base: unknown;
		factor: unknown;
	}) {
		const label = Local.get!('command.setMovementSpeed.' + property);
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(label.replace('(', Token('(')).replace(')', Token(')')));
		switch (property) {
			case 'base':
				words.push(Command.parseVariableNumber!(base, 't/s'));
				break;
			case 'factor':
			case 'factor-temp':
				words.push(Command.parseVariableNumber!(factor));
				break;
		}
		return [
			{ color: 'actor' },
			{ text: Local.get!('command.setMovementSpeed') + Token(': ') },
			{ text: words.join() }
		];
	}
});
