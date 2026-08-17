import '@app/legacy/module/command/createElement.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useCreateElementCommandSchema() {
	const { form, save, load } = useCommandSchema('createElement', {
		onLoad() {
			getFocus($('#createElement-operation'), 'all');
		}
	});
	const onSave = (): void => {
		const operation = read($('#createElement-operation')) ?? form.operation;
		const parent = read($('#createElement-parent')) ?? form.parent;
		switch (operation) {
			case 'append-all-to-root': {
				const uiId = read($('#createElement-uiId')) ?? form.uiId;
				if (uiId === '') {
					getFocus($('#createElement-uiId'));
					return;
				}
				Command.save?.({ operation, uiId });
				break;
			}
			case 'append-one-to-root': {
				const presetId = read($('#createElement-presetId')) ?? form.presetId;
				if (presetId === '') {
					getFocus($('#createElement-presetId'));
					return;
				}
				Command.save?.({ operation, presetId });
				break;
			}
			case 'append-all-to-element': {
				const uiId = read($('#createElement-uiId')) ?? form.uiId;
				if (uiId === '') {
					getFocus($('#createElement-uiId'));
					return;
				}
				Command.save?.({ operation, parent, uiId });
				break;
			}
			case 'append-one-to-element': {
				const presetId = read($('#createElement-presetId')) ?? form.presetId;
				if (presetId === '') {
					getFocus($('#createElement-presetId'));
					return;
				}
				Command.save?.({ operation, parent, presetId });
				break;
			}
		}
	};
	Command.cases.createElement.customSave = onSave;
	return { form, save: onSave, load };
}
