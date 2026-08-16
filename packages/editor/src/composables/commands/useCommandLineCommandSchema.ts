import '@/module/command/commandLine.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useCommandLineCommandSchema() {
	const { form, save, load } = useCommandSchema('commandLine');
	const onSave = (): void => {
		const key = read($('#commandLine-key')) ?? form.key;
		if (
			(typeof key === 'string' && key.trim() === '') ||
			(typeof key === 'object' && VariableGetter.isNone!(key))
		) {
			getFocus($('#commandLine-key'));
			return;
		}
		const variable = read($('#commandLine-variable')) ?? form.variable;
		if (VariableGetter.isNone!(variable)) {
			getFocus($('#commandLine-variable'));
			return;
		}
		Command.save?.({
			type: read($('#commandLine-type')) ?? form.type,
			key,
			value: read($('#commandLine-value')) ?? form.value,
			variable
		});
	};
	Command.cases.commandLine.customSave = onSave;
	return { form, save: onSave, load };
}
