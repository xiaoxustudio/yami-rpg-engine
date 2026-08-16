import '@/module/command/setVideo.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetVideoCommandSchema() {
	const { form, save, load } = useCommandSchema('setVideo', {
		onLoad() {
			getFocus($('#setVideo-element'));
		}
	});
	const onSave = (): void => {
		const properties = read($('#setVideo-properties')) ?? form.properties;
		if (properties.length === 0) {
			getFocus($('#setVideo-properties'));
			return;
		}
		save();
	};
	Command.cases.setVideo.customSave = onSave;
	return { form, save: onSave, load };
}
