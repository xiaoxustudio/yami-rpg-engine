import '@app/legacy/module/command/setDialogBox.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetDialogBoxCommandSchema() {
	const { form, save, load } = useCommandSchema('setDialogBox', {
		onLoad() {
			getFocus(document.getElementById('setDialogBox-element'));
		}
	});
	const onSave = (): void => {
		const properties =
			read(document.getElementById('setDialogBox-properties')) ?? form.properties;
		if (properties.length === 0) {
			getFocus(document.getElementById('setDialogBox-properties'));
			return;
		}
		Command.save?.({
			element: read(document.getElementById('setDialogBox-element')) ?? form.element,
			properties
		});
	};
	Command.cases.setDialogBox.customSave = onSave;
	return { form, save: onSave, load };
}
