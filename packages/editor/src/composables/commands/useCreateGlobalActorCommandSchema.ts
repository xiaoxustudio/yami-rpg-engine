/* oxlint-disable eslint/no-restricted-properties */
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { Data } from '@app/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

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
			{ text: t('command.createGlobalActor') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useCreateGlobalActorCommandSchema() {
	return useCommandSchema('createGlobalActor', {
		skipWrite: true,
		onLoad() {
			requestFocus('createGlobalActor-actorId');
		}
	});
}
