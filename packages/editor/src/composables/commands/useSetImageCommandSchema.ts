/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { ImageProperty } from '@app/commands/property-window/set-image-property-window.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { requestFocus } from '@app/directives/focus';

Command.cases.setImage = new CommandSchema({
	name: 'setImage',
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
			words.push(ImageProperty.parse!(property));
		}
		return [
			{ color: 'element' },
			{ text: t('command.setImage') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetImageCommandSchema() {
	const { form, save, load } = useCommandSchema('setImage', {
		skipWrite: true,
		onLoad() {
			requestFocus('setImage-element');
		}
	});
	const onSave = (): void => {
		const properties = form.properties as Array<{ key: string; value: unknown }>;
		if (properties.length === 0) {
			requestFocus('setImage-properties');
			return;
		}
		save();
	};
	Command.cases.setImage.customSave = onSave;
	return { form, save: onSave, load };
}
