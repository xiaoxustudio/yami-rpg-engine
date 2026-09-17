import { getElementWriter } from '@app/utils/dom';
import { inspectorEls } from './element-registry.ts';
import { clear } from '@app/utils/element-utils';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { radians } from '@app/utils/math';

{
	interface SceneParticleData {
		emitter: {
			angle: number;
			opacity: unknown;
			scale: unknown;
			speed: unknown;
		};
		[k: string]: unknown;
	}
	interface SceneParticleShape {
		target: SceneParticleData | null;
		update: ((particle: SceneParticleData, key: string, value: unknown) => void) | null;
		[k: string]: unknown;
	}
	const SceneParticle: SceneParticleShape = {
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

	SceneParticle.initialize = function () {};

	SceneParticle.create = function (this: typeof SceneParticle) {
		return {
			class: 'particle',
			name: 'Particle',
			enabled: true,
			hidden: false,
			locked: false,
			presetId: '',
			particleId: '',
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

	SceneParticle.open = function (this: typeof SceneParticle, particle: SceneParticleData) {
		if (this.target !== particle) {
			this.target = particle;

			const write = getElementWriter('sceneParticle', particle);
			write('conditions');
			write('events');
			write('scripts');
			(
				inspectorEls.get('sceneParticle-vue-mount') as unknown as HTMLElement & {
					sync?: () => void;
				}
			)?.sync?.();
		}
	};

	SceneParticle.close = function (this: typeof SceneParticle) {
		if (this.target) {
			Scene.list.unselect(this.target);
			Scene.updateTarget!();
			this.target = null;
			clear(inspectorEls.get('sceneParticle-conditions'));
			clear(inspectorEls.get('sceneParticle-events'));
			clear(inspectorEls.get('sceneParticle-scripts'));
			clear(inspectorEls.get('sceneParticle-parameter-pane'));
		}
	};

	SceneParticle.write = function (this: typeof SceneParticle, _options: Record<string, unknown>) {
		(
			inspectorEls.get('sceneParticle-vue-mount') as unknown as HTMLElement & {
				sync?: () => void;
			}
		)?.sync?.();
	};

	SceneParticle.update = function (
		this: typeof SceneParticle,
		particle: SceneParticleData,
		key: string,
		value: unknown
	) {
		Scene.planToSave!();
		switch (key) {
			case 'name':
				if (particle.name !== value) {
					particle.name = value;
					Scene.updateTargetInfo!();
					Scene.list.updateItemName(particle);
				}
				break;
			case 'particleId':
				if (particle.particleId !== value) {
					particle.particleId = value;
					Scene.loadParticleContext!(particle);
					Scene.list.update();
				}
				break;
			case 'x':
			case 'y':
			case 'priority':
				if (particle[key] !== value) {
					particle[key] = value;
				}
				break;
			case 'angle':
				if (particle.angle !== value) {
					particle.angle = value;
					if (particle.emitter) {
						particle.emitter.angle = radians(value as number);
					}
				}
				break;
			case 'scale':
				if (particle.scale !== value) {
					particle.scale = value;
					if (particle.emitter) {
						particle.emitter.scale = value;
					}
				}
				break;
			case 'speed':
				if (particle.speed !== value) {
					particle.speed = value;
					if (particle.emitter) {
						particle.emitter.speed = value;
					}
				}
				break;
			case 'opacity':
				if (particle.opacity !== value) {
					particle.opacity = value;
					if (particle.emitter) {
						particle.emitter.opacity = value;
					}
				}
				break;
		}
		Scene.requestRendering!();
	};

	Inspector.sceneParticle = SceneParticle;
}
