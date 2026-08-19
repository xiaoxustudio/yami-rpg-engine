import '@app/legacy/module/command/setImage.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetImageCommandSchema() {
	const { form, save, load } = useCommandSchema('setImage', {
		onLoad() {
			getFocus(document.getElementById('setImage-element'));
		}
	});
	const onSave = (): void => {
		const properties = read(document.getElementById('setImage-properties')) ?? form.properties;
		if (properties.length === 0) {
			getFocus(document.getElementById('setImage-properties'));
			return;
		}
		save();
	};
	Command.cases.setImage.customSave = onSave;
	return { form, save: onSave, load };
}
