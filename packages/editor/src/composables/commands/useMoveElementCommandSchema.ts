import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { TransformProperty } from '@app/commands/property-window/move-element-property-window.ts';
import { Data } from '@app/legacy/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

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
	const { form, save, load, commit } = useCommandSchema('moveElement', {
		onLoad() {
			getFocus(document.getElementById('moveElement-element')!);
		}
	});
	const onSave = (): void => {
		const properties =
			read(document.getElementById('moveElement-properties')!) ?? form.properties;
		if (properties.length === 0) {
			getFocus(document.getElementById('moveElement-properties')!);
			return;
		}
		commit({
			element: read(document.getElementById('moveElement-element')!) ?? form.element,
			properties,
			easingId: read(document.getElementById('moveElement-easingId')!) ?? form.easingId,
			duration: read(document.getElementById('moveElement-duration')!) ?? form.duration,
			wait: read(document.getElementById('moveElement-wait')!) ?? form.wait
		});
	};
	Command.cases.moveElement.customSave = onSave;
	return { form, save: onSave, load };
}
