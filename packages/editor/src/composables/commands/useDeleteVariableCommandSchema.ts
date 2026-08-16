import '@/module/command/deleteVariable.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useDeleteVariableCommandSchema() {
	const { form, save, load } = useCommandSchema('deleteVariable', {
		onLoad() {
			getFocus($('#deleteVariable-variable'));
		}
	});
	const onSave = (): void => {
		const variable = read($('#deleteVariable-variable')) ?? form.variable;
		if (VariableGetter.isNone!(variable)) {
			getFocus($('#deleteVariable-variable'));
			return;
		}
		Command.save!({ variable });
	};
	Command.cases.deleteVariable.customSave = onSave;
	return { form, save: onSave, load };
}
