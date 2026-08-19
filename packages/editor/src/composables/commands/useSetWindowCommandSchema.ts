import '@app/legacy/module/command/setWindow.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetWindowCommandSchema() {
	const { form, save, load } = useCommandSchema('setWindow', {
		onLoad() {
			getFocus(document.getElementById('setWindow-element'));
		}
	});
	const onSave = (): void => {
		const properties = read(document.getElementById('setWindow-properties')) ?? form.properties;
		if (properties.length === 0) {
			getFocus(document.getElementById('setWindow-properties'));
			return;
		}
		save();
	};
	Command.cases.setWindow.customSave = onSave;
	return { form, save: onSave, load };
}
