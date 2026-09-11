import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { requestFocus } from '@app/directives/focus';

Command.cases.setTriggerAngle = new CommandSchema({
	name: 'setTriggerAngle',
	fields: [
		{ key: 'trigger', default: { type: 'trigger' } },
		{ key: 'angle', default: { type: 'absolute', degrees: 0 } }
	],
	customParse({ trigger, angle }: { trigger: unknown; angle: unknown }) {
		const words = Command.words
			.push(Command.parseTrigger(trigger))
			.push(Command.parseAngle(angle));
		return [
			{ color: 'skill' },
			{ text: t('command.setTriggerAngle') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetTriggerAngleCommandSchema() {
	return useCommandSchema('setTriggerAngle', {
		skipWrite: true,
		onLoad() {
			requestFocus('setTriggerAngle-trigger');
		}
	});
}
