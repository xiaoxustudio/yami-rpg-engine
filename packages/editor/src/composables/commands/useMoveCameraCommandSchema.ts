import '@app/legacy/module/command/moveCamera.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useMoveCameraCommandSchema() {
	const { form, save, load } = useCommandSchema('moveCamera', {
		onLoad() {
			getFocus(document.getElementById('moveCamera-mode')!);
		}
	});
	const onSave = (): void => {
		const mode = read(document.getElementById('moveCamera-mode')!) ?? form.mode;
		const easingId = read(document.getElementById('moveCamera-easingId')!) ?? form.easingId;
		const duration = read(document.getElementById('moveCamera-duration')!) ?? form.duration;
		const wait = read(document.getElementById('moveCamera-wait')!) ?? form.wait;
		switch (mode) {
			case 'position':
				Command.save?.({
					mode,
					position:
						read(document.getElementById('moveCamera-position')!) ?? form.position,
					easingId,
					duration,
					wait
				});
				break;
			case 'actor':
				Command.save?.({
					mode,
					actor: read(document.getElementById('moveCamera-actor')!) ?? form.actor,
					easingId,
					duration,
					wait
				});
				break;
		}
	};
	Command.cases.moveCamera.customSave = onSave;
	return { form, save: onSave, load };
}
