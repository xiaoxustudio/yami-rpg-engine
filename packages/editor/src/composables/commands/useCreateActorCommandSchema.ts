import '@app/legacy/module/command/createActor.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useCreateActorCommandSchema() {
	const { form, save, load } = useCommandSchema('createActor', {
		onLoad() {
			getFocus($('#createActor-actorId'), 'all');
		}
	});
	const onSave = (): void => {
		const actorId = read($('#createActor-actorId')) ?? form.actorId;
		if (actorId === '') {
			getFocus($('#createActor-actorId'));
			return;
		}
		Command.save!({
			actorId,
			teamId: read($('#createActor-teamId')) ?? form.teamId,
			position: read($('#createActor-position')) ?? form.position,
			angle: read($('#createActor-angle')) ?? form.angle
		});
	};
	Command.cases.createActor.customSave = onSave;
	return { form, save: onSave, load };
}
