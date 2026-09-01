/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { Data } from '@app/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

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
		skipWrite: true,
		onLoad() {
			requestFocus('createActor-actorId', 'all');
		}
	});
	const onSave = (): void => {
		const actorId = form.actorId as string;
		if (actorId === '') {
			requestFocus('createActor-actorId');
			return;
		}
		commit({
			actorId,
			teamId: form.teamId,
			position: form.position,
			angle: form.angle
		});
	};
	Command.cases.createActor.customSave = onSave;
	return { form, save: onSave, load };
}
