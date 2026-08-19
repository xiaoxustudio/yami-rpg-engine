import '@app/legacy/module/command/setProgressBar.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetProgressBarCommandSchema() {
	const { form, save, load } = useCommandSchema('setProgressBar', {
		onLoad() {
			getFocus(document.getElementById('setProgressBar-element'));
		}
	});
	const onSave = (): void => {
		const properties =
			read(document.getElementById('setProgressBar-properties')) ?? form.properties;
		if (properties.length === 0) {
			getFocus(document.getElementById('setProgressBar-properties'));
			return;
		}
		save();
	};
	Command.cases.setProgressBar.customSave = onSave;
	return { form, save: onSave, load };
}
