import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { requestFocus } from '@app/directives/focus';

Command.cases.setPointerEventRoot = new CommandSchema({
	name: 'setPointerEventRoot',
	fields: [
		{ key: 'operation', default: 'add' },
		{ key: 'element', default: { type: 'trigger' } }
	],
	customParse({ operation, element }: { operation: string; element: unknown }) {
		if (operation === 'set') {
			operation = 'add';
		}
		const words = Command.words.push(t('command.setPointerEventRoot.' + operation));
		switch (operation) {
			case 'add':
			case 'remove':
				words.push(Command.parseElement!(element));
				break;
		}
		return [
			{ color: 'element' },
			{ text: t('command.setPointerEventRoot') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetPointerEventRootCommandSchema() {
	const { form, load, commit } = useCommandSchema('setPointerEventRoot', {
		skipWrite: true,
		onLoad() {
			requestFocus('setPointerEventRoot-operation');
		}
	});
	const onSave = (): void => {
		const operation = form.operation;
		switch (operation) {
			case 'add':
			case 'remove':
				commit({ operation, element: form.element });
				break;
			case 'remove-latest':
			case 'reset':
				commit({ operation });
				break;
		}
	};
	Command.cases.setPointerEventRoot.customSave = onSave;
	return { form, save: onSave, load };
}
