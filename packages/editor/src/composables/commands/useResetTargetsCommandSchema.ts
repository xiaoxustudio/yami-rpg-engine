/* oxlint-disable eslint/no-restricted-properties */
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

Command.cases.resetTargets = new CommandSchema({
	name: 'resetTargets',
	fields: [{ key: 'actor', domId: 'actor', default: { type: 'trigger' } }],
	customParse({ actor }: { actor: unknown }) {
		return [
			{ color: 'actor' },
			{ text: t('command.resetTargets') + Token(': ') },
			{ text: Command.parseActor(actor) }
		];
	}
});

export function useResetTargetsCommandSchema() {
	return useCommandSchema('resetTargets', {
		skipWrite: true,
		onLoad() {
			requestFocus('resetTargets-actor');
		}
	});
}
