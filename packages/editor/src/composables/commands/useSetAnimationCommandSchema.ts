/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { AnimationProperty } from '@app/commands/property-window/set-animation-property-window.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string) => getYamiI18n().global.t(key);
import { getFocus, read } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.setAnimation = new CommandSchema({
	name: 'setAnimation',
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
			words.push(AnimationProperty.parse!(property));
		}
		return [
			{ color: 'element' },
			{ text: t('command.setAnimation') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetAnimationCommandSchema() {
	const { form, save, load } = useCommandSchema('setAnimation', {
		onLoad() {
			getFocus(document.getElementById('setAnimation-element'));
		}
	});
	const onSave = (): void => {
		const properties =
			read(document.getElementById('setAnimation-properties')) ?? form.properties;
		if (properties.length === 0) {
			getFocus(document.getElementById('setAnimation-properties'));
			return;
		}
		save();
	};
	Command.cases.setAnimation.customSave = onSave;
	return { form, save: onSave, load };
}
