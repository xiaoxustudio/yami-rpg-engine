import { Command } from '@app/commands/command-object.ts';
import { composableEls } from '@app/composables/element-registry';
import { Token } from '@app/commands/token.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
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
	const { form, load, commit } = useCommandSchema('setShortcut', {
		skipWrite: true,
		onLoad() {
			const items = Enum.getStringItems!('shortcut-key');
			composableEls.get('setShortcut-key')?.loadItems?.(items);
			composableEls.get('setShortcut-key2')?.loadItems?.(items);
			requestFocus('setShortcut-operation');
		}
	});
	const onSave = (): void => {
		const actor = form.actor;
		const operation = form.operation as string;
		const key = form.key;
		if (key === '') {
			requestFocus('setShortcut-key');
			return;
		}
		switch (operation) {
			case 'set-item-shortcut': {
				const itemId = form.itemId;
				if (itemId === '') {
					requestFocus('setShortcut-itemId');
					return;
				}
				commit({ actor, operation, key, itemId });
				break;
			}
			case 'set-skill-shortcut': {
				const skillId = form.skillId;
				if (skillId === '') {
					requestFocus('setShortcut-skillId');
					return;
				}
				commit({ actor, operation, key, skillId });
				break;
			}
			case 'delete-shortcut':
				commit({ actor, operation, key });
				break;
			case 'swap-shortcuts':
				commit({ actor, operation, key, key2: form.key2 });
				break;
		}
	};
	Command.cases.setShortcut.customSave = onSave;
	return { form, save: onSave, load };
}
