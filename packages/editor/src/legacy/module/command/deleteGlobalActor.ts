import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.deleteGlobalActor = new CommandSchema({
	name: 'deleteGlobalActor',
	fields: [{ key: 'actorId', default: '', required: true }],
	customParse({ actorId }: any) {
		const words = Command.words.push(Command.parseFileName(actorId));
		return [
			{ color: 'actor' },
			{ text: Local.get('command.deleteGlobalActor') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		getFocus($('#deleteGlobalActor-actorId'));
	}
});
