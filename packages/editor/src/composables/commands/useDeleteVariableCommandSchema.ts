/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

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
		skipWrite: true,
		onLoad() {
			requestFocus('deleteVariable-variable');
		}
	});
	const onSave = (): void => {
		const variable = form.variable as { key: string };
		if (VariableGetter.isNone!(variable)) {
			requestFocus('deleteVariable-variable');
			return;
		}
		commit({ variable });
	};
	Command.cases.deleteVariable.customSave = onSave;
	return { form, save: onSave, load };
}
