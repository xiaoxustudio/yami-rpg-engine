import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { Data } from '@app/legacy/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

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
			{ text: t('command.createActor') + Token(': ') },
			{ text: words.join() }
		];
	}
});
