/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { requestFocus } from '@app/directives/focus';

Command.cases.unloadSubscene = new CommandSchema({
	name: 'unloadSubscene',
	fields: [{ key: 'sceneId', default: '', required: true }],
	customParse({ sceneId }: { sceneId: unknown }) {
		return [
			{ color: 'scene' },
			{ text: t('command.unloadSubscene') + Token(': ') },
			{ text: Command.parseVariableFile(sceneId) }
		];
	}
});

export function useUnloadSubsceneCommandSchema() {
	return useCommandSchema('unloadSubscene', {
		skipWrite: true,
		onLoad() {
			requestFocus('unloadSubscene-sceneId');
		}
	});
}
