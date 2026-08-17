import '@app/legacy/module/command/moveCamera.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useMoveCameraCommandSchema() {
	const { form, save, load } = useCommandSchema('moveCamera', {
		onLoad() {
			getFocus($('#moveCamera-mode'));
		}
	});
	const onSave = (): void => {
		const mode = read($('#moveCamera-mode')) ?? form.mode;
		const easingId = read($('#moveCamera-easingId')) ?? form.easingId;
		const duration = read($('#moveCamera-duration')) ?? form.duration;
		const wait = read($('#moveCamera-wait')) ?? form.wait;
		switch (mode) {
			case 'position':
				Command.save?.({
					mode,
					position: read($('#moveCamera-position')) ?? form.position,
					easingId,
					duration,
					wait
				});
				break;
			case 'actor':
				Command.save?.({
					mode,
					actor: read($('#moveCamera-actor')) ?? form.actor,
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
