import '@app/legacy/module/command/setNumber.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { useNumberOperandSchema } from '@app/composables/useNumberOperandSchema';
import type { SetNumberOperand } from '@app/legacy/module/command/setNumber.ts';

export function useSetNumberCommandSchema() {
	const { form, save, load } = useCommandSchema('setNumber', {
		onLoad() {
			getFocus(document.getElementById('setNumber-variable'));
		}
	});
	useNumberOperandSchema();
	const onSave = (): void => {
		const variable = read(document.getElementById('setNumber-variable')) ?? form.variable;
		if (VariableGetter.isNone!(variable)) {
			getFocus(document.getElementById('setNumber-variable'));
			return;
		}
		const operation = (read(document.getElementById('setNumber-operation')) ??
			form.operation) as string;
		const operands = (read(document.getElementById('setNumber-operands')) ??
			form.operands) as SetNumberOperand[];
		if (operands.length === 0) {
			getFocus(document.getElementById('setNumber-operands'));
			return;
		}
		operands[0].operation = 'add';
		Command.save?.({ variable, operation, operands });
	};
	Command.cases.setNumber.customSave = onSave;
	return { form, save: onSave, load };
}
