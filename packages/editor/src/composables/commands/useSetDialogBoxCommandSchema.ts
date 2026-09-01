/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { DialogBoxProperty } from '@app/commands/property-window/set-dialog-property-window.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { requestFocus } from '@app/directives/focus';

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
	const { form, load, commit } = useCommandSchema('setDialogBox', {
		skipWrite: true,
		onLoad() {
			requestFocus('setDialogBox-element');
		}
	});
	const onSave = (): void => {
		const properties = form.properties as Array<{ key: string; value: unknown }>;
		if (properties.length === 0) {
			requestFocus('setDialogBox-properties');
			return;
		}
		commit({
			element: form.element,
			properties
		});
	};
	Command.cases.setDialogBox.customSave = onSave;
	return { form, save: onSave, load };
}
