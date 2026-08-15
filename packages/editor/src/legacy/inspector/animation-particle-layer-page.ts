import { $ } from '@/util/dom.ts';
import { Animation } from '@/animation/animation-window.ts';
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

	AnimParticleLayer.initialize = function (this: typeof AnimParticleLayer) {
		if (!$('#animParticleLayer-position')) return;
		$('#animParticleLayer-position').loadItems([
			{ name: 'Absolute', value: 'absolute' },
			{ name: 'Relative', value: 'relative' }
		]);

		$('#animParticleLayer-angle').loadItems([
			{ name: 'Default', value: 'default' },
			{ name: 'Inherit', value: 'inherit' }
		]);

		$('#animParticleLayer-order').loadItems([
			{ name: 'Behind Sprites', value: 'before' },
			{ name: 'Front of Sprites', value: 'after' }
		]);

		const elements = $(
			'#animParticleLayer-particleId, #animParticleLayer-position, #animParticleLayer-angle, #animParticleLayer-order'
		);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			(el as HTMLElement).on('focus', Inspector.inputFocus)
		);
		elements.on(
			'blur',
			Inspector.inputBlur!(this, Animation, (data: Record<string, unknown>) => {
				data.type = 'inspector-layer-change';
				data.motion = this.motion;
				data.direction = Animation.direction;
			})
		);
	};

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
