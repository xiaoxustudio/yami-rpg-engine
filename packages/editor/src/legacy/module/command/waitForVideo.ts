import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.waitForVideo = new CommandSchema({
	name: 'waitForVideo',
	fields: [{ key: 'element', domId: 'element', default: { type: 'trigger' } }],
	customParse({ element }: { element: unknown }) {
		return [
			{ color: 'element' },
			{ text: t('command.waitForVideo') + Token(': ') },
			{ text: Command.parseElement(element) }
		];
	}
});
