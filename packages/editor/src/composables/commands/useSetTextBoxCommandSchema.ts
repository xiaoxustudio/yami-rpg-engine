import '@app/legacy/module/command/setTextBox.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetTextBoxCommandSchema() {
	const { form, save, load } = useCommandSchema('setTextBox', {
		onLoad() {
			getFocus($('#setTextBox-element'));
		}
	});
	const onSave = (): void => {
		const properties = read($('#setTextBox-properties')) ?? form.properties;
		if (properties.length === 0) {
			getFocus($('#setTextBox-properties'));
			return;
		}
		save();
	};
	Command.cases.setTextBox.customSave = onSave;
	return { form, save: onSave, load };
}
