/* oxlint-disable eslint/no-restricted-properties */
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { Data } from '@app/data/data-object.ts';
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

export function useCreateActorCommandSchema() {
	const { form, load, commit } = useCommandSchema('createActor', {
		onLoad() {
			getFocus(document.getElementById('createActor-actorId')!, 'all');
		}
	});
	const onSave = (): void => {
		const actorId = read(document.getElementById('createActor-actorId')!) ?? form.actorId;
		if (actorId === '') {
			getFocus(document.getElementById('createActor-actorId')!);
			return;
		}
		commit({
			actorId,
			teamId: read(document.getElementById('createActor-teamId')!) ?? form.teamId,
			position: read(document.getElementById('createActor-position')!) ?? form.position,
			angle: read(document.getElementById('createActor-angle')!) ?? form.angle
		});
	};
	Command.cases.createActor.customSave = onSave;
	return { form, save: onSave, load };
}
