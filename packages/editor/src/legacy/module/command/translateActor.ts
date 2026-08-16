import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Data } from '@/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.translateActor = new CommandSchema({
	name: 'translateActor',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'angle', default: { type: 'absolute', degrees: 0 } },
		{ key: 'distance', default: 0 },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	customParse({
		actor,
		angle,
		distance,
		easingId,
		duration,
		wait
	}: {
		actor: unknown;
		angle: unknown;
		distance: unknown;
		easingId: unknown;
		duration: unknown;
		wait: unknown;
	}) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(Command.parseAngle!(angle))
			.push(Command.parseVariableNumber!(distance, 't'))
			.push(Command.parseEasing!(easingId, duration, wait));
		return [
			{ color: 'actor' },
			{ text: Local.get!('command.translateActor') + Token(': ') },
			{ text: words.join() }
		];
	}
});
