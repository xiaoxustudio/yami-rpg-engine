import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setPartyMember = new CommandSchema({
	name: 'setPartyMember',
	fields: [
		{ key: 'operation', default: 'add' },
		{ key: 'actor', default: { type: 'trigger' } }
	],
	customParse({ operation, actor }: { operation: string; actor: unknown }) {
		const words = Command.words
			.push(Local.get!('command.setPartyMember.' + operation))
			.push(Command.parseActor!(actor));
		return [
			{ color: 'actor' },
			{ text: Local.get!('command.setPartyMember') + Token(': ') },
			{ text: words.join() }
		];
	}
});
