import '@/module/command/setFocus.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetFocusCommandSchema() {
	const { form, save, load } = useCommandSchema('setFocus', {
		onLoad() {
			getFocus($('#setFocus-operation'));
		}
	});
	const onSave = (): void => {
		const operation = read($('#setFocus-operation')) ?? form.operation;
		switch (operation) {
			case 'add':
				Command.save?.({
					operation,
					element: read($('#setFocus-element')) ?? form.element,
					mode: read($('#setFocus-mode')) ?? form.mode,
					cancelable: read($('#setFocus-cancelable')) ?? form.cancelable
				});
				break;
			case 'remove':
				Command.save?.({
					operation,
					element: read($('#setFocus-element')) ?? form.element
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
