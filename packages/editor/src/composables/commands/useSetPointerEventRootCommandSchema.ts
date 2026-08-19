import '@app/legacy/module/command/setPointerEventRoot.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetPointerEventRootCommandSchema() {
	const { form, save, load } = useCommandSchema('setPointerEventRoot', {
		onLoad() {
			getFocus(document.getElementById('setPointerEventRoot-operation'));
		}
	});
	const onSave = (): void => {
		const operation =
			read(document.getElementById('setPointerEventRoot-operation')) ?? form.operation;
		switch (operation) {
			case 'add':
			case 'remove':
				Command.save?.({
					operation,
					element:
						read(document.getElementById('setPointerEventRoot-element')) ?? form.element
				});
				break;
			case 'remove-latest':
			case 'reset':
				Command.save?.({ operation });
				break;
		}
	};
	Command.cases.setPointerEventRoot.customSave = onSave;
	return { form, save: onSave, load };
}
