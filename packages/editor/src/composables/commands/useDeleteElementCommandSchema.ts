/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

Command.cases.deleteElement = new CommandSchema({
	name: 'deleteElement',
	fields: [
		{ key: 'operation', default: 'delete-element' },
		{ key: 'element', default: { type: 'trigger' } }
	],
	customParse({ operation, element }: { operation: string; element: unknown }) {
		let info;
		switch (operation) {
			case 'delete-element':
				info = Command.parseElement!(element);
				break;
			case 'delete-children':
				info =
					Command.parseElement!(element) +
					Token(' -> ') +
					t('command.deleteElement.children');
				break;
			case 'delete-all':
				info = t('command.deleteElement.all-elements');
				break;
		}
		return [
			{ color: 'element' },
			{ text: t('command.deleteElement') + Token(': ') },
			{ text: info }
		];
	}
});

export function useDeleteElementCommandSchema() {
	const { form, load, commit } = useCommandSchema('deleteElement', {
		skipWrite: true,
		onLoad() {
			requestFocus('deleteElement-operation');
		}
	});
	const onSave = (): void => {
		const operation = form.operation as string;
		switch (operation) {
			case 'delete-element':
			case 'delete-children': {
				commit({
					operation,
					element: form.element
				});
				break;
			}
			case 'delete-all':
				commit({ operation });
				break;
		}
	};
	Command.cases.deleteElement.customSave = onSave;
	return { form, save: onSave, load };
}
