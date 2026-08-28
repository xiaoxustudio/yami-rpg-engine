/* oxlint-disable eslint/no-restricted-properties */
import { getFocus } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { LightProperty } from '@app/commands/property-window/move-light-property-window.ts';
import { Data } from '@app/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.moveLight = new CommandSchema({
	name: 'moveLight',
	fields: [
		{ key: 'light', default: { type: 'trigger' } },
		{ key: 'properties', default: [] },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	customParse({
		light,
		properties,
		easingId,
		duration,
		wait
	}: {
		light: unknown;
		properties: Array<{ key: string; value: unknown }>;
		easingId: unknown;
		duration: unknown;
		wait: unknown;
	}) {
		const words = Command.words.push(Command.parseLight!(light));
		for (const property of properties) {
			words.push(LightProperty.parse!(property));
		}
		words.push(Command.parseEasing!(easingId, duration, wait));
		return [
			{ color: 'object' },
			{ text: t('command.moveLight') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useMoveLightCommandSchema() {
	const { form, load, commit } = useCommandSchema('moveLight', {
		onLoad() {
			getFocus(document.getElementById('moveLight-light')!);
		}
	});
	const onSave = (): void => {
		const properties = form.properties as Array<{ key: string; value: unknown }>;
		if (properties.length === 0) {
			getFocus(document.getElementById('moveLight-properties')!);
			return;
		}
		commit({
			light: form.light,
			properties,
			easingId: form.easingId,
			duration: form.duration,
			wait: form.wait
		});
	};
	Command.cases.moveLight.customSave = onSave;
	return { form, save: onSave, load };
}
