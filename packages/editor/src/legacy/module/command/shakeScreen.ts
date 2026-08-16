import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Data } from '@/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.shakeScreen = new CommandSchema({
	name: 'shakeScreen',
	fields: [
		{ key: 'mode', default: 'random' },
		{ key: 'power', default: 5 },
		{ key: 'speed', default: 10 },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 200 },
		{ key: 'wait', default: false }
	],
	customParse({
		mode,
		power,
		speed,
		easingId,
		duration,
		wait
	}: {
		mode: string;
		power: unknown;
		speed: unknown;
		easingId: unknown;
		duration: unknown;
		wait: unknown;
	}) {
		const words = Command.words
			.push(Local.get!('command.shakeScreen.' + mode))
			.push(Command.setNumberColor!(power))
			.push(Command.setNumberColor!(speed))
			.push(Command.parseEasing!(easingId, duration, wait));
		return [
			{ color: 'scene' },
			{ text: Local.get!('command.shakeScreen') + Token(': ') },
			{ text: words.join() }
		];
	}
});
