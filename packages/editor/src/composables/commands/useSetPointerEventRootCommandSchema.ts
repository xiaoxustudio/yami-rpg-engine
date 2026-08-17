import '@app/legacy/module/command/setPointerEventRoot.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetPointerEventRootCommandSchema() {
	const { form, save, load } = useCommandSchema('setPointerEventRoot', {
		onLoad() {
			getFocus($('#setPointerEventRoot-operation'));
		}
	});
	const onSave = (): void => {
		const operation = read($('#setPointerEventRoot-operation')) ?? form.operation;
		switch (operation) {
			case 'add':
			case 'remove':
				Command.save?.({
					operation,
					element: read($('#setPointerEventRoot-element')) ?? form.element
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
