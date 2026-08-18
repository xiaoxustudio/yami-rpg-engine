import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

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
