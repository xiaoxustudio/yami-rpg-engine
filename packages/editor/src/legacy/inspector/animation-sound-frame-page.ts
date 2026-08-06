import { $, getElementWriter } from '@/util/dom.ts';
import { read, write } from '@/util/element-utils';
import { Animation } from '@/animation/animation-window.ts';
import { Inspector } from './inspector.ts';

{
	const AnimSoundFrame = {
		motion: null as any,
		target: null as any,
		initialize: null as any,
		create: null as any,
		open: null as any,
		close: null as any,
		write: null as any,
		update: null as any,
		paramInput: null as any
	};

	AnimSoundFrame.initialize = function (this: any) {
		if (!$('#animSoundFrame-sound')) return;
		const elements = $('#animSoundFrame-sound, #animSoundFrame-volume');
		elements.on('input', this.paramInput);
		elements.on('focus', Inspector.inputFocus);
		elements.on(
			'blur',
			Inspector.inputBlur!(this, Animation, (data: any) => {
				data.type = 'inspector-frame-change';
				data.motion = this.motion;
				data.direction = Animation.direction;
			})
		);
	};

	AnimSoundFrame.create = function (this: any) {
		return {
			start: 0,
			end: 1,
			sound: '',
			volume: 1
		};
	};

	AnimSoundFrame.open = function (this: any, frame: any) {
		if (this.target !== frame) {
			this.target = frame;
			this.motion = Animation.motion;

			const write = getElementWriter('animSoundFrame', frame);
			write('sound');
			write('volume');
		}
	};

	AnimSoundFrame.close = function (this: any) {
		if (this.target) {
			Animation.unselectMarquee!(this.target);
			this.target = null;
			this.motion = null;
		}
	};

	AnimSoundFrame.write = function (this: any, options: any) {
		if (options.sound !== undefined) {
			write($('#animSoundFrame-sound'), options.sound);
		}
		if (options.volume !== undefined) {
			write($('#animSoundFrame-volume'), options.volume);
		}
	};

	AnimSoundFrame.update = function (this: any, frame: any, key: any, value: any) {
		Animation.planToSave!();
		switch (key) {
			case 'sound':
			case 'volume':
				if (frame[key] !== value) {
					frame[key] = value;
				}
				break;
		}
	};

	AnimSoundFrame.paramInput = function (this: any, event: any) {
		AnimSoundFrame.update(AnimSoundFrame.target, Inspector.getKey!(this), read(this));
	};

	Inspector.animSoundFrame = AnimSoundFrame;
}
