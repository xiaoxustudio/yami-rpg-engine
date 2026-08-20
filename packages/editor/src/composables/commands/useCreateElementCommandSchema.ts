import '@app/legacy/module/command/createElement.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useCreateElementCommandSchema() {
	const { form, save, load, commit } = useCommandSchema('createElement', {
		onLoad() {
			getFocus(document.getElementById('createElement-operation')!, 'all');
		}
	});
	const onSave = (): void => {
		const operation =
			read(document.getElementById('createElement-operation')!) ?? form.operation;
		const parent = read(document.getElementById('createElement-parent')!) ?? form.parent;
		switch (operation) {
			case 'append-all-to-root': {
				const uiId = read(document.getElementById('createElement-uiId')!) ?? form.uiId;
				if (uiId === '') {
					getFocus(document.getElementById('createElement-uiId')!);
					return;
				}
				commit({ operation, uiId });
				break;
			}
			case 'append-one-to-root': {
				const presetId =
					read(document.getElementById('createElement-presetId')!) ?? form.presetId;
				if (presetId === '') {
					getFocus(document.getElementById('createElement-presetId')!);
					return;
				}
				commit({ operation, presetId });
				break;
			}
			case 'append-all-to-element': {
				const uiId = read(document.getElementById('createElement-uiId')!) ?? form.uiId;
				if (uiId === '') {
					getFocus(document.getElementById('createElement-uiId')!);
					return;
				}
				commit({ operation, parent, uiId });
				break;
			}
			case 'append-one-to-element': {
				const presetId =
					read(document.getElementById('createElement-presetId')!) ?? form.presetId;
				if (presetId === '') {
					getFocus(document.getElementById('createElement-presetId')!);
					return;
				}
				commit({ operation, parent, presetId });
				break;
			}
		}
	};
	Command.cases.createElement.customSave = onSave;
	return { form, save: onSave, load };
}
