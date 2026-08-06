import { $, getElementWriter } from '@/util/dom.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Curve } from '@/animation/curve-window.ts';
import { Inspector } from './inspector.ts';
import { read, write } from '@/util/element-utils.ts';

{
	const AnimJointFrame = {
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

	AnimJointFrame.initialize = function (this: any) {
		if (!$('#animJointFrame-x')) return;
		const elements = $(`#animJointFrame-x, #animJointFrame-y, #animJointFrame-rotation,
    #animJointFrame-scaleX, #animJointFrame-scaleY, #animJointFrame-opacity`);
		elements.forEach((el: HTMLElement) => el.addEventListener('input', this.paramInput!));
		elements.forEach((el: HTMLElement) => el.addEventListener('focus', Inspector.inputFocus));
		elements.forEach((el: HTMLElement) =>
			el.addEventListener(
				'blur',
				Inspector.inputBlur!(this, Animation, (data: any) => {
					data.type = 'inspector-frame-change';
					data.motion = this.motion;
					data.direction = Animation.direction;
				})
			)
		);
	};

	AnimJointFrame.create = function (this: any) {
		return {
			start: 0,
			end: 1,
			easingId: '',
			x: 0,
			y: 0,
			rotation: 0,
			scaleX: 1,
			scaleY: 1,
			opacity: 1
		};
	};

	AnimJointFrame.open = function (this: any, frame: any) {
		if (this.target !== frame) {
			this.target = frame;
			this.motion = Animation.motion;
			Curve.load!(frame);

			const write = getElementWriter('animJointFrame', frame);
			write('x');
			write('y');
			write('rotation');
			write('scaleX');
			write('scaleY');
			write('opacity');
		}
	};

	AnimJointFrame.close = function (this: any) {
		if (this.target) {
			Animation.unselectMarquee!(this.target);
			Curve.load!(null);
			this.target = null;
			this.motion = null;
		}
	};

	AnimJointFrame.write = function (this: any, options: any) {
		if (options.x !== undefined) {
			write($('#animJointFrame-x'), options.x);
		}
		if (options.y !== undefined) {
			write($('#animJointFrame-y'), options.y);
		}
		if (options.rotation !== undefined) {
			write($('#animJointFrame-rotation'), options.rotation);
		}
		if (options.scaleX !== undefined) {
			write($('#animJointFrame-scaleX'), options.scaleX);
		}
		if (options.scaleY !== undefined) {
			write($('#animJointFrame-scaleY'), options.scaleY);
		}
	};

	AnimJointFrame.update = function (this: any, frame: any, key: any, value: any) {
		Animation.planToSave!();
		switch (key) {
			case 'x':
			case 'y':
			case 'rotation':
			case 'scaleX':
			case 'scaleY':
			case 'opacity':
				if (frame[key] !== value) {
					frame[key] = value;
					Animation.updateFrameContexts!();
				}
				break;
		}
		Animation.requestRendering!();
	};

	AnimJointFrame.paramInput = function (this: any, event: any) {
		AnimJointFrame.update(AnimJointFrame.target, Inspector.getKey!(this), read(this));
	};

	Inspector.animJointFrame = AnimJointFrame;
}
