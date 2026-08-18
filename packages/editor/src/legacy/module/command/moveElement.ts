import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { TransformProperty } from '@app/legacy/command/move-element-property-window.ts';
import { Data } from '@app/legacy/data/data-object.ts';
import { CommandSchema } from './schema.ts';
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
