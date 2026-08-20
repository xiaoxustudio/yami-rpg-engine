import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

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
		onLoad() {
			getFocus(document.getElementById('stopAudio-type')!);
		}
	});
}
