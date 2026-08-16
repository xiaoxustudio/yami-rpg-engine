import '@/module/command/moveLight.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useMoveLightCommandSchema() {
	const { form, save, load } = useCommandSchema('moveLight', {
		onLoad() {
			getFocus($('#moveLight-light'));
		}
	});
	const onSave = (): void => {
		const properties = read($('#moveLight-properties')) ?? form.properties;
		if (properties.length === 0) {
			getFocus($('#moveLight-properties'));
			return;
		}
		Command.save!({
			light: read($('#moveLight-light')) ?? form.light,
			properties,
			easingId: read($('#moveLight-easingId')) ?? form.easingId,
			duration: read($('#moveLight-duration')) ?? form.duration,
			wait: read($('#moveLight-wait')) ?? form.wait
		});
	};
	Command.cases.moveLight.customSave = onSave;
	return { form, save: onSave, load };
}
