import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.stopAudio = new CommandSchema({
	name: 'stopAudio',
	fields: [{ key: 'type', default: 'bgm' }],
	customParse({ type }: { type: unknown }) {
		const words = Command.words.push(Command.parseAudioType!(type));
		return [
			{ color: 'audio' },
			{ text: Local.get!('command.stopAudio') + Token(': ') },
			{ text: words.join() }
		];
	}
});
