import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Enum } from '@/enum/enum-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setShortcut = new CommandSchema({
	name: 'setShortcut',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'operation', default: 'set-item-shortcut' },
		{ key: 'itemId', default: '' },
		{ key: 'skillId', default: '' },
		{ key: 'key', default: () => Enum.getDefStringId!('shortcut-key') },
		{ key: 'key2', default: () => Enum.getDefStringId!('shortcut-key') }
	],
	customParse({
		actor,
		operation,
		itemId,
		skillId,
		key,
		key2
	}: {
		actor: unknown;
		operation: string;
		itemId: unknown;
		skillId: unknown;
		key: unknown;
		key2: unknown;
	}) {
		const shortcutKey = Command.parseVariableEnum!('shortcut-key', key);
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(Local.get!('command.setShortcut.' + operation));
		switch (operation) {
			case 'set-item-shortcut': {
				words.push(shortcutKey + Token(' = ') + Command.parseVariableFile!(itemId));
				break;
			}
			case 'set-skill-shortcut':
				words.push(shortcutKey + Token(' = ') + Command.parseVariableFile!(skillId));
				break;
			case 'delete-shortcut':
				words.push(shortcutKey);
				break;
			case 'swap-shortcuts':
				words.push(
					shortcutKey + Token(' <-> ') + Command.parseVariableEnum!('shortcut-key', key2)
				);
				break;
		}
		return [
			{ color: 'inventory' },
			{ text: Local.get!('command.setShortcut') + Token(': ') },
			{ text: words.join() }
		];
	}
});
