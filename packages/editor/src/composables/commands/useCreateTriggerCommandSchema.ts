import '@app/legacy/module/command/createTrigger.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useCreateTriggerCommandSchema() {
	const { form, save, load, commit } = useCommandSchema('createTrigger', {
		onLoad() {
			getFocus(document.getElementById('createTrigger-triggerId'));
		}
	});
	const onSave = (): void => {
		const triggerId =
			read(document.getElementById('createTrigger-triggerId')) ?? form.triggerId;
		if (triggerId === '') {
			getFocus(document.getElementById('createTrigger-triggerId'));
			return;
		}
		commit({
			triggerId,
			caster: read(document.getElementById('createTrigger-caster')) ?? form.caster,
			origin: read(document.getElementById('createTrigger-origin')) ?? form.origin,
			angle: read(document.getElementById('createTrigger-angle')) ?? form.angle,
			distance: read(document.getElementById('createTrigger-distance')) ?? form.distance,
			scale: read(document.getElementById('createTrigger-scale')) ?? form.scale,
			timeScale: read(document.getElementById('createTrigger-timeScale')) ?? form.timeScale
		});
	};
	Command.cases.createTrigger.customSave = onSave;
	return { form, save: onSave, load };
}
