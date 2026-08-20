import '@app/legacy/module/command/moveActor.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useMoveActorCommandSchema() {
	const { form, save, load, commit } = useCommandSchema('moveActor', {
		onLoad() {
			getFocus(document.getElementById('moveActor-actor')!);
		}
	});
	const onSave = (): void => {
		const actor = read(document.getElementById('moveActor-actor')!) ?? form.actor;
		const mode = read(document.getElementById('moveActor-mode')!) ?? form.mode;
		switch (mode) {
			case 'stop':
				commit({ actor, mode });
				break;
			case 'keep':
				commit({
					actor,
					mode,
					angle: read(document.getElementById('moveActor-angle')!) ?? form.angle
				});
				break;
			case 'straight':
			case 'navigate':
			case 'navigate-bypass':
				commit({
					actor,
					mode,
					destination:
						read(document.getElementById('moveActor-destination')!) ?? form.destination,
					wait: read(document.getElementById('moveActor-wait')!) ?? form.wait
				});
				break;
			case 'teleport':
				commit({
					actor,
					mode,
					destination:
						read(document.getElementById('moveActor-destination')!) ?? form.destination
				});
				break;
		}
	};
	Command.cases.moveActor.customSave = onSave;
	return { form, save: onSave, load };
}
