import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.controlButton = new CommandSchema({
	name: 'controlButton',
	fields: [
		{ key: 'operation', default: 'select-default' },
		{ key: 'element', default: { type: 'trigger' } }
	],
	customParse({ operation, element }: { operation: string; element: unknown }) {
		const words = Command.words.push(t('command.controlButton.' + operation));
		switch (operation) {
			case 'select':
			case 'hover-mode':
			case 'active-mode':
			case 'normal-mode':
				words.push(Command.parseElement!(element));
				break;
		}
		return [
			{ color: 'element' },
			{ text: t('command.controlButton') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useControlButtonCommandSchema() {
	const { form, load, commit } = useCommandSchema('controlButton', {
		onLoad() {
			getFocus(document.getElementById('controlButton-operation'));
		}
	});
	const onSave = (): void => {
		const operation =
			read(document.getElementById('controlButton-operation')) ?? form.operation;
		switch (operation) {
			case 'select-default':
				commit({ operation });
				break;
			case 'select':
			case 'hover-mode':
			case 'active-mode':
			case 'normal-mode': {
				commit({
					operation,
					element: read(document.getElementById('controlButton-element')) ?? form.element
				});
				break;
			}
		}
	};
	Command.cases.controlButton.customSave = onSave;
	return { form, save: onSave, load };
}
