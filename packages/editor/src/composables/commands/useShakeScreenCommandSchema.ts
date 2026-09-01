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

Command.cases.shakeScreen = new CommandSchema({
	name: 'shakeScreen',
	fields: [
		{ key: 'mode', default: 'random' },
		{ key: 'power', default: 5 },
		{ key: 'speed', default: 10 },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 200 },
		{ key: 'wait', default: false }
	],
	customParse({
		mode,
		power,
		speed,
		easingId,
		duration,
		wait
	}: {
		mode: string;
		power: unknown;
		speed: unknown;
		easingId: unknown;
		duration: unknown;
		wait: unknown;
	}) {
		const words = Command.words
			.push(t('command.shakeScreen.' + mode))
			.push(Command.setNumberColor!(power))
			.push(Command.setNumberColor!(speed))
			.push(Command.parseEasing!(easingId, duration, wait));
		return [
			{ color: 'scene' },
			{ text: t('command.shakeScreen') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useShakeScreenCommandSchema() {
	return useCommandSchema('shakeScreen', {
		skipWrite: true,
		onLoad() {
			requestFocus('shakeScreen-mode');
		}
	});
}
