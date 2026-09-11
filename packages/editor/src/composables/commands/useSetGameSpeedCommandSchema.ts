import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { Data } from '@app/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { requestFocus } from '@app/directives/focus';

Command.cases.setGameSpeed = new CommandSchema({
	name: 'setGameSpeed',
	fields: [
		{ key: 'speed', default: 1 },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	customParse({
		speed,
		easingId,
		duration,
		wait
	}: {
		speed: unknown;
		easingId: unknown;
		duration: unknown;
		wait: unknown;
	}) {
		const words = Command.words
			.push(Command.parseVariableNumber!(speed))
			.push(Command.parseEasing!(easingId, duration, wait));
		return [
			{ color: 'system' },
			{ text: t('command.setGameSpeed') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetGameSpeedCommandSchema() {
	return useCommandSchema('setGameSpeed', {
		skipWrite: true,
		onLoad() {
			requestFocus('setGameSpeed-speed', 'all');
		}
	});
}
