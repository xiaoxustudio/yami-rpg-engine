import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { Data } from '@app/legacy/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.changeActorTeam = new CommandSchema({
	name: 'changeActorTeam',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'teamId', default: () => Data.teams.list[0].id }
	],
	customParse({ actor, teamId }: { actor: unknown; teamId: unknown }) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(Command.parseTeam!(teamId));
		return [
			{ color: 'actor' },
			{ text: t('command.changeActorTeam') + Token(': ') },
			{ text: words.join() }
		];
	}
});
