import '@/module/command/translateActor.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useTranslateActorCommandSchema() {
	const { form, save, load } = useCommandSchema('translateActor', {
		onLoad() {
			getFocus($('#translateActor-actor'));
		}
	});
	const onSave = (): void => {
		const distance = read($('#translateActor-distance')) ?? form.distance;
		if (distance === 0) {
			getFocus($('#translateActor-distance'), 'all');
			return;
		}
		Command.save!({
			actor: read($('#translateActor-actor')) ?? form.actor,
			angle: read($('#translateActor-angle')) ?? form.angle,
			distance,
			easingId: read($('#translateActor-easingId')) ?? form.easingId,
			duration: read($('#translateActor-duration')) ?? form.duration,
			wait: read($('#translateActor-wait')) ?? form.wait
		});
	};
	Command.cases.translateActor.customSave = onSave;
	return { form, save: onSave, load };
}
