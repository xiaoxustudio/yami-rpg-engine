import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.switchCollisionSystem = new CommandSchema({
	name: 'switchCollisionSystem',
	fields: [{ key: 'operation', default: 'enable-actor-collision' }],
	customParse({ operation }: { operation: string }) {
		return [
			{ color: 'system' },
			{ text: Local.get!('command.switchCollisionSystem') + Token(': ') },
			{ text: Local.get!('command.switchCollisionSystem.' + operation) }
		];
	}
});
