import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

type FixAngleData = {
	actor: unknown;
	fixed: unknown;
	[k: string]: unknown;
};

Command.cases.fixAngle = new CommandSchema({
	name: 'fixAngle',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'fixed', default: true }
	],
	customParse({ actor, fixed }: FixAngleData) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(t('command.fixAngle.fixed.' + fixed));
		return [
			{ color: 'actor' },
			{ text: t('command.fixAngle') + Token(': ') },
			{ text: words.join() }
		];
	}
});
