import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.changePassableTerrain = new CommandSchema({
	name: 'changePassableTerrain',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'passage', default: 'land' }
	],
	customParse({ actor, passage }: { actor: unknown; passage: string }) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(t('command.changePassableTerrain.' + passage));
		return [
			{ color: 'actor' },
			{ text: t('command.changePassableTerrain') + Token(': ') },
			{ text: words.join() }
		];
	}
});
