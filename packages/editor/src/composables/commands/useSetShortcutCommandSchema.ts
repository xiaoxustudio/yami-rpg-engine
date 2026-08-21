import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus, read } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

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
			.push(t('command.setShortcut.' + operation));
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
			{ text: t('command.setShortcut') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetShortcutCommandSchema() {
	const { form, save, load, commit } = useCommandSchema('setShortcut', {
		onLoad() {
			const items = Enum.getStringItems!('shortcut-key');
			document.getElementById('setShortcut-key')?.loadItems?.(items);
			document.getElementById('setShortcut-key2')?.loadItems?.(items);
			getFocus(document.getElementById('setShortcut-operation'));
		}
	});
	const onSave = (): void => {
		const actor = read(document.getElementById('setShortcut-actor')) ?? form.actor;
		const operation = read(document.getElementById('setShortcut-operation')) ?? form.operation;
		const key = read(document.getElementById('setShortcut-key')) ?? form.key;
		if (key === '') {
			getFocus(document.getElementById('setShortcut-key'));
			return;
		}
		switch (operation) {
			case 'set-item-shortcut': {
				const itemId = read(document.getElementById('setShortcut-itemId')) ?? form.itemId;
				if (itemId === '') {
					getFocus(document.getElementById('setShortcut-itemId'));
					return;
				}
				commit({ actor, operation, key, itemId });
				break;
			}
			case 'set-skill-shortcut': {
				const skillId =
					read(document.getElementById('setShortcut-skillId')) ?? form.skillId;
				if (skillId === '') {
					getFocus(document.getElementById('setShortcut-skillId'));
					return;
				}
				commit({ actor, operation, key, skillId });
				break;
			}
			case 'delete-shortcut':
				commit({ actor, operation, key });
				break;
			case 'swap-shortcuts':
				commit({
					actor,
					operation,
					key,
					key2: read(document.getElementById('setShortcut-key2')) ?? form.key2
				});
				break;
		}
	};
	Command.cases.setShortcut.customSave = onSave;
	return { form, save: onSave, load };
}
