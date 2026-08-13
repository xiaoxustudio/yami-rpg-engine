import { $, getElementWriter } from '@/util/dom.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Curve } from '@/animation/curve-window.ts';
import { Inspector } from './inspector.ts';
import { read, write } from '@/util/element-utils.ts';

{
	interface AnimParticleFrameShape {
		target: Record<string, unknown> | null;
		update: ((frame: Record<string, unknown>, key: string, value: unknown) => void) | null;
		paramInput: ((event: Event) => void) | null;
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
		update: null,
		paramInput: null
	};

	AnimParticleFrame.initialize = function (this: typeof AnimParticleFrame) {
		if (!$('#animParticleFrame-x')) return;
		const elements =
			document.querySelectorAll(`#animParticleFrame-x, #animParticleFrame-y, #animParticleFrame-rotation,
    #animParticleFrame-scaleX, #animParticleFrame-scaleY, #animParticleFrame-opacity,
    #animParticleFrame-scale, #animParticleFrame-speed`);
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

			const write = getElementWriter('animParticleFrame', frame);
			write('x');
			write('y');
			write('rotation');
			write('scaleX');
			write('scaleY');
			write('opacity');
			write('scale');
			write('speed');
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
		if (options.x !== undefined) {
			write($('#animParticleFrame-x'), options.x);
		}
		if (options.y !== undefined) {
			write($('#animParticleFrame-y'), options.y);
		}
		if (options.rotation !== undefined) {
			write($('#animParticleFrame-rotation'), options.rotation);
		}
		if (options.scaleX !== undefined) {
			write($('#animParticleFrame-scaleX'), options.scaleX);
		}
		if (options.scaleY !== undefined) {
			write($('#animParticleFrame-scaleY'), options.scaleY);
		}
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

	AnimParticleFrame.paramInput = function (this: typeof AnimParticleFrame, event: Event) {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^animParticleFrame-').test(element.id)) break;
			element = element.parentElement;
		}
		AnimParticleFrame.update!(
			AnimParticleFrame.target as Record<string, unknown>,
			Inspector.getKey!(element as HTMLElement),
			read(element as HTMLElement)
		);
	};

	Inspector.animParticleFrame = AnimParticleFrame;
}
