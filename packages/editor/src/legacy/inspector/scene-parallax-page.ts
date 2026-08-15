import { $, getElementWriter } from '@/util/dom.ts';
import { clear, write } from '@/util/element-utils';
import { Inspector } from './inspector.ts';
import { Scene } from '@/scene/scene-window.ts';
import { ConditionListInterface } from '@/tools/condition-list.ts';
import { EventListInterface } from '@/tools/event-list.ts';
import { ScriptListInterface } from '@/tools/script-list.ts';

{
	interface SceneParallaxShape {
		target: SceneParallaxData | null;
		update: ((parallax: SceneParallaxData, key: string, value: unknown) => void) | null;
		[k: string]: unknown;
	}
	interface SceneParallaxData {
		player: {
			destroy(): void;
			loadTexture(): void;
			shiftX: number;
			shiftY: number;
		};
		tint: Record<string, unknown>;
		[k: string]: unknown;
	}
	const SceneParallax: SceneParallaxShape = {
		owner: Scene,
		target: null,
		nameBox: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		write: null,
		update: null
	};

	SceneParallax.initialize = function (this: typeof SceneParallax) {
		if (!$('#sceneParallax-name')) return;
		this.nameBox = $('#sceneParallax-name');
		$('#sceneParallax-layer')?.loadItems?.([
			{ name: 'Background', value: 'background' },
			{ name: 'Foreground', value: 'foreground' }
		]);

		$('#sceneParallax-light')?.loadItems?.([
			{ name: 'Raw', value: 'raw' },
			{ name: 'Global Sampling', value: 'global' },
			{ name: 'Anchor Sampling', value: 'anchor' },
			{ name: 'Ambient Light', value: 'ambient' }
		]);

		$('#sceneParallax-blend')?.loadItems?.([
			{ name: 'Normal', value: 'normal' },
			{ name: 'Additive', value: 'additive' },
			{ name: 'Subtract', value: 'subtract' }
		]);

		$('#sceneParallax-tint-0-slider')?.synchronize?.($('#sceneParallax-tint-0'));
		$('#sceneParallax-tint-1-slider')?.synchronize?.($('#sceneParallax-tint-1'));
		$('#sceneParallax-tint-2-slider')?.synchronize?.($('#sceneParallax-tint-2'));
		$('#sceneParallax-tint-3-slider')?.synchronize?.($('#sceneParallax-tint-3'));

		$('#sceneParallax-conditions')?.bind?.(new ConditionListInterface(this, Scene));

		$('#sceneParallax-events')?.bind?.(new EventListInterface(this, Scene));

		$('#sceneParallax-scripts')?.bind?.(
			new ScriptListInterface(this as unknown as { target?: { id: string } }, Scene)
		);

		$('#sceneParallax-parameter-pane')?.bind?.($('#sceneParallax-scripts'));

		const elements = document.querySelectorAll(`#sceneParallax-name,
    #sceneParallax-image, #sceneParallax-layer, #sceneParallax-order,
    #sceneParallax-light, #sceneParallax-blend,
    #sceneParallax-opacity, #sceneParallax-x, #sceneParallax-y,
    #sceneParallax-scaleX, #sceneParallax-scaleY,
    #sceneParallax-repeatX, #sceneParallax-repeatY,
    #sceneParallax-anchorX, #sceneParallax-anchorY,
    #sceneParallax-offsetX, #sceneParallax-offsetY,
    #sceneParallax-parallaxFactorX, #sceneParallax-parallaxFactorY,
    #sceneParallax-shiftSpeedX, #sceneParallax-shiftSpeedY,
    #sceneParallax-tint-0, #sceneParallax-tint-1,
    #sceneParallax-tint-2, #sceneParallax-tint-3`);
		const sliders = document.querySelectorAll(`
    #sceneParallax-tint-0-slider, #sceneParallax-tint-1-slider,
    #sceneParallax-tint-2-slider, #sceneParallax-tint-3-slider`);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('focus', Inspector.inputFocus)
		);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('blur', Inspector.inputBlur!(this, Scene))
		);
		(sliders as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('focus', Inspector.sliderFocus)
		);
		(sliders as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('blur', Inspector.sliderBlur)
		);
		document
			.querySelectorAll(
				'#sceneParallax-conditions, #sceneParallax-events, #sceneParallax-scripts'
			)
			.forEach((el) => el.addEventListener('change', Scene.listChange));
	};

	SceneParallax.create = function (this: typeof SceneParallax) {
		return {
			class: 'parallax',
			name: 'Parallax',
			enabled: true,
			hidden: false,
			locked: false,
			presetId: '',
			image: '',
			layer: 'foreground',
			order: 0,
			light: 'raw',
			blend: 'normal',
			opacity: 1,
			x: 0,
			y: 0,
			scaleX: 1,
			scaleY: 1,
			repeatX: 1,
			repeatY: 1,
			anchorX: 0,
			anchorY: 0,
			offsetX: 0,
			offsetY: 0,
			parallaxFactorX: 1,
			parallaxFactorY: 1,
			shiftSpeedX: 0,
			shiftSpeedY: 0,
			tint: [0, 0, 0, 0],
			conditions: [],
			events: [],
			scripts: []
		};
	};

	SceneParallax.open = function (this: typeof SceneParallax, parallax: SceneParallaxData) {
		if (this.target !== parallax) {
			this.target = parallax;

			const write = getElementWriter('sceneParallax', parallax);
			write('conditions');
			write('events');
			write('scripts');
			($('#sceneParallax-vue-mount') as HTMLElement & { sync?: () => void })?.sync?.();
		}
	};

	SceneParallax.close = function (this: typeof SceneParallax) {
		if (this.target) {
			Scene.list.unselect(this.target);
			Scene.updateTarget!();
			this.target = null;
			clear($('#sceneParallax-conditions'));
			clear($('#sceneParallax-events'));
			clear($('#sceneParallax-scripts'));
			clear($('#sceneParallax-parameter-pane'));
		}
	};

	SceneParallax.write = function (this: typeof SceneParallax, options: Record<string, unknown>) {
		if (options.x !== undefined) {
			write($('#sceneParallax-x'), options.x);
		}
		if (options.y !== undefined) {
			write($('#sceneParallax-y'), options.y);
		}
	};

	SceneParallax.update = function (
		this: typeof SceneParallax,
		parallax: SceneParallaxData,
		key: string,
		value: unknown
	) {
		Scene.planToSave!();
		switch (key) {
			case 'name':
				if (parallax.name !== value) {
					parallax.name = value;
					Scene.updateTargetInfo!();
					Scene.list.updateItemName(parallax);
				}
				break;
			case 'image':
				if (parallax.image !== value) {
					parallax.image = value;
					parallax.player.destroy();
					parallax.player.loadTexture();
					Scene.list.update();
				}
				break;
			case 'layer':
			case 'order':
				if (parallax[key] !== value) {
					parallax[key] = value;
					Scene.loadObjects!();
				}
				break;
			case 'light':
			case 'blend':
			case 'opacity':
			case 'x':
			case 'y':
			case 'scaleX':
			case 'scaleY':
			case 'repeatX':
			case 'repeatY':
			case 'anchorX':
			case 'anchorY':
			case 'offsetX':
			case 'offsetY':
			case 'parallaxFactorX':
			case 'parallaxFactorY':
				if (parallax[key] !== value) {
					parallax[key] = value;
				}
				break;
			case 'shiftSpeedX':
				if (parallax.shiftSpeedX !== value) {
					parallax.shiftSpeedX = value;
					if (value === 0) {
						parallax.player.shiftX = 0;
					}
				}
				break;
			case 'shiftSpeedY':
				if (parallax.shiftSpeedY !== value) {
					parallax.shiftSpeedY = value;
					if (value === 0) {
						parallax.player.shiftY = 0;
					}
				}
				break;
			case 'tint-0':
			case 'tint-1':
			case 'tint-2':
			case 'tint-3': {
				const index = key.indexOf('-') + 1;
				const color = key.slice(index);
				if (parallax.tint[color] !== value) {
					parallax.tint[color] = value;
				}
				break;
			}
		}
		Scene.requestRendering!();
	};

	Inspector.sceneParallax = SceneParallax;
}
