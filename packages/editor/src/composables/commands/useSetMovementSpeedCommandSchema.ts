import '@app/legacy/module/command/setMovementSpeed.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetMovementSpeedCommandSchema() {
	const { form, save, load } = useCommandSchema('setMovementSpeed', {
		onLoad() {
			getFocus($('#setMovementSpeed-actor'));
		}
	});
	const onSave = (): void => {
		const actor = read($('#setMovementSpeed-actor')) ?? form.actor;
		const property = read($('#setMovementSpeed-property')) ?? form.property;
		switch (property) {
			case 'base':
				Command.save?.({
					actor,
					property,
					base: read($('#setMovementSpeed-base')) ?? form.base
				});
				break;
			case 'factor':
			case 'factor-temp':
				Command.save?.({
					actor,
					property,
					factor: read($('#setMovementSpeed-factor')) ?? form.factor
				});
				break;
		}
	};
	Command.cases.setMovementSpeed.customSave = onSave;
	return { form, save: onSave, load };
}
