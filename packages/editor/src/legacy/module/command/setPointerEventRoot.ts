import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.setPointerEventRoot = new CommandSchema({
	name: 'setPointerEventRoot',
	fields: [
		{ key: 'operation', default: 'add' },
		{ key: 'element', default: { type: 'trigger' } }
	],
	customParse({ operation, element }: { operation: string; element: unknown }) {
		if (operation === 'set') {
			operation = 'add';
		}
		const words = Command.words.push(t('command.setPointerEventRoot.' + operation));
		switch (operation) {
			case 'add':
			case 'remove':
				words.push(Command.parseElement!(element));
				break;
		}
		return [
			{ color: 'element' },
			{ text: t('command.setPointerEventRoot') + Token(': ') },
			{ text: words.join() }
		];
	}
});
