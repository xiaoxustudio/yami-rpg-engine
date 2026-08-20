import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.setTriggerMotion = new CommandSchema({
	name: 'setTriggerMotion',
	fields: [
		{ key: 'trigger', default: { type: 'trigger' } },
		{ key: 'motion', default: '', required: true }
	],
	customParse({ trigger, motion }: { trigger: unknown; motion: unknown }) {
		const words = Command.words
			.push(Command.parseTrigger(trigger))
			.push(Command.parseEnumString(motion));
		return [
			{ color: 'skill' },
			{ text: t('command.setTriggerMotion') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetTriggerMotionCommandSchema() {
	return useCommandSchema('setTriggerMotion', {
		onLoad() {
			getFocus(document.getElementById('setTriggerMotion-trigger'));
		}
	});
}
