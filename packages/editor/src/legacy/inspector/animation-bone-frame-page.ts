import { $ } from '@/util/dom.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Curve } from '@/animation/curve-window.ts';
import { Inspector } from './inspector.ts';

{
	interface AnimJointFrameShape {
		target: Record<string, unknown> | null;
		update: ((frame: Record<string, unknown>, key: string, value: unknown) => void) | null;
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
		update: null
	};

	AnimJointFrame.initialize = function (this: typeof AnimJointFrame) {};

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
			($('#animJointFrame-vue-mount') as HTMLElement & { sync?: () => void })?.sync?.();
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
		($('#animJointFrame-vue-mount') as HTMLElement & { sync?: () => void })?.sync?.();
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

	Inspector.animJointFrame = AnimJointFrame;
}
