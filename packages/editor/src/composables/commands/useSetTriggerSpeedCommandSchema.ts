import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { requestFocus } from '@app/directives/focus';

Command.cases.setTriggerSpeed = new CommandSchema({
	name: 'setTriggerSpeed',
	fields: [
		{ key: 'trigger', default: { type: 'trigger' } },
		{ key: 'speed', default: 0 }
	],
	customParse({ trigger, speed }: { trigger: unknown; speed: unknown }) {
		const words = Command.words
			.push(Command.parseTrigger(trigger))
			.push(Command.parseVariableNumber(speed, 't/s'));
		return [
			{ color: 'skill' },
			{ text: t('command.setTriggerSpeed') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetTriggerSpeedCommandSchema() {
	return useCommandSchema('setTriggerSpeed', {
		skipWrite: true,
		onLoad() {
			requestFocus('setTriggerSpeed-trigger');
		}
	});
}
