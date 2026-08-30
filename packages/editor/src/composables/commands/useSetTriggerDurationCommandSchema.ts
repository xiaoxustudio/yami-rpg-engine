/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string) => getYamiI18n().global.t(key);
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.setTriggerDuration = new CommandSchema({
	name: 'setTriggerDuration',
	fields: [
		{ key: 'trigger', default: { type: 'trigger' } },
		{ key: 'operation', default: 'set' },
		{ key: 'duration', default: 0 }
	],
	customParse({
		trigger,
		operation,
		duration
	}: {
		trigger: unknown;
		operation: string;
		duration: unknown;
	}) {
		const words = Command.words
			.push(Command.parseTrigger!(trigger))
			.push(t('command.setTriggerDuration.' + operation))
			.push(Command.parseVariableNumber!(duration, 'ms'));
		return [
			{ color: 'skill' },
			{ text: t('command.setTriggerDuration') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetTriggerDurationCommandSchema() {
	return useCommandSchema('setTriggerDuration', {
		onLoad() {
			getFocus(document.getElementById('setTriggerDuration-trigger'));
		}
	});
}
