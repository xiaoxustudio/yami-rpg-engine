import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.changeActorState = new CommandSchema({
	name: 'changeActorState',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'operation', default: 'add' },
		{ key: 'stateId', default: '' },
		{ key: 'state', default: { type: 'trigger' } }
	],
	parseOperation(operation: string) {
		return t('command.changeActorState.' + operation);
	},
	customParse({
		actor,
		operation,
		stateId,
		state
	}: {
		actor: unknown;
		operation: string;
		stateId: unknown;
		state: unknown;
	}) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(this.parseOperation!(operation));
		switch (operation) {
			case 'add':
			case 'remove':
				words.push(Command.parseFileName!(stateId));
				break;
			case 'remove-instance':
				words.push(Command.parseState!(state));
				break;
		}
		return [
			{ color: 'actor' },
			{ text: t('command.changeActorState') + Token(': ') },
			{ text: words.join() }
		];
	}
});
