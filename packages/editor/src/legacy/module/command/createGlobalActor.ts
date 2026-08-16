import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Data } from '@/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.createGlobalActor = new CommandSchema({
	name: 'createGlobalActor',
	fields: [
		{ key: 'actorId', default: '', required: true },
		{ key: 'teamId', default: () => Data.teams.list[0].id }
	],
	customParse({ actorId, teamId }: { actorId: unknown; teamId: unknown }) {
		const words = Command.words
			.push(Command.parseFileName!(actorId))
			.push(Command.parseTeam!(teamId));
		return [
			{ color: 'actor' },
			{ text: Local.get!('command.createGlobalActor') + Token(': ') },
			{ text: words.join() }
		];
	}
});
