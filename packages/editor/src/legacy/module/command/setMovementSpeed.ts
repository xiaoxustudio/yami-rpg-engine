import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.setMovementSpeed = new CommandSchema({
	name: 'setMovementSpeed',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'property', default: 'base' },
		{ key: 'base', default: 0 },
		{ key: 'factor', default: 0 }
	],
	customParse({
		actor,
		property,
		base,
		factor
	}: {
		actor: unknown;
		property: string;
		base: unknown;
		factor: unknown;
	}) {
		const label = t('command.setMovementSpeed.' + property);
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(label.replace('(', Token('(')).replace(')', Token(')')));
		switch (property) {
			case 'base':
				words.push(Command.parseVariableNumber!(base, 't/s'));
				break;
			case 'factor':
			case 'factor-temp':
				words.push(Command.parseVariableNumber!(factor));
				break;
		}
		return [
			{ color: 'actor' },
			{ text: t('command.setMovementSpeed') + Token(': ') },
			{ text: words.join() }
		];
	}
});
