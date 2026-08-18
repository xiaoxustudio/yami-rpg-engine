import '@app/legacy/module/command/setTextBox.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetTextBoxCommandSchema() {
	const { form, save, load } = useCommandSchema('setTextBox', {
		onLoad() {
			getFocus(document.getElementById('setTextBox-element'));
		}
	});
	const onSave = (): void => {
		const properties =
			read(document.getElementById('setTextBox-properties')) ?? form.properties;
		if (properties.length === 0) {
			getFocus(document.getElementById('setTextBox-properties'));
			return;
		}
		save();
	};
	Command.cases.setTextBox.customSave = onSave;
	return { form, save: onSave, load };
}
