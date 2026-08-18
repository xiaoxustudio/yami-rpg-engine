import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

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
