import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

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
