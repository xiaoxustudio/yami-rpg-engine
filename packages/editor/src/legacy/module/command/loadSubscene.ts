import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.loadSubscene = new CommandSchema({
	name: 'loadSubscene',
	fields: [
		{ key: 'sceneId', default: '', required: true },
		{ key: 'shiftX', default: 0 },
		{ key: 'shiftY', default: 0 }
	],
	customParse({ sceneId, shiftX, shiftY }: any) {
		const words = Command.words
			.push(Command.parseVariableFile(sceneId))
			.push(Command.parseVariableNumber(shiftX))
			.push(Command.parseVariableNumber(shiftY));
		return [
			{ color: 'scene' },
			{ text: Local.get!('command.loadSubscene') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		getFocus($('#loadSubscene-sceneId'));
	}
});
