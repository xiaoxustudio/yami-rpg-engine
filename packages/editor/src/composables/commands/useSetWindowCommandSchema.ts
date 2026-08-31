/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { WindowProperty } from '@app/commands/property-window/set-window-property-window.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.setWindow = new CommandSchema({
	name: 'setWindow',
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
			words.push(WindowProperty.parse!(property));
		}
		return [
			{ color: 'element' },
			{ text: t('command.setWindow') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetWindowCommandSchema() {
	const { form, save, load } = useCommandSchema('setWindow', {
		onLoad() {
			getFocus(document.getElementById('setWindow-element'));
		}
	});
	const onSave = (): void => {
		const properties = form.properties as Array<{ key: string; value: unknown }>;
		if (properties.length === 0) {
			getFocus(document.getElementById('setWindow-properties'));
			return;
		}
		save();
	};
	Command.cases.setWindow.customSave = onSave;
	return { form, save: onSave, load };
}
