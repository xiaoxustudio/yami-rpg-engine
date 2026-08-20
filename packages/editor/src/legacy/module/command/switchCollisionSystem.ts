import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.switchCollisionSystem = new CommandSchema({
	name: 'switchCollisionSystem',
	fields: [{ key: 'operation', default: 'enable-actor-collision' }],
	customParse({ operation }: { operation: string }) {
		return [
			{ color: 'system' },
			{ text: t('command.switchCollisionSystem') + Token(': ') },
			{ text: t('command.switchCollisionSystem.' + operation) }
		];
	}
});
