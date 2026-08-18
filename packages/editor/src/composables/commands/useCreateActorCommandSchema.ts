import '@app/legacy/module/command/createActor.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useCreateActorCommandSchema() {
	const { form, save, load } = useCommandSchema('createActor', {
		onLoad() {
			getFocus(document.getElementById('createActor-actorId')!, 'all');
		}
	});
	const onSave = (): void => {
		const actorId = read(document.getElementById('createActor-actorId')!) ?? form.actorId;
		if (actorId === '') {
			getFocus(document.getElementById('createActor-actorId')!);
			return;
		}
		Command.save!({
			actorId,
			teamId: read(document.getElementById('createActor-teamId')!) ?? form.teamId,
			position: read(document.getElementById('createActor-position')!) ?? form.position,
			angle: read(document.getElementById('createActor-angle')!) ?? form.angle
		});
	};
	Command.cases.createActor.customSave = onSave;
	return { form, save: onSave, load };
}
