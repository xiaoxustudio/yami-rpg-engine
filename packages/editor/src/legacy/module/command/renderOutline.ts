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
	fields: [
		{ key: 'operation', default: 'add' },
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'color', default: 'ffffffff' }
	],
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
	}
});
