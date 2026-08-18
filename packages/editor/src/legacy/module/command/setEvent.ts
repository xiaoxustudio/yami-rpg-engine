import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.setEvent = new CommandSchema({
	name: 'setEvent',
	fields: [
		{ key: 'operation', default: 'stop-propagation' },
		{ key: 'variable', default: { type: 'global', key: '' } },
		{ key: 'eventId', default: '' },
		{ key: 'choiceIndex', default: 0 }
	],
	customParse({
		operation,
		variable,
		eventId,
		choiceIndex
	}: {
		operation: string;
		variable: unknown;
		eventId: unknown;
		choiceIndex: unknown;
	}) {
		const words = Command.words.push(t('command.setEvent.' + operation));
		switch (operation) {
			case 'pause':
				words.push(Command.parseVariable!(variable, 'object', true));
				break;
			case 'continue':
				words.push(Command.parseVariable!(variable, 'object'));
				break;
			case 'enable':
			case 'disable':
			case 'highest-priority':
				words.push(Command.parseFileName!(eventId));
				break;
			case 'goto-choice-branch':
				words.push(Command.parseVariableNumber!(choiceIndex));
				break;
		}
		return [
			{ color: 'flow' },
			{ text: t('command.setEvent.alias') + Token(': ') },
			{ text: words.join() }
		];
	}
});
