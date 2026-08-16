import '@/module/command/setDialogBox.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetDialogBoxCommandSchema() {
	const { form, save, load } = useCommandSchema('setDialogBox', {
		onLoad() {
			getFocus($('#setDialogBox-element'));
		}
	});
	const onSave = (): void => {
		const properties = read($('#setDialogBox-properties')) ?? form.properties;
		if (properties.length === 0) {
			getFocus($('#setDialogBox-properties'));
			return;
		}
		Command.save?.({
			element: read($('#setDialogBox-element')) ?? form.element,
			properties
		});
	};
	Command.cases.setDialogBox.customSave = onSave;
	return { form, save: onSave, load };
}
