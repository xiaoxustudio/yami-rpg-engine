import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { VideoProperty } from '@/command/set-video-property-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setVideo = new CommandSchema({
	name: 'setVideo',
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
			words.push(VideoProperty.parse!(property));
		}
		return [
			{ color: 'element' },
			{ text: Local.get!('command.setVideo') + Token(': ') },
			{ text: words.join() }
		];
	}
});
