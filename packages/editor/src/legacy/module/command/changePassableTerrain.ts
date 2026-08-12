import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.changePassableTerrain = new CommandSchema({
	name: 'changePassableTerrain',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'passage', default: 'land' }
	],
	onInitialize() {
		$('#changePassableTerrain-confirm').on('click', () => this.save!());
		$('#changePassableTerrain-passage').loadItems([
			{ name: 'Land', value: 'land' },
			{ name: 'Water', value: 'water' },
			{ name: 'Unrestricted', value: 'unrestricted' }
		]);
	},
	customParse({ actor, passage }: { actor: unknown; passage: string }) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(Local.get!('command.changePassableTerrain.' + passage));
		return [
			{ color: 'actor' },
			{ text: Local.get!('command.changePassableTerrain') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		getFocus($('#changePassableTerrain-actor'));
	}
});
