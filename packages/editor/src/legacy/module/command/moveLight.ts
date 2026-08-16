import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { LightProperty } from '@/command/move-light-property-window.ts';
import { Data } from '@/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.moveLight = new CommandSchema({
	name: 'moveLight',
	fields: [
		{ key: 'light', default: { type: 'trigger' } },
		{ key: 'properties', default: [] },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	customParse({
		light,
		properties,
		easingId,
		duration,
		wait
	}: {
		light: unknown;
		properties: Array<{ key: string; value: unknown }>;
		easingId: unknown;
		duration: unknown;
		wait: unknown;
	}) {
		const words = Command.words.push(Command.parseLight!(light));
		for (const property of properties) {
			words.push(LightProperty.parse!(property));
		}
		words.push(Command.parseEasing!(easingId, duration, wait));
		return [
			{ color: 'object' },
			{ text: Local.get!('command.moveLight') + Token(': ') },
			{ text: words.join() }
		];
	}
});
