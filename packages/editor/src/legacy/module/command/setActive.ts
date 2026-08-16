import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

type SetActiveData = {
	actor: unknown;
	active: boolean;
	[k: string]: unknown;
};

Command.cases.setActive = new CommandSchema({
	name: 'setActive',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'active', default: false }
	],
	customParse({ actor, active }: SetActiveData) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(Local.get!('command.setActive.active.' + active));
		return [
			{ color: 'actor' },
			{ text: Local.get!('command.setActive') + Token(': ') },
			{ text: words.join() }
		];
	}
});
