/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { ProgressBarProperty } from '@app/commands/property-window/set-progress-property-window.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { requestFocus } from '@app/directives/focus';

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
		skipWrite: true,
		onLoad() {
			requestFocus('setProgressBar-element');
		}
	});
	const onSave = (): void => {
		const properties = form.properties as Array<{ key: string; value: unknown }>;
		if (properties.length === 0) {
			requestFocus('setProgressBar-properties');
			return;
		}
		save();
	};
	Command.cases.setProgressBar.customSave = onSave;
	return { form, save: onSave, load };
}
