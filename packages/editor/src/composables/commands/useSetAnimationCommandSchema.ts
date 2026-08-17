import '@app/legacy/module/command/setAnimation.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetAnimationCommandSchema() {
	const { form, save, load } = useCommandSchema('setAnimation', {
		onLoad() {
			getFocus($('#setAnimation-element'));
		}
	});
	const onSave = (): void => {
		const properties = read($('#setAnimation-properties')) ?? form.properties;
		if (properties.length === 0) {
			getFocus($('#setAnimation-properties'));
			return;
		}
		save();
	};
	Command.cases.setAnimation.customSave = onSave;
	return { form, save: onSave, load };
}
