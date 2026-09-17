import { getElementWriter } from '@app/utils/dom';
import { inspectorEls } from './element-registry.ts';
import { clear, read, write } from '@app/utils/element-utils';
import { Animation } from '@app/animation/animation-window.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { radians } from '@app/utils/math';

{
	interface SceneAnimationData {
		player: {
			angle: number;
			rotatable: boolean;
			rotation: number;
			restart(): void;
			setAngle(angle: number): void;
			setMotion(value: unknown): boolean;
			setOpacity(value: unknown): void;
			setScale(value: unknown): void;
			setSpeed(value: unknown): void;
		};
		[k: string]: unknown;
	}
	interface SceneAnimationShape {
		target: SceneAnimationData | null;
		update: ((animation: SceneAnimationData, key: string, value: unknown) => void) | null;
		animationIdWrite: ((event: { value: string }) => void) | null;
		[k: string]: unknown;
	}
	const SceneAnimation: SceneAnimationShape = {
		owner: Scene,
		target: null,
		nameBox: null,
		motions: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		write: null,
		update: null,
		animationIdWrite: null
	};

	SceneAnimation.initialize = function () {};

	SceneAnimation.create = function (this: typeof SceneAnimation) {
		return {
			class: 'animation',
			name: 'Animation',
			enabled: true,
			hidden: false,
			locked: false,
			presetId: '',
			animationId: '',
			motion: '',
			rotatable: false,
			x: 0,
			y: 0,
			angle: 0,
			scale: 1,
			speed: 1,
			opacity: 1,
			priority: 0,
			conditions: [],
			events: [],
			scripts: []
		};
	};

	SceneAnimation.open = function (this: typeof SceneAnimation, animation: SceneAnimationData) {
		if (this.target !== animation) {
			this.target = animation;

			const write = getElementWriter('sceneAnimation', animation);
			write('conditions');
			write('events');
			write('scripts');
			(
				inspectorEls.get('sceneAnimation-vue-mount') as unknown as HTMLElement & {
					sync?: () => void;
				}
			)?.sync?.();
		}
	};

	SceneAnimation.close = function (this: typeof SceneAnimation) {
		if (this.target) {
			Scene.list.unselect(this.target);
			Scene.updateTarget!();
			this.target = null;
			this.motions = null;
			clear(inspectorEls.get('sceneAnimation-conditions'));
			clear(inspectorEls.get('sceneAnimation-events'));
			clear(inspectorEls.get('sceneAnimation-scripts'));
			clear(inspectorEls.get('sceneAnimation-parameter-pane'));
		}
	};

	SceneAnimation.write = function (
		this: typeof SceneAnimation,
		_options: Record<string, unknown>
	) {
		(
			inspectorEls.get('sceneAnimation-vue-mount') as unknown as HTMLElement & {
				sync?: () => void;
			}
		)?.sync?.();
	};

	SceneAnimation.update = function (
		this: typeof SceneAnimation,
		animation: SceneAnimationData,
		key: string,
		value: unknown
	) {
		Scene.planToSave!();
		switch (key) {
			case 'name':
				if (animation.name !== value) {
					animation.name = value;
					Scene.updateTargetInfo!();
					Scene.list.updateItemName(animation);
				}
				break;
			case 'animationId':
				if (animation.animationId !== value) {
					animation.animationId = value;
					SceneAnimation.motions = null;
					Scene.destroyObjectContext!(animation);
					Scene.loadAnimationContext!(animation);
				}
				break;
			case 'motion':
				if (animation.motion !== value) {
					animation.motion = value;
					if (animation.player.setMotion(value)) {
						animation.player.restart();
					}
				}
				break;
			case 'rotatable':
				if (animation.rotatable !== value) {
					animation.rotatable = value;
					animation.player.rotatable = value as boolean;
					animation.player.rotation = 0;
					animation.player.setAngle(animation.player.angle);
				}
				break;
			case 'x':
			case 'y':
			case 'priority':
				if (animation[key] !== value) {
					animation[key] = value;
				}
				break;
			case 'angle':
				if (animation.angle !== value) {
					animation.angle = value;
					animation.player.setAngle(radians(value as number));
				}
				break;
			case 'scale':
				if (animation.scale !== value) {
					animation.scale = value;
					animation.player.setScale(value);
				}
				break;
			case 'speed':
				if (animation.speed !== value) {
					animation.speed = value;
					animation.player.setSpeed(value);
				}
				break;
			case 'opacity':
				if (animation.opacity !== value) {
					animation.opacity = value;
					animation.player.setOpacity(value);
				}
				break;
		}
		Scene.requestRendering!();
	};

	SceneAnimation.animationIdWrite = function (
		this: typeof SceneAnimation,
		event: { value: string }
	) {
		const elMotion = inspectorEls.get('sceneAnimation-motion') as unknown as unknown as
			| (HTMLElement & { loadItems?: (items: unknown[]) => void })
			| null;
		const items = Animation.getMotionListItems!(event.value);
		elMotion?.loadItems?.(items);
		if (elMotion) {
			write(elMotion, read(elMotion) ?? items[0].value);
		}
	};

	Inspector.sceneAnimation = SceneAnimation;
}
