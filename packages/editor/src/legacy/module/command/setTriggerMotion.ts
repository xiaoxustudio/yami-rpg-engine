import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

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
