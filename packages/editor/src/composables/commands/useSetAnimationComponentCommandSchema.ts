import '@/module/command/setAnimationComponent.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Animation } from '@/animation/animation-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetAnimationComponentCommandSchema() {
	const { form, save, load } = useCommandSchema('setAnimationComponent', {
		onLoad() {
			getFocus($('#setAnimationComponent-actor'));
		}
	});
	const onLoad = (params: Record<string, unknown>): void => {
		const animationId = (params.animationId ?? '') as string;
		if (animationId !== '') {
			$('#setAnimationComponent-motion')?.loadItems?.(
				Animation.getMotionListItems!(animationId)
			);
			$('#setAnimationComponent-playMotion')?.loadItems?.(
				Animation.getMotionListItems!(animationId)
			);
			$('#setAnimationComponent-spriteId')?.loadItems?.(
				Animation.getSpriteListItems!(animationId)
			);
		}
		load(params);
	};
	const onSave = (): void => {
		const actor = read($('#setAnimationComponent-actor')) ?? form.actor;
		const animationId = read($('#setAnimationComponent-animationId')) ?? form.animationId;
		if (animationId === '') {
			getFocus($('#setAnimationComponent-animationId'));
			return;
		}
		const motion = read($('#setAnimationComponent-motion')) ?? form.motion;
		if (motion === '') {
			getFocus($('#setAnimationComponent-motion'));
			return;
		}
		const operation = read($('#setAnimationComponent-operation')) ?? form.operation;
		switch (operation) {
			case 'set-angle':
				Command.save?.({
					actor,
					animationId,
					motion,
					operation,
					angle: read($('#setAnimationComponent-angle')) ?? form.angle
				});
				break;
			case 'set-scale':
				Command.save?.({
					actor,
					animationId,
					motion,
					operation,
					scale: read($('#setAnimationComponent-scale')) ?? form.scale
				});
				break;
			case 'set-speed':
				Command.save?.({
					actor,
					animationId,
					motion,
					operation,
					speed: read($('#setAnimationComponent-speed')) ?? form.speed
				});
				break;
			case 'set-opacity':
				Command.save?.({
					actor,
					animationId,
					motion,
					operation,
					opacity: read($('#setAnimationComponent-opacity')) ?? form.opacity
				});
				break;
			case 'set-priority':
				Command.save?.({
					actor,
					animationId,
					motion,
					operation,
					priority: read($('#setAnimationComponent-priority')) ?? form.priority
				});
				break;
			case 'set-offsetY':
				Command.save?.({
					actor,
					animationId,
					motion,
					operation,
					offsetY: read($('#setAnimationComponent-offsetY')) ?? form.offsetY
				});
				break;
			case 'set-sprite': {
				const spriteId = read($('#setAnimationComponent-spriteId')) ?? form.spriteId;
				if (spriteId === '') {
					getFocus($('#setAnimationComponent-spriteId'));
					return;
				}
				Command.save?.({
					actor,
					animationId,
					motion,
					operation,
					spriteId,
					image: read($('#setAnimationComponent-image')) ?? form.image
				});
				break;
			}
			case 'play-motion': {
				const playMotion = read($('#setAnimationComponent-playMotion')) ?? form.playMotion;
				if (playMotion === '') {
					getFocus($('#setAnimationComponent-playMotion'));
					return;
				}
				Command.save?.({
					actor,
					animationId,
					motion,
					operation,
					playMotion,
					wait: read($('#setAnimationComponent-wait')) ?? form.wait
				});
				break;
			}
			case 'stop-motion':
				Command.save?.({ actor, animationId, motion, operation });
				break;
		}
	};
	Command.cases.setAnimationComponent.customLoad = onLoad;
	Command.cases.setAnimationComponent.customSave = onSave;
	return { form, save: onSave, load: onLoad };
}
