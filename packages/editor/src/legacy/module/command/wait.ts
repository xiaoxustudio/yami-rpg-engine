import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.wait = new CommandSchema({
	name: 'wait',
	fields: [{ key: 'duration', domId: 'duration', default: 1 }],
	customParse({ duration }: { duration: unknown }) {
		return [
			{ color: 'wait' },
			{ text: t('command.wait') + Token(': ') },
			{ text: Command.parseVariableNumber(duration, 'ms') }
		];
	}
});
