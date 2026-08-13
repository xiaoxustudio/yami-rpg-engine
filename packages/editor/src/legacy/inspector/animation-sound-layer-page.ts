import { $, getElementWriter } from '@/util/dom.ts';
import { read } from '@/util/element-utils';
import { Animation } from '@/animation/animation-window.ts';
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
		update: null,
		paramInput: null
	};

	AnimSoundLayer.initialize = function (this: typeof AnimSoundLayer) {
		if (!$('#animSoundLayer-playbackRate')) return;
		$('#animSoundLayer-playbackRate').loadItems([
			{ name: 'Default', value: 'default' },
			{ name: 'Inherit', value: 'inherit' }
		]);

		const element = $('#animSoundLayer-playbackRate');
		element.on('focus', Inspector.inputFocus);
		element.on(
			'blur',
			Inspector.inputBlur!(
				this,
				Animation,
				(data: { type: string; [k: string]: unknown }) => {
					data.type = 'inspector-layer-change';
					data.motion = this.motion;
					data.direction = Animation.direction;
				}
			)
		);
	};

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

			const write = getElementWriter('animSoundLayer', layer);
			write('playbackRate');
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

	AnimSoundLayer.paramInput = function (
		this: HTMLElement & { [k: string]: unknown },
		event: Event
	) {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^animSoundLayer-').test(element.id)) break;
			element = element.parentElement;
		}
		AnimSoundLayer.update(
			AnimSoundLayer.target,
			Inspector.getKey!(element as HTMLElement),
			read(element as HTMLElement)
		);
	};

	Inspector.animSoundLayer = AnimSoundLayer;
}
