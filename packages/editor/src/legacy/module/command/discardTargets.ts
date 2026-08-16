import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.discardTargets = new CommandSchema({
	name: 'discardTargets',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'selector', default: 'any' },
		{ key: 'distance', default: 0 }
	],
	customParse({
		actor,
		selector,
		distance
	}: {
		actor: unknown;
		selector: unknown;
		distance: unknown;
	}) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(Command.parseActorSelector!(selector));
		if (distance !== 0) {
			words.push(Token('>=') + Command.parseVariableNumber!(distance, 't'));
		}
		return [
			{ color: 'actor' },
			{ text: Local.get!('command.discardTargets') + Token(': ') },
			{ text: words.join() }
		];
	}
});
