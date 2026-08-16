import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.deleteObject = new CommandSchema({
	name: 'deleteObject',
	fields: [{ key: 'object', domId: 'object', default: { type: 'trigger' } }],
	customParse({ object }: { object: unknown }) {
		return [
			{ color: 'object' },
			{ text: Local.get!('command.deleteObject') + Token(': ') },
			{ text: Command.parseObject(object) }
		];
	}
});
