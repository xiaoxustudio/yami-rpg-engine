/* oxlint-disable eslint/no-restricted-properties */
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.saveAudio = new CommandSchema({
	name: 'saveAudio',
	fields: [{ key: 'type', default: 'bgm' }],
	customParse({ type }: { type: unknown }) {
		return [
			{ color: 'audio' },
			{ text: t('command.saveAudio') + Token(': ') },
			{ text: Command.parseAudioType!(type) }
		];
	}
});

export function useSaveAudioCommandSchema() {
	return useCommandSchema('saveAudio', {
		onLoad() {
			getFocus(document.getElementById('saveAudio-type')!);
		}
	});
}
