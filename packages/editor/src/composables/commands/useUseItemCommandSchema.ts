import '@app/legacy/module/command/useItem.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { Enum } from '@app/legacy/enum/enum-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useUseItemCommandSchema() {
	const { form, save, load } = useCommandSchema('useItem', {
		onLoad() {
			$('#useItem-key')?.loadItems?.(Enum.getStringItems!('shortcut-key'));
			getFocus($('#useItem-actor'));
		}
	});
	const onSave = (): void => {
		const actor = read($('#useItem-actor')) ?? form.actor;
		const mode = read($('#useItem-mode')) ?? form.mode;
		const wait = read($('#useItem-wait')) ?? form.wait;
		switch (mode) {
			case 'by-key': {
				const key = read($('#useItem-key')) ?? form.key;
				if (key === '') {
					getFocus($('#useItem-key'));
					return;
				}
				Command.save?.({ actor, mode, key, wait });
				break;
			}
			case 'by-id': {
				const itemId = read($('#useItem-itemId')) ?? form.itemId;
				if (itemId === '') {
					getFocus($('#useItem-itemId'));
					return;
				}
				Command.save?.({ actor, mode, itemId, wait });
				break;
			}
			case 'by-item':
				Command.save?.({
					actor,
					mode,
					item: read($('#useItem-item')) ?? form.item,
					wait
				});
				break;
		}
	};
	Command.cases.useItem.customSave = onSave;
	return { form, save: onSave, load };
}
