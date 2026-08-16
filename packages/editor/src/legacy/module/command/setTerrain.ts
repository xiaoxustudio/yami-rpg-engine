import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setTerrain = new CommandSchema({
	name: 'setTerrain',
	fields: [
		{ key: 'position', default: { type: 'absolute', x: 0, y: 0 } },
		{ key: 'terrain', default: 'land' }
	],
	customParse({ position, terrain }: { position: unknown; terrain: string }) {
		const words = Command.words
			.push(Command.parsePosition!(position))
			.push(Local.get!('command.setTerrain.' + terrain));
		return [
			{ color: 'scene' },
			{ text: Local.get!('command.setTerrain') + Token(': ') },
			{ text: words.join() }
		];
	}
});
