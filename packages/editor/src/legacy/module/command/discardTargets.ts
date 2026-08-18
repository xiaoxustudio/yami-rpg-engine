import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.discardTargets = new CommandSchema({
	name: 'discardTargets',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'selector', default: 'any' },
		{ key: 'distance', default: 0 }
	],
	customParse({
		actor,
		selector,
		distance
	}: {
		actor: unknown;
		selector: unknown;
		distance: unknown;
	}) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(Command.parseActorSelector!(selector));
		if (distance !== 0) {
			words.push(Token('>=') + Command.parseVariableNumber!(distance, 't'));
		}
		return [
			{ color: 'actor' },
			{ text: t('command.discardTargets') + Token(': ') },
			{ text: words.join() }
		];
	}
});
