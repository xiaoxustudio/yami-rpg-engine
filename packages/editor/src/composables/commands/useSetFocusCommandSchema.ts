import '@app/legacy/module/command/setFocus.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetFocusCommandSchema() {
	const { form, save, load } = useCommandSchema('setFocus', {
		onLoad() {
			getFocus(document.getElementById('setFocus-operation'));
		}
	});
	const onSave = (): void => {
		const operation = read(document.getElementById('setFocus-operation')) ?? form.operation;
		switch (operation) {
			case 'add':
				Command.save?.({
					operation,
					element: read(document.getElementById('setFocus-element')) ?? form.element,
					mode: read(document.getElementById('setFocus-mode')) ?? form.mode,
					cancelable:
						read(document.getElementById('setFocus-cancelable')) ?? form.cancelable
				});
				break;
			case 'remove':
				Command.save?.({
					operation,
					element: read(document.getElementById('setFocus-element')) ?? form.element
				});
				break;
			case 'remove-latest':
			case 'reset':
				Command.save?.({ operation });
				break;
		}
	};
	Command.cases.setFocus.customSave = onSave;
	return { form, save: onSave, load };
}
