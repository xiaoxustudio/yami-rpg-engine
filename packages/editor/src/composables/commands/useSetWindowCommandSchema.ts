import '@app/legacy/module/command/setWindow.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetWindowCommandSchema() {
	const { form, save, load } = useCommandSchema('setWindow', {
		onLoad() {
			getFocus($('#setWindow-element'));
		}
	});
	const onSave = (): void => {
		const properties = read($('#setWindow-properties')) ?? form.properties;
		if (properties.length === 0) {
			getFocus($('#setWindow-properties'));
			return;
		}
		save();
	};
	Command.cases.setWindow.customSave = onSave;
	return { form, save: onSave, load };
}
