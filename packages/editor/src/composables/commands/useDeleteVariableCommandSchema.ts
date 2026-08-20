import '@app/legacy/module/command/deleteVariable.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useDeleteVariableCommandSchema() {
	const { form, save, load, commit } = useCommandSchema('deleteVariable', {
		onLoad() {
			getFocus(document.getElementById('deleteVariable-variable'));
		}
	});
	const onSave = (): void => {
		const variable = read(document.getElementById('deleteVariable-variable')) ?? form.variable;
		if (VariableGetter.isNone!(variable)) {
			getFocus(document.getElementById('deleteVariable-variable'));
			return;
		}
		commit({ variable });
	};
	Command.cases.deleteVariable.customSave = onSave;
	return { form, save: onSave, load };
}
