import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { Enum } from '@app/legacy/enum/enum-window.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.setCooldown = new CommandSchema({
	name: 'setCooldown',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'operation', default: 'set' },
		{
			key: 'key',
			default: () => Enum.getDefStringId!('cooldown-key'),
			required: true
		},
		{ key: 'cooldown', default: 0 }
	],
	customParse({
		actor,
		operation,
		key,
		cooldown
	}: {
		actor: unknown;
		operation: string;
		key: unknown;
		cooldown: unknown;
	}) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(t('command.setCooldown.' + operation))
			.push(Command.parseVariableEnum!('cooldown-key', key))
			.push(Command.parseVariableNumber!(cooldown, 'ms'));
		return [
			{ color: 'inventory' },
			{ text: t('command.setCooldown') + Token(': ') },
			{ text: words.join() }
		];
	}
});
