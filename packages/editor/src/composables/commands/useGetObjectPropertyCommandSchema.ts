import '@/module/command/getObjectProperty.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useGetObjectPropertyCommandSchema() {
	const { form, save, load } = useCommandSchema('getObjectProperty', {
		onLoad() {
			getFocus($('#getObjectProperty-variable'));
		}
	});
	const onSave = (): void => {
		const variable = read($('#getObjectProperty-variable')) ?? form.variable;
		if (VariableGetter.isNone!(variable)) {
			getFocus($('#getObjectProperty-variable'));
			return;
		}
		const saveVariable = read($('#getObjectProperty-save-variable')) ?? form.saveVariable;
		if (VariableGetter.isNone!(saveVariable)) {
			getFocus($('#getObjectProperty-save-variable'));
			return;
		}
		const properties = read($('#getObjectProperty-list')) ?? form.properties;
		if (properties.length === 0) {
			getFocus($('#getObjectProperty-list'));
			return;
		}
		Command.save?.({ variable, saveVariable, properties });
	};
	Command.cases.getObjectProperty.customSave = onSave;
	return { form, save: onSave, load };
}
