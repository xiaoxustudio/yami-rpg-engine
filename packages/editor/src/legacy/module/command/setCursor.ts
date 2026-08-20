import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.setCursor = new CommandSchema({
	name: 'setCursor',
	fields: [{ key: 'image', default: '' }],
	customParse({ image }: { image: unknown }) {
		return [
			{ color: 'system' },
			{ text: t('command.setCursor') + Token(': ') },
			{ text: Command.parseFileName(image) }
		];
	}
});
