import { $ } from '@/util/dom.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Inspector } from './inspector.ts';

{
	interface AnimSpriteLayerShape {
		target: Record<string, unknown> | null;
		update: ((layer: Record<string, unknown>, key: string, value: unknown) => void) | null;
		[k: string]: unknown;
	}
	const AnimSpriteLayer: AnimSpriteLayerShape = {
		motion: null,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null
	};

	AnimSpriteLayer.initialize = function (this: typeof AnimSpriteLayer) {};

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

			($('#animSpriteLayer-vue-mount') as HTMLElement & { sync?: () => void })?.sync?.();
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

	Inspector.animSpriteLayer = AnimSpriteLayer;
}
