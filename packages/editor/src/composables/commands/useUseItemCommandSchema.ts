import '@app/legacy/module/command/useItem.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { Enum } from '@app/legacy/enum/enum-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useUseItemCommandSchema() {
	const { form, save, load } = useCommandSchema('useItem', {
		onLoad() {
			document
				.getElementById('useItem-key')
				?.loadItems?.(Enum.getStringItems!('shortcut-key'));
			getFocus(document.getElementById('useItem-actor'));
		}
	});
	const onSave = (): void => {
		const actor = read(document.getElementById('useItem-actor')) ?? form.actor;
		const mode = read(document.getElementById('useItem-mode')) ?? form.mode;
		const wait = read(document.getElementById('useItem-wait')) ?? form.wait;
		switch (mode) {
			case 'by-key': {
				const key = read(document.getElementById('useItem-key')) ?? form.key;
				if (key === '') {
					getFocus(document.getElementById('useItem-key'));
					return;
				}
				Command.save?.({ actor, mode, key, wait });
				break;
			}
			case 'by-id': {
				const itemId = read(document.getElementById('useItem-itemId')) ?? form.itemId;
				if (itemId === '') {
					getFocus(document.getElementById('useItem-itemId'));
					return;
				}
				Command.save?.({ actor, mode, itemId, wait });
				break;
			}
			case 'by-item':
				Command.save?.({
					actor,
					mode,
					item: read(document.getElementById('useItem-item')) ?? form.item,
					wait
				});
				break;
		}
	};
	Command.cases.useItem.customSave = onSave;
	return { form, save: onSave, load };
}
