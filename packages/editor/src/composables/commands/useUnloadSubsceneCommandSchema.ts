/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string) => getYamiI18n().global.t(key);
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

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
		onLoad() {
			getFocus(document.getElementById('unloadSubscene-sceneId'));
		}
	});
}
