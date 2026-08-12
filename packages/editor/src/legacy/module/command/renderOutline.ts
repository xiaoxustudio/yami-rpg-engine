import { $ } from '@/util/dom.ts';
import { getFocus, read, write } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Color } from '@/tools/color-picker-window.ts';
import { Local } from '@/tools/localization.ts';

type RenderOutlineOperation = 'add' | 'remove' | 'reset';

type RenderOutlineData = {
	operation: RenderOutlineOperation;
	actor: unknown;
	color: unknown;
	[k: string]: unknown;
};

Command.cases.renderOutline = new CommandSchema({
	name: 'renderOutline',
	onInitialize() {
		$('#renderOutline-confirm').on('click', () => this.save!());
		$('#renderOutline-operation').loadItems([
			{ name: 'Add', value: 'add' },
			{ name: 'Remove', value: 'remove' },
			{ name: 'Reset', value: 'reset' }
		]);
		$('#renderOutline-operation')
			.enableHiddenMode()
			.relate([
				{
					case: 'add',
					targets: [$('#renderOutline-actor'), $('#renderOutline-color')]
				},
				{ case: 'remove', targets: [$('#renderOutline-actor')] }
			]);
	},
	customParse({ operation, actor, color }: RenderOutlineData) {
		const label = Local.get!('command.renderOutline.' + operation);
		const words = Command.words;
		switch (operation) {
			case 'add':
				words
					.push(label)
					.push(Command.parseActor!(actor))
					.push(Command.parseHexColor!(Color.simplifyHexColor(color)));
				break;
			case 'remove':
				words.push(label).push(Command.parseActor!(actor));
				break;
			case 'reset':
				words.push(label);
				break;
		}
		return [
			{ color: 'flow' },
			{ text: Local.get!('command.renderOutline') + Token(': ') },
			{ text: words.join() }
		];
	},
	customLoad({ operation = 'add', actor = { type: 'trigger' }, color = 'ffffffff' }) {
		write($('#renderOutline-operation'), operation);
		write($('#renderOutline-actor'), actor);
		write($('#renderOutline-color'), color);
		getFocus($('#renderOutline-operation'));
	},
	customSave() {
		const operation = read($('#renderOutline-operation'));
		switch (operation) {
			case 'add': {
				Command.save!({
					operation,
					actor: read($('#renderOutline-actor')),
					color: read($('#renderOutline-color'))
				});
				break;
			}
			case 'remove': {
				Command.save!({
					operation,
					actor: read($('#renderOutline-actor'))
				});
				break;
			}
			case 'reset':
				Command.save!({ operation });
				break;
		}
	}
});
