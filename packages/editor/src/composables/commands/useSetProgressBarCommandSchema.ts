import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { ProgressBarProperty } from '@app/commands/property-window/set-progress-property-window.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus, read } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.setProgressBar = new CommandSchema({
	name: 'setProgressBar',
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
			words.push(ProgressBarProperty.parse!(property));
		}
		return [
			{ color: 'element' },
			{ text: t('command.setProgressBar') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetProgressBarCommandSchema() {
	const { form, save, load } = useCommandSchema('setProgressBar', {
		onLoad() {
			getFocus(document.getElementById('setProgressBar-element'));
		}
	});
	const onSave = (): void => {
		const properties =
			read(document.getElementById('setProgressBar-properties')) ?? form.properties;
		if (properties.length === 0) {
			getFocus(document.getElementById('setProgressBar-properties'));
			return;
		}
		save();
	};
	Command.cases.setProgressBar.customSave = onSave;
	return { form, save: onSave, load };
}
