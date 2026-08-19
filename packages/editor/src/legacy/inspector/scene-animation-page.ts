import { $, getElementWriter } from '@app/utils/dom';
import { clear, read, write } from '@app/utils/element-utils';
import { Animation } from '@app/legacy/animation/animation-window.ts';
import { Inspector } from './inspector.ts';
import { Scene } from '@app/legacy/scene/scene-window.ts';

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
			($('#sceneAnimation-vue-mount') as HTMLElement & { sync?: () => void })?.sync?.();
		}
	};

	SceneAnimation.close = function (this: typeof SceneAnimation) {
		if (this.target) {
			Scene.list.unselect(this.target);
			Scene.updateTarget!();
			this.target = null;
			this.motions = null;
			clear($('#sceneAnimation-conditions'));
			clear($('#sceneAnimation-events'));
			clear($('#sceneAnimation-scripts'));
			clear($('#sceneAnimation-parameter-pane'));
		}
	};

	SceneAnimation.write = function (
		this: typeof SceneAnimation,
		options: Record<string, unknown>
	) {
		if (options.x !== undefined) {
			write($('#sceneAnimation-x'), options.x);
		}
		if (options.y !== undefined) {
			write($('#sceneAnimation-y'), options.y);
		}
		if (options.angle !== undefined) {
			write($('#sceneAnimation-angle'), options.angle);
		}
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
					animation.player.setAngle(Math.radians(value as number));
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
		const elMotion = $('#sceneAnimation-motion') as
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
