import '@app/legacy/module/command/setShortcut.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { Enum } from '@app/legacy/enum/enum-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetShortcutCommandSchema() {
	const { form, save, load } = useCommandSchema('setShortcut', {
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
				Command.save?.({ actor, operation, key, itemId });
				break;
			}
			case 'set-skill-shortcut': {
				const skillId =
					read(document.getElementById('setShortcut-skillId')) ?? form.skillId;
				if (skillId === '') {
					getFocus(document.getElementById('setShortcut-skillId'));
					return;
				}
				Command.save?.({ actor, operation, key, skillId });
				break;
			}
			case 'delete-shortcut':
				Command.save?.({ actor, operation, key });
				break;
			case 'swap-shortcuts':
				Command.save?.({
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
