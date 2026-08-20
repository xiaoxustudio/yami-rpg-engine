import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

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
		onLoad() {
			getFocus(document.getElementById('setTriggerAngle-trigger'));
		}
	});
}
