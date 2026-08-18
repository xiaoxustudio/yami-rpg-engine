import '@app/legacy/module/command/controlButton.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useControlButtonCommandSchema() {
	const { form, save, load } = useCommandSchema('controlButton', {
		onLoad() {
			getFocus(document.getElementById('controlButton-operation'));
		}
	});
	const onSave = (): void => {
		const operation =
			read(document.getElementById('controlButton-operation')) ?? form.operation;
		switch (operation) {
			case 'select-default':
				Command.save!({ operation });
				break;
			case 'select':
			case 'hover-mode':
			case 'active-mode':
			case 'normal-mode': {
				Command.save!({
					operation,
					element: read(document.getElementById('controlButton-element')) ?? form.element
				});
				break;
			}
		}
	};
	Command.cases.controlButton.customSave = onSave;
	return { form, save: onSave, load };
}
