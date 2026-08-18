import { $ } from '@app/legacy/util/dom.ts';
import { Animation } from '@app/legacy/animation/animation-window.ts';
import { Curve } from '@app/legacy/animation/curve-window.ts';
import { Inspector } from './inspector.ts';

{
	interface AnimParticleFrameShape {
		target: Record<string, unknown> | null;
		update: ((frame: Record<string, unknown>, key: string, value: unknown) => void) | null;
		[k: string]: unknown;
	}
	const AnimParticleFrame: AnimParticleFrameShape = {
		motion: null,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		write: null,
		update: null
	};

	AnimParticleFrame.initialize = function () {};

	AnimParticleFrame.create = function (this: typeof AnimParticleFrame) {
		return {
			start: 0,
			end: 1,
			easingId: '',
			x: 0,
			y: 0,
			rotation: 0,
			scaleX: 1,
			scaleY: 1,
			opacity: 1,
			scale: 1,
			speed: 1
		};
	};

	AnimParticleFrame.open = function (
		this: typeof AnimParticleFrame,
		frame: Record<string, unknown>
	) {
		if (this.target !== frame) {
			this.target = frame;
			this.motion = Animation.motion;
			Curve.load!(frame);
			($('#animParticleFrame-vue-mount') as HTMLElement & { sync?: () => void })?.sync?.();
		}
	};

	AnimParticleFrame.close = function (this: typeof AnimParticleFrame) {
		if (this.target) {
			Animation.unselectMarquee!(this.target);
			Curve.load!(null);
			this.target = null;
			this.motion = null;
		}
	};

	AnimParticleFrame.write = function (
		this: typeof AnimParticleFrame,
		options: Record<string, unknown>
	) {
		($('#animParticleFrame-vue-mount') as HTMLElement & { sync?: () => void })?.sync?.();
	};

	AnimParticleFrame.update = function (
		this: typeof AnimParticleFrame,
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
			case 'scale':
				if (frame[key] !== value) {
					frame[key] = value;
					Animation.updateFrameContexts!();
				}
				break;
			case 'speed':
				if (frame[key] !== value) {
					frame[key] = value;
				}
				break;
		}
		Animation.requestRendering!();
	};

	Inspector.animParticleFrame = AnimParticleFrame;
}
