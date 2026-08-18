import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.setElement = new CommandSchema({
	name: 'setElement',
	fields: [
		{ key: 'element', default: { type: 'trigger' } },
		{ key: 'operation', default: 'hide' }
	],
	customParse({ element, operation }: { element: unknown; operation: string }) {
		const words = Command.words
			.push(Command.parseElement!(element))
			.push(t('command.setElement.' + operation));
		return [
			{ color: 'element' },
			{ text: t('command.setElement.alias') + Token(': ') },
			{ text: words.join() }
		];
	}
});
