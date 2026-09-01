/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { Data } from '@app/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { requestFocus } from '@app/directives/focus';

Command.cases.setPan = new CommandSchema({
	name: 'setPan',
	fields: [
		{ key: 'type', default: 'bgm' },
		{ key: 'pan', default: 0 },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	customParse({
		type,
		pan,
		easingId,
		duration,
		wait
	}: {
		type: unknown;
		pan: unknown;
		easingId: unknown;
		duration: unknown;
		wait: unknown;
	}) {
		const words = Command.words
			.push(Command.parseAudioType!(type))
			.push(Command.parseVariableNumber!(pan))
			.push(Command.parseEasing!(easingId, duration, wait));
		return [
			{ color: 'audio' },
			{ text: t('command.setPan') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetPanCommandSchema() {
	return useCommandSchema('setPan', {
		skipWrite: true,
		onLoad() {
			requestFocus('setPan-type');
		}
	});
}
