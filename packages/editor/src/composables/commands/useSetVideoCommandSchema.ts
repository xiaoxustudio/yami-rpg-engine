import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { VideoProperty } from '@app/commands/property-window/set-video-property-window.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus, read } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

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

export function useSetVideoCommandSchema() {
	const { form, save, load } = useCommandSchema('setVideo', {
		onLoad() {
			getFocus(document.getElementById('setVideo-element'));
		}
	});
	const onSave = (): void => {
		const properties = read(document.getElementById('setVideo-properties')) ?? form.properties;
		if (properties.length === 0) {
			getFocus(document.getElementById('setVideo-properties'));
			return;
		}
		save();
	};
	Command.cases.setVideo.customSave = onSave;
	return { form, save: onSave, load };
}
