import '@app/legacy/module/command/commandLine.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useCommandLineCommandSchema() {
	const { form, save, load, commit } = useCommandSchema('commandLine');
	const onSave = (): void => {
		const key = read(document.getElementById('commandLine-key')) ?? form.key;
		if (
			(typeof key === 'string' && key.trim() === '') ||
			(typeof key === 'object' && VariableGetter.isNone!(key))
		) {
			getFocus(document.getElementById('commandLine-key'));
			return;
		}
		const variable = read(document.getElementById('commandLine-variable')) ?? form.variable;
		if (VariableGetter.isNone!(variable)) {
			getFocus(document.getElementById('commandLine-variable'));
			return;
		}
		commit({
			type: read(document.getElementById('commandLine-type')) ?? form.type,
			key,
			value: read(document.getElementById('commandLine-value')) ?? form.value,
			variable
		});
	};
	Command.cases.commandLine.customSave = onSave;
	return { form, save: onSave, load };
}
