import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { TextProperty } from '@app/commands/property-window/set-text-property-window.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus, read } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.setText = new CommandSchema({
	name: 'setText',
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
			words.push(TextProperty.parse!(property));
		}
		return [
			{ color: 'element' },
			{ text: t('command.setText') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetTextCommandSchema() {
	const { form, save, load } = useCommandSchema('setText', {
		onLoad() {
			getFocus(document.getElementById('setText-element'));
		}
	});
	const onSave = (): void => {
		const properties = read(document.getElementById('setText-properties')) ?? form.properties;
		if (properties.length === 0) {
			getFocus(document.getElementById('setText-properties'));
			return;
		}
		save();
	};
	Command.cases.setText.customSave = onSave;
	return { form, save: onSave, load };
}
