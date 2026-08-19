import '@app/legacy/module/command/setAnimationComponent.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { Animation } from '@app/legacy/animation/animation-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetAnimationComponentCommandSchema() {
	const { form, save, load } = useCommandSchema('setAnimationComponent', {
		onLoad() {
			getFocus(document.getElementById('setAnimationComponent-actor'));
		}
	});
	const onLoad = (params: Record<string, unknown>): void => {
		const animationId = (params.animationId ?? '') as string;
		if (animationId !== '') {
			document
				.getElementById('setAnimationComponent-motion')
				?.loadItems?.(Animation.getMotionListItems!(animationId));
			document
				.getElementById('setAnimationComponent-playMotion')
				?.loadItems?.(Animation.getMotionListItems!(animationId));
			document
				.getElementById('setAnimationComponent-spriteId')
				?.loadItems?.(Animation.getSpriteListItems!(animationId));
		}
		load(params);
	};
	const onSave = (): void => {
		const actor = read(document.getElementById('setAnimationComponent-actor')) ?? form.actor;
		const animationId =
			read(document.getElementById('setAnimationComponent-animationId')) ?? form.animationId;
		if (animationId === '') {
			getFocus(document.getElementById('setAnimationComponent-animationId'));
			return;
		}
		const motion = read(document.getElementById('setAnimationComponent-motion')) ?? form.motion;
		if (motion === '') {
			getFocus(document.getElementById('setAnimationComponent-motion'));
			return;
		}
		const operation =
			read(document.getElementById('setAnimationComponent-operation')) ?? form.operation;
		switch (operation) {
			case 'set-angle':
				Command.save?.({
					actor,
					animationId,
					motion,
					operation,
					angle:
						read(document.getElementById('setAnimationComponent-angle')) ?? form.angle
				});
				break;
			case 'set-scale':
				Command.save?.({
					actor,
					animationId,
					motion,
					operation,
					scale:
						read(document.getElementById('setAnimationComponent-scale')) ?? form.scale
				});
				break;
			case 'set-speed':
				Command.save?.({
					actor,
					animationId,
					motion,
					operation,
					speed:
						read(document.getElementById('setAnimationComponent-speed')) ?? form.speed
				});
				break;
			case 'set-opacity':
				Command.save?.({
					actor,
					animationId,
					motion,
					operation,
					opacity:
						read(document.getElementById('setAnimationComponent-opacity')) ??
						form.opacity
				});
				break;
			case 'set-priority':
				Command.save?.({
					actor,
					animationId,
					motion,
					operation,
					priority:
						read(document.getElementById('setAnimationComponent-priority')) ??
						form.priority
				});
				break;
			case 'set-offsetY':
				Command.save?.({
					actor,
					animationId,
					motion,
					operation,
					offsetY:
						read(document.getElementById('setAnimationComponent-offsetY')) ??
						form.offsetY
				});
				break;
			case 'set-sprite': {
				const spriteId =
					read(document.getElementById('setAnimationComponent-spriteId')) ??
					form.spriteId;
				if (spriteId === '') {
					getFocus(document.getElementById('setAnimationComponent-spriteId'));
					return;
				}
				Command.save?.({
					actor,
					animationId,
					motion,
					operation,
					spriteId,
					image:
						read(document.getElementById('setAnimationComponent-image')) ?? form.image
				});
				break;
			}
			case 'play-motion': {
				const playMotion =
					read(document.getElementById('setAnimationComponent-playMotion')) ??
					form.playMotion;
				if (playMotion === '') {
					getFocus(document.getElementById('setAnimationComponent-playMotion'));
					return;
				}
				Command.save?.({
					actor,
					animationId,
					motion,
					operation,
					playMotion,
					wait: read(document.getElementById('setAnimationComponent-wait')) ?? form.wait
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
