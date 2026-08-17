import '@app/legacy/module/command/setImage.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetImageCommandSchema() {
	const { form, save, load } = useCommandSchema('setImage', {
		onLoad() {
			getFocus($('#setImage-element'));
		}
	});
	const onSave = (): void => {
		const properties = read($('#setImage-properties')) ?? form.properties;
		if (properties.length === 0) {
			getFocus($('#setImage-properties'));
			return;
		}
		save();
	};
	Command.cases.setImage.customSave = onSave;
	return { form, save: onSave, load };
}
