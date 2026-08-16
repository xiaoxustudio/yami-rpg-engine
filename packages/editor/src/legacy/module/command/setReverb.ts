import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Data } from '@/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setReverb = new CommandSchema({
	name: 'setReverb',
	fields: [
		{ key: 'type', default: 'bgm' },
		{ key: 'dry', default: 1 },
		{ key: 'wet', default: 0 },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	customParse({
		type,
		dry,
		wet,
		easingId,
		duration,
		wait
	}: {
		type: unknown;
		dry: unknown;
		wet: unknown;
		easingId: unknown;
		duration: unknown;
		wait: unknown;
	}) {
		const words = Command.words
			.push(Command.parseAudioType!(type))
			.push(Command.parseVariableNumber!(dry))
			.push(Command.parseVariableNumber!(wet))
			.push(Command.parseEasing!(easingId, duration, wait));
		return [
			{ color: 'audio' },
			{ text: Local.get!('command.setReverb') + Token(': ') },
			{ text: words.join() }
		];
	}
});
