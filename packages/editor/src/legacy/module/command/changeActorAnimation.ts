import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.changeActorAnimation = new CommandSchema({
	name: 'changeActorAnimation',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'animationId', default: '', required: true }
	],
	customParse({ actor, animationId }: { actor: unknown; animationId: unknown }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseFileName(animationId));
		return [
			{ color: 'actor' },
			{ text: Local.get!('command.changeActorAnimation') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		getFocus($('#changeActorAnimation-actor'));
	}
});
