import '@app/legacy/module/command/setProgressBar.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetProgressBarCommandSchema() {
	const { form, save, load } = useCommandSchema('setProgressBar', {
		onLoad() {
			getFocus($('#setProgressBar-element'));
		}
	});
	const onSave = (): void => {
		const properties = read($('#setProgressBar-properties')) ?? form.properties;
		if (properties.length === 0) {
			getFocus($('#setProgressBar-properties'));
			return;
		}
		save();
	};
	Command.cases.setProgressBar.customSave = onSave;
	return { form, save: onSave, load };
}
