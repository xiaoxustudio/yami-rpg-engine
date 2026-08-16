import '@/module/command/playAnimation.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Animation } from '@/animation/animation-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function usePlayAnimationCommandSchema() {
	const { form, save, load } = useCommandSchema('playAnimation', {
		onLoad() {
			getFocus($('#playAnimation-mode'));
		}
	});
	const writeHandler = (event: { value: string }): void => {
		const elMotion = $('#playAnimation-motion');
		elMotion?.loadItems?.(Animation.getMotionListItems!(event.value));
		elMotion?.write2?.(read(elMotion));
	};
	const onSave = (): void => {
		const mode = read($('#playAnimation-mode')) ?? form.mode;
		const animationId = read($('#playAnimation-animationId')) ?? form.animationId;
		const motion = read($('#playAnimation-motion')) ?? form.motion;
		const rotatable = read($('#playAnimation-rotatable')) ?? form.rotatable;
		const priority = read($('#playAnimation-priority')) ?? form.priority;
		const offsetY = read($('#playAnimation-offsetY')) ?? form.offsetY;
		const angle = read($('#playAnimation-angle')) ?? form.angle;
		const speed = read($('#playAnimation-speed')) ?? form.speed;
		const wait = read($('#playAnimation-wait')) ?? form.wait;
		if (animationId === '') {
			getFocus($('#playAnimation-animationId'));
			return;
		}
		if (motion === '') {
			getFocus($('#playAnimation-motion'));
			return;
		}
		switch (mode) {
			case 'position':
				Command.save?.({
					mode,
					position: read($('#playAnimation-position')) ?? form.position,
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
				Command.save?.({
					mode,
					actor: read($('#playAnimation-actor')) ?? form.actor,
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
