import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Data } from '@/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.moveCamera = new CommandSchema({
	name: 'moveCamera',
	fields: [
		{ key: 'mode', default: 'position' },
		{ key: 'position', default: { type: 'absolute', x: 0, y: 0 } },
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	customParse({
		mode,
		position,
		actor,
		easingId,
		duration,
		wait
	}: {
		mode: string;
		position: unknown;
		actor: unknown;
		easingId: unknown;
		duration: unknown;
		wait: unknown;
	}) {
		const words = Command.words.push(Local.get!('command.moveCamera.' + mode));
		switch (mode) {
			case 'position':
				words.push(Command.parsePosition!(position));
				break;
			case 'actor':
				words.push(Command.parseActor!(actor));
				break;
		}
		words.push(Command.parseEasing!(easingId, duration, wait));
		return [
			{ color: 'scene' },
			{ text: Local.get!('command.moveCamera') + Token(': ') },
			{ text: words.join() }
		];
	}
});
