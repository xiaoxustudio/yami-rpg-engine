import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.setItem = new CommandSchema({
	name: 'setItem',
	fields: [
		{ key: 'item', default: { type: 'trigger' } },
		{ key: 'operation', default: 'increase' },
		{ key: 'quantity', default: 1 }
	],
	customParse({
		item,
		operation,
		quantity
	}: {
		item: unknown;
		operation: string;
		quantity: unknown;
	}) {
		const words = Command.words
			.push(Command.parseItem!(item))
			.push(t('command.setItem.' + operation));
		switch (operation) {
			case 'increase':
			case 'decrease':
				words.push(Command.parseVariableNumber!(quantity));
				break;
		}
		return [
			{ color: 'inventory' },
			{ text: t('command.setItem') + Token(': ') },
			{ text: words.join() }
		];
	}
});
