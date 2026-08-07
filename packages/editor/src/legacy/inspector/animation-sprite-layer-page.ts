import { $, getElementWriter } from '@/util/dom.ts';
import { read } from '@/util/element-utils';
import { Animation } from '@/animation/animation-window.ts';
import { Inspector } from './inspector.ts';

{
	const AnimSpriteLayer = {
		motion: null as any,
		target: null as any,
		initialize: null as any,
		create: null as any,
		open: null as any,
		close: null as any,
		update: null as any,
		paramInput: null as any
	};

	AnimSpriteLayer.initialize = function (this: any) {
		if (!$('#animSpriteLayer-blend')) return;
		$('#animSpriteLayer-blend').loadItems([
			{ name: 'Normal', value: 'normal' },
			{ name: 'Additive', value: 'additive' },
			{ name: 'Subtract', value: 'subtract' }
		]);

		$('#animSpriteLayer-light').loadItems([
			{ name: 'Raw', value: 'raw' },
			{ name: 'Global Sampling', value: 'global' },
			{ name: 'Anchor Sampling', value: 'anchor' }
		]);

		const elements = $(
			'#animSpriteLayer-sprite, #animSpriteLayer-blend, #animSpriteLayer-light'
		);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			(el as HTMLElement).on('input', this.paramInput)
		);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			(el as HTMLElement).on('focus', Inspector.inputFocus)
		);
		elements.on(
			'blur',
			Inspector.inputBlur!(this, Animation, (data: any) => {
				data.type = 'inspector-layer-change';
				data.motion = this.motion;
				data.direction = Animation.direction;
			})
		);
	};

	AnimSpriteLayer.create = function (this: any) {
		return {
			class: 'sprite',
			name: 'Sprite',
			hidden: false,
			locked: false,
			sprite: '',
			blend: 'normal',
			light: 'raw',
			frames: [Inspector.animSpriteFrame.create()]
		};
	};

	AnimSpriteLayer.open = function (this: any, layer: any) {
		if (this.target !== layer) {
			this.target = layer;
			this.motion = Animation.motion;

			const id = Animation.meta.guid;
			const items = Animation.getSpriteListItems!(id);
			$('#animSpriteLayer-sprite').loadItems(items);

			const write = getElementWriter('animSpriteLayer', layer);
			write('sprite');
			write('blend');
			write('light');
		}
	};

	AnimSpriteLayer.close = function (this: any) {
		if (this.target) {
			this.target = null;
			this.motion = null;
		}
	};

	AnimSpriteLayer.update = function (this: any, layer: any, key: any, value: any) {
		Animation.planToSave!();
		switch (key) {
			case 'sprite':
			case 'blend':
			case 'light':
				if (layer[key] !== value) {
					layer[key] = value;
				}
				break;
		}
		Animation.requestRendering!();
	};

	AnimSpriteLayer.paramInput = function (this: any, event: any) {
		AnimSpriteLayer.update(AnimSpriteLayer.target, Inspector.getKey!(this), read(this));
	};

	Inspector.animSpriteLayer = AnimSpriteLayer;
}
