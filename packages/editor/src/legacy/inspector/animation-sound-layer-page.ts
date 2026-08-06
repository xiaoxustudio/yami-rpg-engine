import { $, getElementWriter } from '@/util/dom.ts';
import { read } from '@/util/element-utils';
import { Animation } from '@/animation/animation-window.ts';
import { Inspector } from './inspector.ts';

{
	const AnimSoundLayer = {
		motion: null as any,
		target: null as any,
		initialize: null as any,
		create: null as any,
		open: null as any,
		close: null as any,
		update: null as any,
		paramInput: null as any
	};

	AnimSoundLayer.initialize = function (this: any) {
		if (!$('#animSoundLayer-playbackRate')) return;
		$('#animSoundLayer-playbackRate').loadItems([
			{ name: 'Default', value: 'default' },
			{ name: 'Inherit', value: 'inherit' }
		]);

		const element = $('#animSoundLayer-playbackRate');
		element.on('input', this.paramInput);
		element.on('focus', Inspector.inputFocus);
		element.on(
			'blur',
			Inspector.inputBlur!(this, Animation, (data: any) => {
				data.type = 'inspector-layer-change';
				data.motion = this.motion;
				data.direction = Animation.direction;
			})
		);
	};

	AnimSoundLayer.create = function (this: any) {
		return {
			class: 'sound',
			name: 'Sound',
			hidden: false,
			locked: false,
			playbackRate: 'default',
			frames: [Inspector.animSoundFrame.create()]
		};
	};

	AnimSoundLayer.open = function (this: any, layer: any) {
		if (this.target !== layer) {
			this.target = layer;
			this.motion = Animation.motion;

			const write = getElementWriter('animSoundLayer', layer);
			write('playbackRate');
		}
	};

	AnimSoundLayer.close = function (this: any) {
		if (this.target) {
			this.target = null;
			this.motion = null;
		}
	};

	AnimSoundLayer.update = function (this: any, layer: any, key: any, value: any) {
		Animation.planToSave!();
		switch (key) {
			case 'playbackRate':
				if (layer[key] !== value) {
					layer[key] = value;
				}
				break;
		}
	};

	AnimSoundLayer.paramInput = function (this: any, event: any) {
		AnimSoundLayer.update(AnimSoundLayer.target, Inspector.getKey!(this), read(this));
	};

	Inspector.animSoundLayer = AnimSoundLayer;
}
