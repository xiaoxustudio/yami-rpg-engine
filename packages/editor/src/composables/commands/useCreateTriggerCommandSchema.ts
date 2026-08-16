import '@/module/command/createTrigger.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useCreateTriggerCommandSchema() {
	const { form, save, load } = useCommandSchema('createTrigger', {
		onLoad() {
			getFocus($('#createTrigger-triggerId'));
		}
	});
	const onSave = (): void => {
		const triggerId = read($('#createTrigger-triggerId')) ?? form.triggerId;
		if (triggerId === '') {
			getFocus($('#createTrigger-triggerId'));
			return;
		}
		Command.save?.({
			triggerId,
			caster: read($('#createTrigger-caster')) ?? form.caster,
			origin: read($('#createTrigger-origin')) ?? form.origin,
			angle: read($('#createTrigger-angle')) ?? form.angle,
			distance: read($('#createTrigger-distance')) ?? form.distance,
			scale: read($('#createTrigger-scale')) ?? form.scale,
			timeScale: read($('#createTrigger-timeScale')) ?? form.timeScale
		});
	};
	Command.cases.createTrigger.customSave = onSave;
	return { form, save: onSave, load };
}
