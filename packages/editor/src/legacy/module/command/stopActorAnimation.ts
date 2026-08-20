import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.stopActorAnimation = new CommandSchema({
	name: 'stopActorAnimation',
	fields: [{ key: 'actor', default: { type: 'trigger' } }],
	customParse({ actor }: { actor: unknown }) {
		return [
			{ color: 'actor' },
			{ text: t('command.stopActorAnimation') + Token(': ') },
			{ text: Command.parseActor(actor) }
		];
	}
});
