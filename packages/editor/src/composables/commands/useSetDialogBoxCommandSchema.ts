import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { DialogBoxProperty } from '@app/commands/property-window/set-dialog-property-window.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus, read } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.setDialogBox = new CommandSchema({
	name: 'setDialogBox',
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
			words.push(DialogBoxProperty.parse!(property));
		}
		return [
			{ color: 'element' },
			{ text: t('command.setDialogBox') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetDialogBoxCommandSchema() {
	const { form, save, load, commit } = useCommandSchema('setDialogBox', {
		onLoad() {
			getFocus(document.getElementById('setDialogBox-element'));
		}
	});
	const onSave = (): void => {
		const properties =
			read(document.getElementById('setDialogBox-properties')) ?? form.properties;
		if (properties.length === 0) {
			getFocus(document.getElementById('setDialogBox-properties'));
			return;
		}
		commit({
			element: read(document.getElementById('setDialogBox-element')) ?? form.element,
			properties
		});
	};
	Command.cases.setDialogBox.customSave = onSave;
	return { form, save: onSave, load };
}
