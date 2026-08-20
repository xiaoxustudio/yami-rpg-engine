import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.setPartyMember = new CommandSchema({
	name: 'setPartyMember',
	fields: [
		{ key: 'operation', default: 'add' },
		{ key: 'actor', default: { type: 'trigger' } }
	],
	customParse({ operation, actor }: { operation: string; actor: unknown }) {
		const words = Command.words
			.push(t('command.setPartyMember.' + operation))
			.push(Command.parseActor!(actor));
		return [
			{ color: 'actor' },
			{ text: t('command.setPartyMember') + Token(': ') },
			{ text: words.join() }
		];
	}
});
