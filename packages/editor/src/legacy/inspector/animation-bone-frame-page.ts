import { $, getElementWriter } from '@/util/dom.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Curve } from '@/animation/curve-window.ts';
import { Inspector } from './inspector.ts';
import { read, write } from '@/util/element-utils.ts';

{
	interface AnimJointFrameShape {
		target: Record<string, unknown> | null;
		update: ((frame: Record<string, unknown>, key: string, value: unknown) => void) | null;
		paramInput: ((event: Event) => void) | null;
		[k: string]: unknown;
	}
	const AnimJointFrame: AnimJointFrameShape = {
		motion: null,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		write: null,
		update: null,
		paramInput: null
	};

	AnimJointFrame.initialize = function (this: typeof AnimJointFrame) {
		if (!$('#animJointFrame-x')) return;
		const elements =
			document.querySelectorAll(`#animJointFrame-x, #animJointFrame-y, #animJointFrame-rotation,
    #animJointFrame-scaleX, #animJointFrame-scaleY, #animJointFrame-opacity`);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('input', this.paramInput!)
		);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('focus', Inspector.inputFocus)
		);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener(
				'blur',
				Inspector.inputBlur!(this, Animation, (data: Record<string, unknown>) => {
					data.type = 'inspector-frame-change';
					data.motion = this.motion;
					data.direction = Animation.direction;
				})
			)
		);
	};

	AnimJointFrame.create = function (this: typeof AnimJointFrame) {
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

	AnimJointFrame.open = function (this: typeof AnimJointFrame, frame: Record<string, unknown>) {
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

	AnimJointFrame.close = function (this: typeof AnimJointFrame) {
		if (this.target) {
			Animation.unselectMarquee!(this.target);
			Curve.load!(null);
			this.target = null;
			this.motion = null;
		}
	};

	AnimJointFrame.write = function (
		this: typeof AnimJointFrame,
		options: Record<string, unknown>
	) {
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

	AnimJointFrame.update = function (
		this: typeof AnimJointFrame,
		frame: Record<string, unknown>,
		key: string,
		value: unknown
	) {
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

	AnimJointFrame.paramInput = function (this: typeof AnimJointFrame, event: Event) {
		AnimJointFrame.update!(
			AnimJointFrame.target as Record<string, unknown>,
			Inspector.getKey!(this),
			read(this)
		);
	};

	Inspector.animJointFrame = AnimJointFrame;
}
