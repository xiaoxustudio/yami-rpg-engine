import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.deleteObject = new CommandSchema({
	name: 'deleteObject',
	fields: [{ key: 'object', domId: 'object', default: { type: 'trigger' } }],
	customParse({ object }: { object: unknown }) {
		return [
			{ color: 'object' },
			{ text: t('command.deleteObject') + Token(': ') },
			{ text: Command.parseObject(object) }
		];
	}
});
