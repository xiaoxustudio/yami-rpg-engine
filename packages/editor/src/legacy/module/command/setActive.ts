import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

type SetActiveData = {
	actor: unknown;
	active: boolean;
	[k: string]: unknown;
};

Command.cases.setActive = new CommandSchema({
	name: 'setActive',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'active', default: false }
	],
	customParse({ actor, active }: SetActiveData) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(t('command.setActive.active.' + active));
		return [
			{ color: 'actor' },
			{ text: t('command.setActive') + Token(': ') },
			{ text: words.join() }
		];
	}
});
