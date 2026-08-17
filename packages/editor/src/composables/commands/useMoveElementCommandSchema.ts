import '@app/legacy/module/command/moveElement.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useMoveElementCommandSchema() {
	const { form, save, load } = useCommandSchema('moveElement', {
		onLoad() {
			getFocus($('#moveElement-element'));
		}
	});
	const onSave = (): void => {
		const properties = read($('#moveElement-properties')) ?? form.properties;
		if (properties.length === 0) {
			getFocus($('#moveElement-properties'));
			return;
		}
		Command.save?.({
			element: read($('#moveElement-element')) ?? form.element,
			properties,
			easingId: read($('#moveElement-easingId')) ?? form.easingId,
			duration: read($('#moveElement-duration')) ?? form.duration,
			wait: read($('#moveElement-wait')) ?? form.wait
		});
	};
	Command.cases.moveElement.customSave = onSave;
	return { form, save: onSave, load };
}
