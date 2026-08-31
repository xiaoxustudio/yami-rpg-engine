/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { Data } from '@app/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.setVolume = new CommandSchema({
	name: 'setVolume',
	fields: [
		{ key: 'type', default: 'bgm' },
		{ key: 'volume', default: 1 },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	customParse({
		type,
		volume,
		easingId,
		duration,
		wait
	}: {
		type: unknown;
		volume: unknown;
		easingId: unknown;
		duration: unknown;
		wait: unknown;
	}) {
		const words = Command.words
			.push(Command.parseAudioType!(type))
			.push(Command.parseVariableNumber!(volume))
			.push(Command.parseEasing!(easingId, duration, wait));
		return [
			{ color: 'audio' },
			{ text: t('command.setVolume') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetVolumeCommandSchema() {
	return useCommandSchema('setVolume', {
		onLoad() {
			getFocus(document.getElementById('setVolume-type'));
		}
	});
}
