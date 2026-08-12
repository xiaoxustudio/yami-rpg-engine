import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

type AppendTargetData = {
	actor: unknown;
	target: unknown;
	[k: string]: unknown;
};

Command.cases.appendTarget = new CommandSchema({
	name: 'appendTarget',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'target', default: { type: 'trigger' } }
	],
	customParse({ actor, target }: AppendTargetData) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseActor(target));
		return [
			{ color: 'actor' },
			{ text: Local.get!('command.appendTarget') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		getFocus($('#appendTarget-actor'));
	}
});
