import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { ImageProperty } from '@app/legacy/command/set-image-property-window.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

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
