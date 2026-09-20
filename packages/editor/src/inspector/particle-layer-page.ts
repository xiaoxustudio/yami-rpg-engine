import { inspectorEls } from './element-registry.ts';
import { Data } from '@app/data/data-object.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { Particle } from '@app/particle/particle-window.ts';
import type { ParticleForm } from '@app/composables/useParticleLayerPage';
import { registryElement } from '@app/utils/element-registry';

{
	interface ParticleLayerShape {
		target: ParticleLayerData | null;
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
		update: null
	};

	ParticleLayer.initialize = function () {};

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

			inspectorEls
				.get('particleLayer-color-easingId')
				?.loadItems?.(Data.createEasingItems!());
			this.easingDefaultId = Data.easings[0].id;

			(
				inspectorEls.get('particleLayer-vue-mount') as HTMLElement & {
					sync?: () => void;
				}
			)?.sync?.();
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
		const layerInstance = Particle.emitter!.getLayer(layer);
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
					const form = registryElement<HTMLElement & { form?: ParticleForm }>(
						inspectorEls,
						'particleLayer-vue-mount'
					)?.form;
					switch (value) {
						case 'point':
							area.x = form?.area.x;
							area.y = form?.area.y;
							break;
						case 'rectangle':
							area.x = form?.area.x;
							area.y = form?.area.y;
							area.width = form?.area.width;
							area.height = form?.area.height;
							break;
						case 'circle':
							area.x = form?.area.x;
							area.y = form?.area.y;
							area.radius = form?.area.radius;
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
					const form = registryElement<HTMLElement & { form?: ParticleForm }>(
						inspectorEls,
						'particleLayer-vue-mount'
					)?.form;
					switch (value) {
						case 'fixed':
							color.rgba = [
								form?.color.rgba[0],
								form?.color.rgba[1],
								form?.color.rgba[2],
								form?.color.rgba[3]
							];
							break;
						case 'random':
							color.min = [
								form?.color.min[0],
								form?.color.min[1],
								form?.color.min[2],
								form?.color.min[3]
							];
							color.max = [
								form?.color.max[0],
								form?.color.max[1],
								form?.color.max[2],
								form?.color.max[3]
							];
							break;
						case 'easing':
							color.easingId = form?.color.easingId;
							color.startMin = [
								form?.color.startMin[0],
								form?.color.startMin[1],
								form?.color.startMin[2],
								form?.color.startMin[3]
							];
							color.startMax = [
								form?.color.startMax[0],
								form?.color.startMax[1],
								form?.color.startMax[2],
								form?.color.startMax[3]
							];
							color.endMin = [
								form?.color.endMin[0],
								form?.color.endMin[1],
								form?.color.endMin[2],
								form?.color.endMin[3]
							];
							color.endMax = [
								form?.color.endMax[0],
								form?.color.endMax[1],
								form?.color.endMax[2],
								form?.color.endMax[3]
							];
							layerInstance.updateEasing();
							break;
						case 'texture':
							color.tint = [
								form?.color.tint[0],
								form?.color.tint[1],
								form?.color.tint[2],
								form?.color.tint[3]
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

	Inspector.particleLayer = ParticleLayer;
}
