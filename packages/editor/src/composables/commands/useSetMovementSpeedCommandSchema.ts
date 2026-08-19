import '@app/legacy/module/command/setMovementSpeed.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetMovementSpeedCommandSchema() {
	const { form, save, load } = useCommandSchema('setMovementSpeed', {
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
				Command.save?.({
					actor,
					property,
					base: read(document.getElementById('setMovementSpeed-base')!) ?? form.base
				});
				break;
			case 'factor':
			case 'factor-temp':
				Command.save?.({
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
