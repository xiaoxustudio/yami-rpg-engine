import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.simulateKey = new CommandSchema({
	name: 'simulateKey',
	fields: [
		{ key: 'operation', default: 'click' },
		{ key: 'keycode', default: '' }
	],
	customParse({ operation, keycode }: { operation: string; keycode: unknown }) {
		const words = Command.words
			.push(t('command.simulateKey.' + operation))
			.push(Command.setStringColor!(keycode));
		return [
			{ color: 'system' },
			{ text: t('command.simulateKey') + Token(': ') },
			{ text: words.join() }
		];
	}
});
