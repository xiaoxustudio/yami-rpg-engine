import { $, getElementWriter } from '@/util/dom.ts';
import { read } from '@/util/element-utils';
import { Animation } from '@/animation/animation-window.ts';
import { Inspector } from './inspector.ts';

{
	const AnimParticleLayer = {
		motion: null as any,
		target: null as any,
		initialize: null as any,
		create: null as any,
		open: null as any,
		close: null as any,
		update: null as any,
		paramInput: null as any
	};

	AnimParticleLayer.initialize = function (this: any) {
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
		elements.on('input', this.paramInput);
		elements.on('focus', Inspector.inputFocus);
		elements.on(
			'blur',
			Inspector.inputBlur!(this, Animation, (data: any) => {
				data.type = 'inspector-layer-change';
				data.motion = this.motion;
				data.direction = Animation.direction;
			})
		);
	};

	AnimParticleLayer.create = function (this: any) {
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

	AnimParticleLayer.open = function (this: any, layer: any) {
		if (this.target !== layer) {
			this.target = layer;
			this.motion = Animation.motion;

			const write = getElementWriter('animParticleLayer', layer);
			write('particleId');
			write('position');
			write('angle');
			write('order');
		}
	};

	AnimParticleLayer.close = function (this: any) {
		if (this.target) {
			this.target = null;
			this.motion = null;
		}
	};

	AnimParticleLayer.update = function (this: any, layer: any, key: any, value: any) {
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

	AnimParticleLayer.paramInput = function (this: any, event: any) {
		AnimParticleLayer.update(AnimParticleLayer.target, Inspector.getKey!(this), read(this));
	};

	Inspector.animParticleLayer = AnimParticleLayer;
}
