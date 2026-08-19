import { $ } from '@app/utils/dom';
import { Animation } from '@app/legacy/animation/animation-window.ts';
import { Inspector } from './inspector.ts';

{
	interface AnimParticleLayerShape {
		target: Record<string, unknown> | null;
		update: ((layer: Record<string, unknown>, key: string, value: unknown) => void) | null;
		[k: string]: unknown;
	}
	const AnimParticleLayer: AnimParticleLayerShape = {
		motion: null,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null
	};

	AnimParticleLayer.initialize = function () {};

	AnimParticleLayer.create = function (this: typeof AnimParticleLayer) {
		return {
			class: 'particle',
			name: 'Particle',
			hidden: false,
			locked: false,
			particleId: '',
			position: 'absolute',
			angle: 'default',
			order: 'after',
			frames: [Inspector.animParticleFrame.create()]
		};
	};

	AnimParticleLayer.open = function (
		this: typeof AnimParticleLayer,
		layer: Record<string, unknown>
	) {
		if (this.target !== layer) {
			this.target = layer;
			this.motion = Animation.motion;

			($('#animParticleLayer-vue-mount') as HTMLElement & { sync?: () => void })?.sync?.();
		}
	};

	AnimParticleLayer.close = function (this: typeof AnimParticleLayer) {
		if (this.target) {
			this.target = null;
			this.motion = null;
		}
	};

	AnimParticleLayer.update = function (
		this: typeof AnimParticleLayer,
		layer: Record<string, unknown>,
		key: string,
		value: unknown
	) {
		Animation.planToSave!();
		switch (key) {
			case 'particleId':
				if (layer.particleId !== value) {
					layer.particleId = value;
					Animation.player.destroyContextEmitters();
					Animation.updateFrameContexts!();
				}
				break;
			case 'position':
			case 'angle':
			case 'order':
				if (layer[key] !== value) {
					layer[key] = value;
				}
				break;
		}
		Animation.requestRendering!();
	};

	Inspector.animParticleLayer = AnimParticleLayer;
}
