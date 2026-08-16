import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { WindowProperty } from '@/command/set-window-property-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setWindow = new CommandSchema({
	name: 'setWindow',
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
			words.push(WindowProperty.parse!(property));
		}
		return [
			{ color: 'element' },
			{ text: Local.get!('command.setWindow') + Token(': ') },
			{ text: words.join() }
		];
	}
});
