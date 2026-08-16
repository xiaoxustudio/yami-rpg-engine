import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setLoop = new CommandSchema({
	name: 'setLoop',
	fields: [
		{ key: 'type', default: 'bgm' },
		{ key: 'loop', default: false }
	],
	parseLoop(loop: boolean) {
		switch (loop) {
			case false:
				return Local.get!('command.setLoop.once');
			case true:
				return Local.get!('command.setLoop.loop');
		}
	},
	customParse({ type, loop }: { type: unknown; loop: boolean }) {
		const words = Command.words.push(Command.parseAudioType!(type)).push(this.parseLoop!(loop));
		return [
			{ color: 'audio' },
			{ text: Local.get!('command.setLoop') + Token(': ') },
			{ text: words.join() }
		];
	}
});
