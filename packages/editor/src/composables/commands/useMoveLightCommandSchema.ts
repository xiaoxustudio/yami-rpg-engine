import '@app/legacy/module/command/moveLight.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useMoveLightCommandSchema() {
	const { form, save, load } = useCommandSchema('moveLight', {
		onLoad() {
			getFocus(document.getElementById('moveLight-light')!);
		}
	});
	const onSave = (): void => {
		const properties =
			read(document.getElementById('moveLight-properties')!) ?? form.properties;
		if (properties.length === 0) {
			getFocus(document.getElementById('moveLight-properties')!);
			return;
		}
		Command.save!({
			light: read(document.getElementById('moveLight-light')!) ?? form.light,
			properties,
			easingId: read(document.getElementById('moveLight-easingId')!) ?? form.easingId,
			duration: read(document.getElementById('moveLight-duration')!) ?? form.duration,
			wait: read(document.getElementById('moveLight-wait')!) ?? form.wait
		});
	};
	Command.cases.moveLight.customSave = onSave;
	return { form, save: onSave, load };
}
