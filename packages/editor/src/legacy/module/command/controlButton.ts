import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.controlButton = new CommandSchema({
	name: 'controlButton',
	fields: [
		{ key: 'operation', default: 'select-default' },
		{ key: 'element', default: { type: 'trigger' } }
	],
	customParse({ operation, element }: { operation: string; element: unknown }) {
		const words = Command.words.push(t('command.controlButton.' + operation));
		switch (operation) {
			case 'select':
			case 'hover-mode':
			case 'active-mode':
			case 'normal-mode':
				words.push(Command.parseElement!(element));
				break;
		}
		return [
			{ color: 'element' },
			{ text: t('command.controlButton') + Token(': ') },
			{ text: words.join() }
		];
	}
});
