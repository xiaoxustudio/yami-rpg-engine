import '@app/legacy/module/command/setButton.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetButtonCommandSchema() {
	const { form, save, load } = useCommandSchema('setButton', {
		onLoad() {
			getFocus($('#setButton-element'));
		}
	});
	const onSave = (): void => {
		const properties = read($('#setButton-properties')) ?? form.properties;
		if (properties.length === 0) {
			getFocus($('#setButton-properties'));
			return;
		}
		save();
	};
	Command.cases.setButton.customSave = onSave;
	return { form, save: onSave, load };
}
