import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.unloadSubscene = new CommandSchema({
	name: 'unloadSubscene',
	fields: [{ key: 'sceneId', default: '', required: true }],
	customParse({ sceneId }: { sceneId: unknown }) {
		return [
			{ color: 'scene' },
			{ text: Local.get!('command.unloadSubscene') + Token(': ') },
			{ text: Command.parseVariableFile(sceneId) }
		];
	}
});
