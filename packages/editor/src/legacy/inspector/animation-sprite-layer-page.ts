import { $, getElementWriter } from '@/util/dom.ts';
import { read } from '@/util/element-utils';
import { Animation } from '@/animation/animation-window.ts';
import { Inspector } from './inspector.ts';

{
	interface AnimSpriteLayerShape {
		target: Record<string, unknown> | null;
		update: ((layer: Record<string, unknown>, key: string, value: unknown) => void) | null;
		paramInput: ((event: Event) => void) | null;
		[k: string]: unknown;
	}
	const AnimSpriteLayer: AnimSpriteLayerShape = {
		motion: null,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null
	};

	AnimSpriteLayer.initialize = function (this: typeof AnimSpriteLayer) {
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
			Inspector.inputBlur!(this, Animation, (data: Record<string, unknown>) => {
				data.type = 'inspector-layer-change';
				data.motion = this.motion;
				data.direction = Animation.direction;
			})
		);
	};

	AnimSpriteLayer.create = function (this: typeof AnimSpriteLayer) {
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

	AnimSpriteLayer.open = function (this: typeof AnimSpriteLayer, layer: Record<string, unknown>) {
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

	AnimSpriteLayer.close = function (this: typeof AnimSpriteLayer) {
		if (this.target) {
			this.target = null;
			this.motion = null;
		}
	};

	AnimSpriteLayer.update = function (
		this: typeof AnimSpriteLayer,
		layer: Record<string, unknown>,
		key: string,
		value: unknown
	) {
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

	AnimSpriteLayer.paramInput = function (this: typeof AnimSpriteLayer, event: Event) {
		AnimSpriteLayer.update!(
			AnimSpriteLayer.target as Record<string, unknown>,
			Inspector.getKey!(this),
			read(this)
		);
	};

	Inspector.animSpriteLayer = AnimSpriteLayer;
}
