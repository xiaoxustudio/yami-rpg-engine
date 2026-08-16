import '@/module/command/setShortcut.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Enum } from '@/enum/enum-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetShortcutCommandSchema() {
	const { form, save, load } = useCommandSchema('setShortcut', {
		onLoad() {
			const items = Enum.getStringItems!('shortcut-key');
			$('#setShortcut-key')?.loadItems?.(items);
			$('#setShortcut-key2')?.loadItems?.(items);
			getFocus($('#setShortcut-operation'));
		}
	});
	const onSave = (): void => {
		const actor = read($('#setShortcut-actor')) ?? form.actor;
		const operation = read($('#setShortcut-operation')) ?? form.operation;
		const key = read($('#setShortcut-key')) ?? form.key;
		if (key === '') {
			getFocus($('#setShortcut-key'));
			return;
		}
		switch (operation) {
			case 'set-item-shortcut': {
				const itemId = read($('#setShortcut-itemId')) ?? form.itemId;
				if (itemId === '') {
					getFocus($('#setShortcut-itemId'));
					return;
				}
				Command.save?.({ actor, operation, key, itemId });
				break;
			}
			case 'set-skill-shortcut': {
				const skillId = read($('#setShortcut-skillId')) ?? form.skillId;
				if (skillId === '') {
					getFocus($('#setShortcut-skillId'));
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
					key2: read($('#setShortcut-key2')) ?? form.key2
				});
				break;
		}
	};
	Command.cases.setShortcut.customSave = onSave;
	return { form, save: onSave, load };
}
