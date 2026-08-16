import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.loadScene = new CommandSchema({
	name: 'loadScene',
	fields: [
		{ key: 'sceneId', default: '' },
		{ key: 'transfer', default: true },
		{ key: 'x', default: 0 },
		{ key: 'y', default: 0 }
	],
	customParse({
		sceneId,
		transfer,
		x,
		y
	}: {
		sceneId: unknown;
		transfer: unknown;
		x: unknown;
		y: unknown;
	}) {
		const words = Command.words.push(Command.parseVariableFile!(sceneId));
		if (transfer) {
			words.push(Command.parseVariableNumber!(x)).push(Command.parseVariableNumber!(y));
		}
		return [
			{ color: 'scene' },
			{ text: Local.get!('command.loadScene') + Token(': ') },
			{ text: words.join() }
		];
	}
});
