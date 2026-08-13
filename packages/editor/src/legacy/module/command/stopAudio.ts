import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.stopAudio = new CommandSchema({
	name: 'stopAudio',
	fields: [{ key: 'type', default: 'bgm' }],
	onInitialize() {
		$('#stopAudio-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' },
			{ name: 'SE', value: 'se' },
			{ name: 'ALL', value: 'all' }
		]);
	},
	customParse({ type }: { type: unknown }) {
		const words = Command.words.push(Command.parseAudioType!(type));
		return [
			{ color: 'audio' },
			{ text: Local.get!('command.stopAudio') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		getFocus($('#stopAudio-type'));
	}
});
