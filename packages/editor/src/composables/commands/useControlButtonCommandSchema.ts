import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

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
		skipWrite: true,
		onLoad() {
			requestFocus('controlButton-operation');
		}
	});
	const onSave = (): void => {
		const operation = form.operation as string;
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
					element: form.element
				});
				break;
			}
		}
	};
	Command.cases.controlButton.customSave = onSave;
	return { form, save: onSave, load };
}
