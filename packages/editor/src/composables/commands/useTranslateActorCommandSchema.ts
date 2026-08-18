import '@app/legacy/module/command/translateActor.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useTranslateActorCommandSchema() {
	const { form, save, load } = useCommandSchema('translateActor', {
		onLoad() {
			getFocus(document.getElementById('translateActor-actor'));
		}
	});
	const onSave = (): void => {
		const distance = read(document.getElementById('translateActor-distance')) ?? form.distance;
		if (distance === 0) {
			getFocus(document.getElementById('translateActor-distance'), 'all');
			return;
		}
		Command.save!({
			actor: read(document.getElementById('translateActor-actor')) ?? form.actor,
			angle: read(document.getElementById('translateActor-angle')) ?? form.angle,
			distance,
			easingId: read(document.getElementById('translateActor-easingId')) ?? form.easingId,
			duration: read(document.getElementById('translateActor-duration')) ?? form.duration,
			wait: read(document.getElementById('translateActor-wait')) ?? form.wait
		});
	};
	Command.cases.translateActor.customSave = onSave;
	return { form, save: onSave, load };
}
