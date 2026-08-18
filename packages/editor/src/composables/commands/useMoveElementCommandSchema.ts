import '@app/legacy/module/command/moveElement.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useMoveElementCommandSchema() {
	const { form, save, load } = useCommandSchema('moveElement', {
		onLoad() {
			getFocus(document.getElementById('moveElement-element')!);
		}
	});
	const onSave = (): void => {
		const properties =
			read(document.getElementById('moveElement-properties')!) ?? form.properties;
		if (properties.length === 0) {
			getFocus(document.getElementById('moveElement-properties')!);
			return;
		}
		Command.save?.({
			element: read(document.getElementById('moveElement-element')!) ?? form.element,
			properties,
			easingId: read(document.getElementById('moveElement-easingId')!) ?? form.easingId,
			duration: read(document.getElementById('moveElement-duration')!) ?? form.duration,
			wait: read(document.getElementById('moveElement-wait')!) ?? form.wait
		});
	};
	Command.cases.moveElement.customSave = onSave;
	return { form, save: onSave, load };
}
