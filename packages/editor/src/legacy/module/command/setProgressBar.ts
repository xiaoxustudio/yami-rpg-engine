import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { ProgressBarProperty } from '@/command/set-progress-property-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setProgressBar = new CommandSchema({
	name: 'setProgressBar',
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
			words.push(ProgressBarProperty.parse!(property));
		}
		return [
			{ color: 'element' },
			{ text: Local.get!('command.setProgressBar') + Token(': ') },
			{ text: words.join() }
		];
	}
});
