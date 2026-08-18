import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.setFocus = new CommandSchema({
	name: 'setFocus',
	fields: [
		{ key: 'operation', default: 'add' },
		{ key: 'element', default: { type: 'trigger' } },
		{ key: 'mode', default: 'control-child-buttons' },
		{ key: 'cancelable', default: true }
	],
	customParse({
		operation,
		element,
		mode,
		cancelable
	}: {
		operation: string;
		element: unknown;
		mode: string;
		cancelable: unknown;
	}) {
		const words = Command.words.push(t('command.setFocus.' + operation));
		switch (operation) {
			case 'add':
				if (mode === undefined) {
					mode = 'control-child-buttons';
				}
				words.push(Command.parseElement!(element));
				words.push(t('command.setFocus.' + mode));
				if (cancelable) {
					words.push(t('command.setFocus.cancelable'));
				}
				break;
			case 'remove':
				words.push(Command.parseElement!(element));
				break;
		}
		return [
			{ color: 'element' },
			{ text: t('command.setFocus') + Token(': ') },
			{ text: words.join() }
		];
	}
});
