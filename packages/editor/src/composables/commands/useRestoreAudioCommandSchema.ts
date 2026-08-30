/* oxlint-disable eslint/no-restricted-properties */
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string) => getYamiI18n().global.t(key);

Command.cases.restoreAudio = new CommandSchema({
	name: 'restoreAudio',
	fields: [{ key: 'type', default: 'bgm' }],
	customParse({ type }: { type: unknown }) {
		return [
			{ color: 'audio' },
			{ text: t('command.restoreAudio') + Token(': ') },
			{ text: Command.parseAudioType!(type) }
		];
	}
});

export function useRestoreAudioCommandSchema() {
	return useCommandSchema('restoreAudio', {
		onLoad() {
			getFocus(document.getElementById('restoreAudio-type')!);
		}
	});
}
