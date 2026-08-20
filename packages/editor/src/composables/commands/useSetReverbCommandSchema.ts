import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { Data } from '@app/legacy/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.setReverb = new CommandSchema({
	name: 'setReverb',
	fields: [
		{ key: 'type', default: 'bgm' },
		{ key: 'dry', default: 1 },
		{ key: 'wet', default: 0 },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	customParse({
		type,
		dry,
		wet,
		easingId,
		duration,
		wait
	}: {
		type: unknown;
		dry: unknown;
		wet: unknown;
		easingId: unknown;
		duration: unknown;
		wait: unknown;
	}) {
		const words = Command.words
			.push(Command.parseAudioType!(type))
			.push(Command.parseVariableNumber!(dry))
			.push(Command.parseVariableNumber!(wet))
			.push(Command.parseEasing!(easingId, duration, wait));
		return [
			{ color: 'audio' },
			{ text: t('command.setReverb') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetReverbCommandSchema() {
	return useCommandSchema('setReverb', {
		onLoad() {
			getFocus(document.getElementById('setReverb-type'));
		}
	});
}
