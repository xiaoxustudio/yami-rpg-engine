import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { DialogBoxProperty } from '@/command/set-dialog-property-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setDialogBox = new CommandSchema({
	name: 'setDialogBox',
	fields: [
		{ key: 'element', default: { type: 'trigger' } },
		{ key: 'properties', default: [] }
	],
	customParse({
		element,
		properties
	}: {
		element: unknown;
		properties: Array<{ key: string; value: unknown }>;
	}) {
		const words = Command.words.push(Command.parseElement!(element));
		for (const property of properties) {
			words.push(DialogBoxProperty.parse!(property));
		}
		return [
			{ color: 'element' },
			{ text: Local.get!('command.setDialogBox') + Token(': ') },
			{ text: words.join() }
		];
	}
});
