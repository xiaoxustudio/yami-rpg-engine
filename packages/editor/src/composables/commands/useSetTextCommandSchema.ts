import '@app/legacy/module/command/setText.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetTextCommandSchema() {
	const { form, save, load } = useCommandSchema('setText', {
		onLoad() {
			getFocus($('#setText-element'));
		}
	});
	const onSave = (): void => {
		const properties = read($('#setText-properties')) ?? form.properties;
		if (properties.length === 0) {
			getFocus($('#setText-properties'));
			return;
		}
		save();
	};
	Command.cases.setText.customSave = onSave;
	return { form, save: onSave, load };
}
