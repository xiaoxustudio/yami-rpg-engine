/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { requestFocus } from '@app/directives/focus';

Command.cases.stopAudio = new CommandSchema({
	name: 'stopAudio',
	fields: [{ key: 'type', default: 'bgm' }],
	customParse({ type }: { type: unknown }) {
		const words = Command.words.push(Command.parseAudioType!(type));
		return [
			{ color: 'audio' },
			{ text: t('command.stopAudio') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useStopAudioCommandSchema() {
	return useCommandSchema('stopAudio', {
		skipWrite: true,
		onLoad() {
			requestFocus('stopAudio-type');
		}
	});
}
