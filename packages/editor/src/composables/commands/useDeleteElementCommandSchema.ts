import '@app/legacy/module/command/deleteElement.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useDeleteElementCommandSchema() {
	const { form, save, load } = useCommandSchema('deleteElement', {
		onLoad() {
			getFocus(document.getElementById('deleteElement-operation'));
		}
	});
	const onSave = (): void => {
		const operation =
			read(document.getElementById('deleteElement-operation')) ?? form.operation;
		switch (operation) {
			case 'delete-element':
			case 'delete-children': {
				Command.save!({
					operation,
					element: read(document.getElementById('deleteElement-element')) ?? form.element
				});
				break;
			}
			case 'delete-all':
				Command.save!({ operation });
				break;
		}
	};
	Command.cases.deleteElement.customSave = onSave;
	return { form, save: onSave, load };
}
