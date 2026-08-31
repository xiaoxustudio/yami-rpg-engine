/* oxlint-disable eslint/no-restricted-properties */
import { getFocus } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { TransformProperty } from '@app/commands/property-window/move-element-property-window.ts';
import { Data } from '@app/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

Command.cases.moveElement = new CommandSchema({
	name: 'moveElement',
	fields: [
		{ key: 'element', default: { type: 'trigger' } },
		{ key: 'properties', default: [] },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	customParse({
		element,
		properties,
		easingId,
		duration,
		wait
	}: {
		element: unknown;
		properties: Array<{ key: string; value: unknown }>;
		easingId: unknown;
		duration: unknown;
		wait: unknown;
	}) {
		const words = Command.words.push(Command.parseElement!(element));
		for (const property of properties) {
			words.push(TransformProperty.parse!(property));
		}
		words.push(Command.parseEasing!(easingId, duration, wait));
		return [
			{ color: 'element' },
			{ text: t('command.moveElement') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useMoveElementCommandSchema() {
	const { form, load, commit } = useCommandSchema('moveElement', {
		onLoad() {
			getFocus(document.getElementById('moveElement-element')!);
		}
	});
	const onSave = (): void => {
		const properties = form.properties as Array<{ key: string; value: unknown }>;
		if (properties.length === 0) {
			getFocus(document.getElementById('moveElement-properties')!);
			return;
		}
		commit({
			element: form.element,
			properties,
			easingId: form.easingId,
			duration: form.duration,
			wait: form.wait
		});
	};
	Command.cases.moveElement.customSave = onSave;
	return { form, save: onSave, load };
}
