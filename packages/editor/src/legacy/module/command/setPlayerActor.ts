import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setPlayerActor = new CommandSchema({
	name: 'setPlayerActor',
	fields: [{ key: 'actor', default: { type: 'trigger' } }],
	customParse({ actor }: any) {
		return [
			{ color: 'actor' },
			{ text: Local.get!('command.setPlayerActor') + Token(': ') },
			{ text: Command.parseActor(actor) }
		];
	},
	onLoad() {
		getFocus($('#setPlayerActor-actor'));
	}
});
