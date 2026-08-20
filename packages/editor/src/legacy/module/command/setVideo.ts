import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { VideoProperty } from '@app/legacy/command/set-video-property-window.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.setVideo = new CommandSchema({
	name: 'setVideo',
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
			words.push(VideoProperty.parse!(property));
		}
		return [
			{ color: 'element' },
			{ text: t('command.setVideo') + Token(': ') },
			{ text: words.join() }
		];
	}
});
