import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Data } from '@/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.createActor = new CommandSchema({
	name: 'createActor',
	fields: [
		{ key: 'actorId', default: '' },
		{ key: 'teamId', default: () => Data.teams.list[0].id },
		{ key: 'position', default: { type: 'absolute', x: 0, y: 0 } },
		{ key: 'angle', default: 0 }
	],
	customParse({
		actorId,
		teamId,
		position,
		angle
	}: {
		actorId: unknown;
		teamId: unknown;
		position: unknown;
		angle: unknown;
	}) {
		const words = Command.words
			.push(Command.parseFileName!(actorId))
			.push(Command.parseTeam!(teamId))
			.push(Command.parsePosition!(position))
			.push(Command.parseVariableNumber!(angle, '°'));
		return [
			{ color: 'actor' },
			{ text: Local.get!('command.createActor') + Token(': ') },
			{ text: words.join() }
		];
	}
});
