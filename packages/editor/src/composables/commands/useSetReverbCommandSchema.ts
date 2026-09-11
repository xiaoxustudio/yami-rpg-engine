import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { Data } from '@app/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { requestFocus } from '@app/directives/focus';

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
		skipWrite: true,
		onLoad() {
			requestFocus('setReverb-type');
		}
	});
}
