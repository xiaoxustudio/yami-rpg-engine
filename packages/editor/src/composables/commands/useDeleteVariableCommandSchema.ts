/* oxlint-disable eslint/no-restricted-properties */
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string) => getYamiI18n().global.t(key);

Command.cases.deleteVariable = new CommandSchema({
	name: 'deleteVariable',
	fields: [{ key: 'variable', default: { type: 'local', key: '' } }],
	customParse({ variable }: { variable: unknown }) {
		return [
			{ color: 'variable' },
			{ text: t('command.deleteVariable.alias') + ' ' },
			{ color: 'restore' },
			{ text: Command.parseVariable(variable, 'any') }
		];
	}
});

export function useDeleteVariableCommandSchema() {
	const { form, load, commit } = useCommandSchema('deleteVariable', {
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
