import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { TextBoxProperty } from '@app/commands/property-window/set-textbox-property-window.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus, read } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.setTextBox = new CommandSchema({
	name: 'setTextBox',
	fields: [
		{ key: 'element', default: { type: 'trigger' } },
		{ key: 'properties', default: [] }
	],
	customParse({
		element,
		properties
	}: {
		element: unknown;
		properties: Array<{ key: string; value: unknown }>;
	}) {
		const words = Command.words.push(Command.parseElement!(element));
		for (const property of properties) {
			words.push(TextBoxProperty.parse!(property));
		}
		return [
			{ color: 'element' },
			{ text: t('command.setTextBox') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetTextBoxCommandSchema() {
	const { form, save, load } = useCommandSchema('setTextBox', {
		onLoad() {
			getFocus(document.getElementById('setTextBox-element'));
		}
	});
	const onSave = (): void => {
		const properties =
			read(document.getElementById('setTextBox-properties')) ?? form.properties;
		if (properties.length === 0) {
			getFocus(document.getElementById('setTextBox-properties'));
			return;
		}
		save();
	};
	Command.cases.setTextBox.customSave = onSave;
	return { form, save: onSave, load };
}
