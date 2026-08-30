/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string) => getYamiI18n().global.t(key);
import { getFocus, read } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.setMovementSpeed = new CommandSchema({
	name: 'setMovementSpeed',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'property', default: 'base' },
		{ key: 'base', default: 0 },
		{ key: 'factor', default: 0 }
	],
	customParse({
		actor,
		property,
		base,
		factor
	}: {
		actor: unknown;
		property: string;
		base: unknown;
		factor: unknown;
	}) {
		const label = t('command.setMovementSpeed.' + property);
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(label.replace('(', Token('(')).replace(')', Token(')')));
		switch (property) {
			case 'base':
				words.push(Command.parseVariableNumber!(base, 't/s'));
				break;
			case 'factor':
			case 'factor-temp':
				words.push(Command.parseVariableNumber!(factor));
				break;
		}
		return [
			{ color: 'actor' },
			{ text: t('command.setMovementSpeed') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetMovementSpeedCommandSchema() {
	const { form, load, commit } = useCommandSchema('setMovementSpeed', {
		onLoad() {
			getFocus(document.getElementById('setMovementSpeed-actor')!);
		}
	});
	const onSave = (): void => {
		const actor = read(document.getElementById('setMovementSpeed-actor')!) ?? form.actor;
		const property =
			read(document.getElementById('setMovementSpeed-property')!) ?? form.property;
		switch (property) {
			case 'base':
				commit({
					actor,
					property,
					base: read(document.getElementById('setMovementSpeed-base')!) ?? form.base
				});
				break;
			case 'factor':
			case 'factor-temp':
				commit({
					actor,
					property,
					factor: read(document.getElementById('setMovementSpeed-factor')!) ?? form.factor
				});
				break;
		}
	};
	Command.cases.setMovementSpeed.customSave = onSave;
	return { form, save: onSave, load };
}
