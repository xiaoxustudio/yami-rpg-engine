import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { ButtonProperty } from '@app/commands/property-window/set-button-property-window.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { requestFocus } from '@app/directives/focus';

Command.cases.setButton = new CommandSchema({
	name: 'setButton',
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
			words.push(ButtonProperty.parse!(property));
		}
		return [
			{ color: 'element' },
			{ text: t('command.setButton') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetButtonCommandSchema() {
	const { form, save, load } = useCommandSchema('setButton', {
		skipWrite: true,
		onLoad() {
			requestFocus('setButton-element');
		}
	});
	const onSave = (): void => {
		const properties = form.properties as Array<{ key: string; value: unknown }>;
		if (properties.length === 0) {
			requestFocus('setButton-properties');
			return;
		}
		save();
	};
	Command.cases.setButton.customSave = onSave;
	return { form, save: onSave, load };
}
