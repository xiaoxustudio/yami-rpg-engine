import { $, getElementReader } from '@/util/dom.ts';
import { on, read } from '@/util/element-utils';
import { Data } from '@/data/data-object.ts';
import { Inspector } from './inspector.ts';
import { Particle } from '@/particle/particle-window.ts';

{
	interface ParticleLayerShape {
		target: ParticleLayerData | null;
		paramInput: ((event: Event) => void) | null;
		update: ((layer: ParticleLayerData, key: string, value: unknown) => void) | null;
		[k: string]: unknown;
	}
	interface ParticleLayerData {
		area: {
			type?: unknown;
			x?: unknown;
			y?: unknown;
			width?: unknown;
			height?: unknown;
			radius?: unknown;
			[k: string]: unknown;
		};
		color: {
			mode?: unknown;
			rgba?: unknown[];
			min?: unknown[];
			max?: unknown[];
			easingId?: unknown;
			startMin?: unknown[];
			startMax?: unknown[];
			endMin?: unknown[];
			endMax?: unknown[];
			tint?: unknown[];
			[k: string]: unknown;
		};
		sprite: {
			mode?: unknown;
			hframes?: unknown;
			vframes?: unknown;
			interval?: unknown;
			[k: string]: unknown;
		};
		[k: string]: unknown;
	}
	const ParticleLayer: ParticleLayerShape = {
		owner: Particle,
		target: null,
		nameBox: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null
	};

	ParticleLayer.initialize = function (this: typeof ParticleLayer) {
		if (!$('#particleLayer-name')) return;
		this.nameBox = $('#particleLayer-name');
		$('#particleLayer-area-type')?.loadItems?.([
			{ name: 'Point', value: 'point' },
			{ name: 'Rectangle', value: 'rectangle' },
			{ name: 'Circle', value: 'circle' },
			{ name: 'Screen Edge', value: 'edge' }
		]);

		const elAreaType = $('#particleLayer-area-type');
		if (elAreaType)
			elAreaType.enableHiddenMode().relate([
				{
					case: 'point',
					targets: [$('#particleLayer-area-x'), $('#particleLayer-area-y')]
				},
				{
					case: 'rectangle',
					targets: [
						$('#particleLayer-area-x'),
						$('#particleLayer-area-y'),
						$('#particleLayer-area-width'),
						$('#particleLayer-area-height')
					]
				},
				{
					case: 'circle',
					targets: [
						$('#particleLayer-area-x'),
						$('#particleLayer-area-y'),
						$('#particleLayer-area-radius')
					]
				}
			]);

		$('#particleLayer-blend')?.loadItems?.([
			{ name: 'Normal', value: 'normal' },
			{ name: 'Additive', value: 'additive' },
			{ name: 'Subtract', value: 'subtract' }
		]);

		$('#particleLayer-light')?.loadItems?.([
			{ name: 'Raw', value: 'raw' },
			{ name: 'Global Sampling', value: 'global' },
			{ name: 'Ambient Light', value: 'ambient' }
		]);

		$('#particleLayer-sort')?.loadItems?.([
			{ name: 'Youngest in Front', value: 'youngest-in-front' },
			{ name: 'Oldest in Front', value: 'oldest-in-front' },
			{ name: 'By Scale Factor', value: 'by-scale-factor' }
		]);

		$('#particleLayer-sprite-mode')?.loadItems?.([
			{ name: 'Random', value: 'random' },
			{ name: 'Animation', value: 'animation' },
			{ name: 'Animation(Loop)', value: 'animation-loop' }
		]);

		const elSpriteMode = $('#particleLayer-sprite-mode');
		if (elSpriteMode)
			elSpriteMode.enableHiddenMode().relate([
				{
					case: ['animation', 'animation-loop'],
					targets: [$('#particleLayer-sprite-interval')]
				}
			]);

		$('#particleLayer-color-mode')?.loadItems?.([
			{ name: 'Fixed', value: 'fixed' },
			{ name: 'Random', value: 'random' },
			{ name: 'Easing', value: 'easing' },
			{ name: 'Texture Sampling', value: 'texture' }
		]);

		const elColorMode = $('#particleLayer-color-mode');
		if (elColorMode)
			elColorMode.enableHiddenMode().relate([
				{
					case: 'fixed',
					targets: [$('#particleLayer-color-rgba-box')]
				},
				{
					case: 'random',
					targets: [$('#particleLayer-color-min-box'), $('#particleLayer-color-max-box')]
				},
				{
					case: 'easing',
					targets: [
						$('#particleLayer-color-easingId'),
						$('#particleLayer-color-startMin-box'),
						$('#particleLayer-color-startMax-box'),
						$('#particleLayer-color-endMin-box'),
						$('#particleLayer-color-endMax-box')
					]
				},
				{
					case: 'texture',
					targets: [
						$('#particleLayer-color-tint-0-box'),
						$('#particleLayer-color-tint-1-box'),
						$('#particleLayer-color-tint-2-box'),
						$('#particleLayer-color-tint-3-box')
					]
				}
			]);

		$('#particleLayer-color-tint-0-slider')?.synchronize?.($('#particleLayer-color-tint-0'));
		$('#particleLayer-color-tint-1-slider')?.synchronize?.($('#particleLayer-color-tint-1'));
		$('#particleLayer-color-tint-2-slider')?.synchronize?.($('#particleLayer-color-tint-2'));
		$('#particleLayer-color-tint-3-slider')?.synchronize?.($('#particleLayer-color-tint-3'));

		const elements = document.querySelectorAll(`#particleLayer-name,
    #particleLayer-area-type, #particleLayer-area-x, #particleLayer-area-y,
    #particleLayer-area-width, #particleLayer-area-height, #particleLayer-area-radius,
    #particleLayer-count, #particleLayer-delay, #particleLayer-interval,
    #particleLayer-lifetime, #particleLayer-lifetimeDev, #particleLayer-fadeout,
    #particleLayer-anchor-x-0, #particleLayer-anchor-x-1,
    #particleLayer-anchor-y-0, #particleLayer-anchor-y-1,
    #particleLayer-anchor-speedX-0, #particleLayer-anchor-speedX-1,
    #particleLayer-anchor-speedY-0, #particleLayer-anchor-speedY-1,
    #particleLayer-movement-angle-0, #particleLayer-movement-angle-1,
    #particleLayer-movement-speed-0, #particleLayer-movement-speed-1,
    #particleLayer-movement-accelAngle-0, #particleLayer-movement-accelAngle-1,
    #particleLayer-movement-accel-0, #particleLayer-movement-accel-1,
    #particleLayer-rotation-angle-0, #particleLayer-rotation-angle-1,
    #particleLayer-rotation-speed-0, #particleLayer-rotation-speed-1,
    #particleLayer-rotation-accel-0, #particleLayer-rotation-accel-1,
    #particleLayer-hRotation-radius-0, #particleLayer-hRotation-radius-1,
    #particleLayer-hRotation-expansionSpeed-0, #particleLayer-hRotation-expansionSpeed-1,
    #particleLayer-hRotation-expansionAccel-0, #particleLayer-hRotation-expansionAccel-1,
    #particleLayer-hRotation-angle-0, #particleLayer-hRotation-angle-1,
    #particleLayer-hRotation-angularSpeed-0, #particleLayer-hRotation-angularSpeed-1,
    #particleLayer-hRotation-angularAccel-0, #particleLayer-hRotation-angularAccel-1,
    #particleLayer-scale-factor-0, #particleLayer-scale-factor-1,
    #particleLayer-scale-speed-0, #particleLayer-scale-speed-1,
    #particleLayer-scale-accel-0, #particleLayer-scale-accel-1,
    #particleLayer-image, #particleLayer-blend, #particleLayer-light,
    #particleLayer-sort, #particleLayer-sprite-mode,
    #particleLayer-sprite-hframes, #particleLayer-sprite-vframes, #particleLayer-sprite-interval,
    #particleLayer-color-mode,
    #particleLayer-color-rgba-0, #particleLayer-color-rgba-1,
    #particleLayer-color-rgba-2, #particleLayer-color-rgba-3,
    #particleLayer-color-min-0, #particleLayer-color-min-1,
    #particleLayer-color-min-2, #particleLayer-color-min-3,
    #particleLayer-color-max-0, #particleLayer-color-max-1,
    #particleLayer-color-max-2, #particleLayer-color-max-3,
    #particleLayer-color-easingId,
    #particleLayer-color-startMin-0, #particleLayer-color-startMin-1,
    #particleLayer-color-startMin-2, #particleLayer-color-startMin-3,
    #particleLayer-color-startMax-0, #particleLayer-color-startMax-1,
    #particleLayer-color-startMax-2, #particleLayer-color-startMax-3,
    #particleLayer-color-endMin-0, #particleLayer-color-endMin-1,
    #particleLayer-color-endMin-2, #particleLayer-color-endMin-3,
    #particleLayer-color-endMax-0, #particleLayer-color-endMax-1,
    #particleLayer-color-endMax-2, #particleLayer-color-endMax-3,
    #particleLayer-color-tint-0, #particleLayer-color-tint-1,
    #particleLayer-color-tint-2, #particleLayer-color-tint-3`);
		const sliders = document.querySelectorAll(`
    #particleLayer-color-tint-0-slider, #particleLayer-color-tint-1-slider,
    #particleLayer-color-tint-2-slider, #particleLayer-color-tint-3-slider`);
		const blurHandler = Inspector.inputBlur!(this, Particle);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			on(el, 'focus', Inspector.inputFocus)
		);
		(elements as unknown as HTMLElement[]).forEach((el) => on(el, 'blur', blurHandler));
		(sliders as unknown as HTMLElement[]).forEach((el) =>
			on(el, 'focus', Inspector.sliderFocus)
		);
		(sliders as unknown as HTMLElement[]).forEach((el) => on(el, 'blur', Inspector.sliderBlur));
	};

	ParticleLayer.create = function (this: typeof ParticleLayer) {
		return {
			class: 'particle',
			name: 'Layer',
			hidden: false,
			locked: false,
			area: {
				type: 'point',
				x: 0,
				y: 0
			},
			count: 0,
			delay: 0,
			interval: 40,
			lifetime: 1000,
			lifetimeDev: 0,
			fadeout: 200,
			anchor: {
				x: [0, 0],
				y: [0, 0],
				speedX: [0, 0],
				speedY: [0, 0]
			},
			movement: {
				angle: [0, 0],
				speed: [0, 0],
				accelAngle: [0, 0],
				accel: [0, 0]
			},
			rotation: {
				angle: [0, 0],
				speed: [0, 0],
				accel: [0, 0]
			},
			hRotation: {
				radius: [0, 0],
				expansionSpeed: [0, 0],
				expansionAccel: [0, 0],
				angle: [0, 0],
				angularSpeed: [0, 0],
				angularAccel: [0, 0]
			},
			scale: {
				factor: [1, 1],
				speed: [0, 0],
				accel: [0, 0]
			},
			image: '',
			blend: 'additive',
			light: 'raw',
			sort: 'youngest-in-front',
			sprite: {
				mode: 'random',
				hframes: 1,
				vframes: 1,
				interval: 100
			},
			color: {
				mode: 'texture',
				tint: [0, 0, 0, 0]
			}
		};
	};

	ParticleLayer.open = function (this: typeof ParticleLayer, layer: ParticleLayerData) {
		if (this.target !== layer) {
			this.target = layer;

			$('#particleLayer-color-easingId').loadItems(Data.createEasingItems!());
			this.easingDefaultId = Data.easings[0].id;

			($('#particleLayer-vue-mount') as HTMLElement & { sync?: () => void })?.sync?.();
		}
	};

	ParticleLayer.close = function (this: typeof ParticleLayer) {
		if (this.target) {
			Particle.list.unselect!(this.target);
			Particle.updateTarget!();
			this.target = null;
		}
	};

	ParticleLayer.update = function (
		this: typeof ParticleLayer,
		layer: ParticleLayerData,
		key: string,
		value: unknown
	) {
		const layerInstance = Particle.emitter.getLayer(layer);
		Particle.planToSave!();
		switch (key) {
			case 'name':
				if (layer.name !== value) {
					layer.name = value;
					Particle.updateParticleInfo!();
					Particle.list.updateItemName!(layer);
				}
				break;
			case 'area-type': {
				const { area } = layer;
				if (area.type !== value) {
					area.type = value;
					delete area.x;
					delete area.y;
					delete area.width;
					delete area.height;
					delete area.radius;
					const read = getElementReader('particleLayer-area');
					switch (value) {
						case 'point':
							area.x = read('x');
							area.y = read('y');
							break;
						case 'rectangle':
							area.x = read('x');
							area.y = read('y');
							area.width = read('width');
							area.height = read('height');
							break;
						case 'circle':
							area.x = read('x');
							area.y = read('y');
							area.radius = read('radius');
							break;
						case 'edge':
							break;
					}
					layerInstance.updateElementMethods();
					Particle.computeOuterRect!();
				}
				break;
			}
			case 'area-x':
			case 'area-y':
			case 'area-width':
			case 'area-height':
			case 'area-radius': {
				const { area } = layer;
				const index = key.indexOf('-') + 1;
				const property = key.slice(index);
				if (area[property] !== value) {
					area[property] = value;
					Particle.computeOuterRect!();
				}
				break;
			}
			case 'count':
				if (layer.count !== value) {
					layer.count = value;
					layerInstance.updateCount();
					layerInstance.clear();
				}
				break;
			case 'delay':
				if (layer.delay !== value) {
					layer.delay = value;
					layerInstance.clear();
				}
				break;
			case 'interval':
				if (layer.interval !== value) {
					layer.interval = value;
					if (layerInstance.elapsed >= (value as number)) {
						layerInstance.elapsed = 0;
					}
					if (value === 0) {
						layerInstance.clear();
					}
				}
				break;
			case 'lifetime':
			case 'lifetimeDev':
				if (layer[key] !== value) {
					layer[key] = value;
					layerInstance.clear();
				}
				break;
			case 'fadeout':
				if (layer.fadeout !== value) {
					layer.fadeout = value;
				}
				break;
			case 'image':
				if (layer.image !== value) {
					layer.image = value;
					layerInstance.loadTexture();
					Particle.list.update();
				}
				break;
			case 'blend':
			case 'light':
			case 'sort':
				if (layer[key] !== value) {
					layer[key] = value;
				}
				break;
			case 'sprite-hframes':
			case 'sprite-vframes': {
				const { sprite } = layer;
				const property = key.split('-')[1];
				if (sprite[property] !== value) {
					sprite[property] = value;
					layerInstance.calculateElementSize();
					layerInstance.resizeElementIndices();
					Particle.list.update();
				}
				break;
			}
			case 'color-mode': {
				const { color } = layer;
				if (color.mode !== value) {
					color.mode = value;
					delete color.rgba;
					delete color.min;
					delete color.max;
					delete color.easingId;
					delete color.startMin;
					delete color.startMax;
					delete color.endMin;
					delete color.endMax;
					delete color.tint;
					const read = getElementReader('particleLayer-color');
					switch (value) {
						case 'fixed':
							color.rgba = [
								read('rgba-0'),
								read('rgba-1'),
								read('rgba-2'),
								read('rgba-3')
							];
							break;
						case 'random':
							color.min = [
								read('min-0'),
								read('min-1'),
								read('min-2'),
								read('min-3')
							];
							color.max = [
								read('max-0'),
								read('max-1'),
								read('max-2'),
								read('max-3')
							];
							break;
						case 'easing':
							color.easingId = read('easingId');
							color.startMin = [
								read('startMin-0'),
								read('startMin-1'),
								read('startMin-2'),
								read('startMin-3')
							];
							color.startMax = [
								read('startMax-0'),
								read('startMax-1'),
								read('startMax-2'),
								read('startMax-3')
							];
							color.endMin = [
								read('endMin-0'),
								read('endMin-1'),
								read('endMin-2'),
								read('endMin-3')
							];
							color.endMax = [
								read('endMax-0'),
								read('endMax-1'),
								read('endMax-2'),
								read('endMax-3')
							];
							layerInstance.updateEasing();
							break;
						case 'texture':
							color.tint = [
								read('tint-0'),
								read('tint-1'),
								read('tint-2'),
								read('tint-3')
							];
							break;
					}
					layerInstance.updateElementMethods();
				}
				break;
			}
			case 'color-easingId': {
				const { color } = layer;
				if (color.easingId !== value) {
					color.easingId = value;
					layerInstance.updateEasing();
				}
				break;
			}
			case 'sprite-mode':
			case 'sprite-interval':
			case 'anchor-x-0':
			case 'anchor-x-1':
			case 'anchor-y-0':
			case 'anchor-y-1':
			case 'anchor-speedX-0':
			case 'anchor-speedX-1':
			case 'anchor-speedY-0':
			case 'anchor-speedY-1':
			case 'movement-angle-0':
			case 'movement-angle-1':
			case 'movement-speed-0':
			case 'movement-speed-1':
			case 'movement-accelAngle-0':
			case 'movement-accelAngle-1':
			case 'movement-accel-0':
			case 'movement-accel-1':
			case 'rotation-angle-0':
			case 'rotation-angle-1':
			case 'rotation-speed-0':
			case 'rotation-speed-1':
			case 'rotation-accel-0':
			case 'rotation-accel-1':
			case 'hRotation-radius-0':
			case 'hRotation-radius-1':
			case 'hRotation-expansionSpeed-0':
			case 'hRotation-expansionSpeed-1':
			case 'hRotation-expansionAccel-0':
			case 'hRotation-expansionAccel-1':
			case 'hRotation-angle-0':
			case 'hRotation-angle-1':
			case 'hRotation-angularSpeed-0':
			case 'hRotation-angularSpeed-1':
			case 'hRotation-angularAccel-0':
			case 'hRotation-angularAccel-1':
			case 'scale-factor-0':
			case 'scale-factor-1':
			case 'scale-speed-0':
			case 'scale-speed-1':
			case 'scale-accel-0':
			case 'scale-accel-1':
			case 'color-rgba-0':
			case 'color-rgba-1':
			case 'color-rgba-2':
			case 'color-rgba-3':
			case 'color-min-0':
			case 'color-min-1':
			case 'color-min-2':
			case 'color-min-3':
			case 'color-max-0':
			case 'color-max-1':
			case 'color-max-2':
			case 'color-max-3':
			case 'color-startMin-0':
			case 'color-startMin-1':
			case 'color-startMin-2':
			case 'color-startMin-3':
			case 'color-startMax-0':
			case 'color-startMax-1':
			case 'color-startMax-2':
			case 'color-startMax-3':
			case 'color-endMin-0':
			case 'color-endMin-1':
			case 'color-endMin-2':
			case 'color-endMin-3':
			case 'color-endMax-0':
			case 'color-endMax-1':
			case 'color-endMax-2':
			case 'color-endMax-3':
			case 'color-tint-0':
			case 'color-tint-1':
			case 'color-tint-2':
			case 'color-tint-3': {
				const keys = key.split('-');
				const last = keys.length - 1;
				let node: Record<string, unknown> = layer;
				for (let i = 0; i < last; i++) {
					node = node[keys[i]] as Record<string, unknown>;
				}
				const property = keys[last];
				if (node[property] !== value) {
					node[property] = value;
				}
				break;
			}
		}
		Particle.requestRendering!();
	};

	ParticleLayer.paramInput = function (this: typeof ParticleLayer, event: Event) {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^particleLayer-').test(element.id)) break;
			element = element.parentElement;
		}
		ParticleLayer.update!(
			ParticleLayer.target as ParticleLayerData,
			Inspector.getKey!(element as HTMLElement),
			read(element as HTMLElement)
		);
	};

	Inspector.particleLayer = ParticleLayer;
}
