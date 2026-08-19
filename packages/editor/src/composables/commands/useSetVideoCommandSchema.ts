import '@app/legacy/module/command/setVideo.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetVideoCommandSchema() {
	const { form, save, load } = useCommandSchema('setVideo', {
		onLoad() {
			getFocus(document.getElementById('setVideo-element'));
		}
	});
	const onSave = (): void => {
		const properties = read(document.getElementById('setVideo-properties')) ?? form.properties;
		if (properties.length === 0) {
			getFocus(document.getElementById('setVideo-properties'));
			return;
		}
		save();
	};
	Command.cases.setVideo.customSave = onSave;
	return { form, save: onSave, load };
}
