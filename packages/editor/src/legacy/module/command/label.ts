import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.label = new CommandSchema({
	name: 'label',
	fields: [{ key: 'name', domId: 'name', default: '', required: true, trim: true }],
	customParse({ name }: { name: string }) {
		return [
			{ color: 'flow' },
			{ text: t('command.label') + Token(': ') },
			{ color: 'label' },
			{ text: name }
		];
	}
});
