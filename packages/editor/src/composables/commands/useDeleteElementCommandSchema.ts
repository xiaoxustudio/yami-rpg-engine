import '@/module/command/deleteElement.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useDeleteElementCommandSchema() {
	const { form, save, load } = useCommandSchema('deleteElement', {
		onLoad() {
			getFocus($('#deleteElement-operation'));
		}
	});
	const onSave = (): void => {
		const operation = read($('#deleteElement-operation')) ?? form.operation;
		switch (operation) {
			case 'delete-element':
			case 'delete-children': {
				Command.save!({
					operation,
					element: read($('#deleteElement-element')) ?? form.element
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
