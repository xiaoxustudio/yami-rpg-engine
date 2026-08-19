import { $ } from '@app/utils/dom';
import { Animation } from '@app/legacy/animation/animation-window.ts';
import { Inspector } from './inspector.ts';

{
	interface AnimSoundLayerShape {
		[k: string]: any;
	}
	interface AnimSoundLayerData {
		class: string;
		name: string;
		hidden: boolean;
		locked: boolean;
		playbackRate: string;
		frames: unknown[];
		[k: string]: unknown;
	}
	const AnimSoundLayer: AnimSoundLayerShape = {
		motion: null,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null
	};

	AnimSoundLayer.initialize = function (this: typeof AnimSoundLayer) {};

	AnimSoundLayer.create = function (this: typeof AnimSoundLayer) {
		return {
			class: 'sound',
			name: 'Sound',
			hidden: false,
			locked: false,
			playbackRate: 'default',
			frames: [Inspector.animSoundFrame.create()]
		};
	};

	AnimSoundLayer.open = function (this: typeof AnimSoundLayer, layer: AnimSoundLayerData) {
		if (this.target !== layer) {
			this.target = layer;
			this.motion = Animation.motion;

			($('#animSoundLayer-vue-mount') as HTMLElement & { sync?: () => void })?.sync?.();
		}
	};

	AnimSoundLayer.close = function (this: typeof AnimSoundLayer) {
		if (this.target) {
			this.target = null;
			this.motion = null;
		}
	};

	AnimSoundLayer.update = function (
		this: typeof AnimSoundLayer,
		layer: AnimSoundLayerData,
		key: string,
		value: unknown
	) {
		Animation.planToSave!();
		switch (key) {
			case 'playbackRate':
				if (layer[key] !== value) {
					(layer as Record<string, unknown>)[key] = value;
				}
				break;
		}
	};

	Inspector.animSoundLayer = AnimSoundLayer;
}
