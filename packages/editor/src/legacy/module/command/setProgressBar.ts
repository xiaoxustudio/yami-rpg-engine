import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { ProgressBarProperty } from '@app/legacy/command/set-progress-property-window.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

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
