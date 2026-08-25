import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus, read } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.setFocus = new CommandSchema({
	name: 'setFocus',
	fields: [
		{ key: 'operation', default: 'add' },
		{ key: 'element', default: { type: 'trigger' } },
		{ key: 'mode', default: 'control-child-buttons' },
		{ key: 'cancelable', default: true }
	],
	customParse({
		operation,
		element,
		mode,
		cancelable
	}: {
		operation: string;
		element: unknown;
		mode: string;
		cancelable: unknown;
	}) {
		const words = Command.words.push(t('command.setFocus.' + operation));
		switch (operation) {
			case 'add':
				if (mode === undefined) {
					mode = 'control-child-buttons';
				}
				words.push(Command.parseElement!(element));
				words.push(t('command.setFocus.' + mode));
				if (cancelable) {
					words.push(t('command.setFocus.cancelable'));
				}
				break;
			case 'remove':
				words.push(Command.parseElement!(element));
				break;
		}
		return [
			{ color: 'element' },
			{ text: t('command.setFocus') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetFocusCommandSchema() {
	const { form, load, commit } = useCommandSchema('setFocus', {
		onLoad() {
			getFocus(document.getElementById('setFocus-operation'));
		}
	});
	const onSave = (): void => {
		const operation = read(document.getElementById('setFocus-operation')) ?? form.operation;
		switch (operation) {
			case 'add':
				commit({
					operation,
					element: read(document.getElementById('setFocus-element')) ?? form.element,
					mode: read(document.getElementById('setFocus-mode')) ?? form.mode,
					cancelable:
						read(document.getElementById('setFocus-cancelable')) ?? form.cancelable
				});
				break;
			case 'remove':
				commit({
					operation,
					element: read(document.getElementById('setFocus-element')) ?? form.element
				});
				break;
			case 'remove-latest':
			case 'reset':
				commit({ operation });
				break;
		}
	};
	Command.cases.setFocus.customSave = onSave;
	return { form, save: onSave, load };
}
