import '@app/legacy/module/command/playAnimation.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { Animation } from '@app/legacy/animation/animation-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function usePlayAnimationCommandSchema() {
	const { form, save, load, commit } = useCommandSchema('playAnimation', {
		onLoad() {
			getFocus(document.getElementById('playAnimation-mode')!);
		}
	});
	const writeHandler = (event: { value: string }): void => {
		const elMotion = document.getElementById('playAnimation-motion')!;
		elMotion?.loadItems?.(Animation.getMotionListItems!(event.value));
		elMotion?.write2?.(read(elMotion));
	};
	const onSave = (): void => {
		const mode = read(document.getElementById('playAnimation-mode')!) ?? form.mode;
		const animationId =
			read(document.getElementById('playAnimation-animationId')!) ?? form.animationId;
		const motion = read(document.getElementById('playAnimation-motion')!) ?? form.motion;
		const rotatable =
			read(document.getElementById('playAnimation-rotatable')!) ?? form.rotatable;
		const priority = read(document.getElementById('playAnimation-priority')!) ?? form.priority;
		const offsetY = read(document.getElementById('playAnimation-offsetY')!) ?? form.offsetY;
		const angle = read(document.getElementById('playAnimation-angle')!) ?? form.angle;
		const speed = read(document.getElementById('playAnimation-speed')!) ?? form.speed;
		const wait = read(document.getElementById('playAnimation-wait')!) ?? form.wait;
		if (animationId === '') {
			getFocus(document.getElementById('playAnimation-animationId')!);
			return;
		}
		if (motion === '') {
			getFocus(document.getElementById('playAnimation-motion')!);
			return;
		}
		switch (mode) {
			case 'position':
				commit({
					mode,
					position:
						read(document.getElementById('playAnimation-position')!) ?? form.position,
					animationId,
					motion,
					rotatable,
					priority,
					offsetY,
					angle,
					speed,
					wait
				});
				break;
			case 'actor':
				commit({
					mode,
					actor: read(document.getElementById('playAnimation-actor')!) ?? form.actor,
					animationId,
					motion,
					rotatable,
					priority,
					offsetY,
					angle,
					speed,
					wait
				});
				break;
		}
	};
	Command.cases.playAnimation.customSave = onSave;
	return { form, save: onSave, load, writeHandler };
}
