import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Enum } from '@/enum/enum-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.useItem = new CommandSchema({
	name: 'useItem',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'mode', default: 'by-key' },
		{ key: 'key', default: () => Enum.getDefStringId!('shortcut-key') },
		{ key: 'itemId', default: '' },
		{ key: 'item', default: { type: 'trigger' } },
		{ key: 'wait', default: false }
	],
	customParse({
		actor,
		mode,
		key,
		itemId,
		item,
		wait
	}: {
		actor: unknown;
		mode: string;
		key: unknown;
		itemId: unknown;
		item: unknown;
		wait: unknown;
	}) {
		const words = Command.words.push(Command.parseActor!(actor));
		switch (mode) {
			case 'by-key':
				words.push(Command.parseGroupEnumString!('shortcut-key', key));
				break;
			case 'by-id':
				words.push(Command.parseFileName!(itemId));
				break;
			case 'by-item':
				words.push(Command.parseItem!(item));
				break;
		}
		words.push(Command.parseWait!(wait));
		return [
			{ color: 'inventory' },
			{ text: Local.get!('command.useItem') + Token(': ') },
			{ text: words.join() }
		];
	}
});
