import { $ } from '@/util/dom.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Curve } from '@/animation/curve-window.ts';
import { Inspector } from './inspector.ts';
import { Sprite } from '@/sprite/sprite.ts';

{
	interface AnimSpriteFrameData {
		tint: Record<string, unknown>;
		spriteX: number;
		spriteY: number;
		[k: string]: unknown;
	}
	interface AnimSpriteFrameShape {
		target: AnimSpriteFrameData | null;
		update: ((frame: AnimSpriteFrameData, key: string, value: unknown) => void) | null;
		[k: string]: unknown;
	}
	const AnimSpriteFrame: AnimSpriteFrameShape = {
		motion: null,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		write: null,
		update: null
	};

	AnimSpriteFrame.initialize = function (this: typeof AnimSpriteFrame) {
		if (!$('#animSpriteFrame-tint-0-slider')) return;
		$('#animSpriteFrame-tint-0-slider').synchronize($('#animSpriteFrame-tint-0'));
		$('#animSpriteFrame-tint-1-slider').synchronize($('#animSpriteFrame-tint-1'));
		$('#animSpriteFrame-tint-2-slider').synchronize($('#animSpriteFrame-tint-2'));
		$('#animSpriteFrame-tint-3-slider').synchronize($('#animSpriteFrame-tint-3'));

		const elements = document.querySelectorAll(`
    #animSpriteFrame-anchorX, #animSpriteFrame-anchorY,
    #animSpriteFrame-pivotX, #animSpriteFrame-pivotY,
    #animSpriteFrame-x, #animSpriteFrame-y, #animSpriteFrame-rotation,
    #animSpriteFrame-scaleX, #animSpriteFrame-scaleY, #animSpriteFrame-opacity,
    #animSpriteFrame-tint-0, #animSpriteFrame-tint-1, #animSpriteFrame-tint-2, #animSpriteFrame-tint-3`);
		const sliders = document.querySelectorAll(`
    #animSpriteFrame-tint-0-slider, #animSpriteFrame-tint-1-slider,
    #animSpriteFrame-tint-2-slider, #animSpriteFrame-tint-3-slider`);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			(el as HTMLElement).on('focus', Inspector.inputFocus)
		);
		(elements as unknown as HTMLElement[]).forEach((el: HTMLElement) =>
			(el as HTMLElement).on(
				'blur',
				Inspector.inputBlur!(this, Animation, (data: Record<string, unknown>) => {
					data.type = 'inspector-frame-change';
					data.motion = this.motion;
					data.direction = Animation.direction;
				})
			)
		);
		(sliders as unknown as HTMLElement[]).forEach((el) =>
			(el as HTMLElement).on('focus', Inspector.sliderFocus)
		);
		(sliders as unknown as HTMLElement[]).forEach((el) =>
			(el as HTMLElement).on('blur', Inspector.sliderBlur)
		);
		Sprite.initialize();
	};

	AnimSpriteFrame.create = function (this: typeof AnimSpriteFrame) {
		return {
			start: 0,
			end: 1,
			easingId: '',
			anchorX: 0.5,
			anchorY: 0.5,
			pivotX: 0,
			pivotY: 0,
			x: 0,
			y: 0,
			rotation: 0,
			scaleX: 1,
			scaleY: 1,
			opacity: 1,
			spriteX: 0,
			spriteY: 0,
			tint: [0, 0, 0, 0]
		};
	};

	AnimSpriteFrame.open = function (this: typeof AnimSpriteFrame, frame: AnimSpriteFrameData) {
		if (this.target !== frame) {
			this.target = frame;
			this.motion = Animation.motion;
			Sprite.open(frame);
			Curve.load!(frame);
			($('#animSpriteFrame-vue-mount') as HTMLElement & { sync?: () => void })?.sync?.();
		}
	};

	AnimSpriteFrame.close = function (this: typeof AnimSpriteFrame) {
		if (this.target) {
			Animation.unselectMarquee!(this.target);
			Sprite.close();
			Curve.load!(null);
			this.target = null;
			this.motion = null;
		}
	};

	AnimSpriteFrame.write = function (
		this: typeof AnimSpriteFrame,
		options: Record<string, unknown>
	) {
		($('#animSpriteFrame-vue-mount') as HTMLElement & { sync?: () => void })?.sync?.();
	};

	AnimSpriteFrame.update = function (
		this: typeof AnimSpriteFrame,
		frame: AnimSpriteFrameData,
		key: string,
		value: unknown
	) {
		Animation.planToSave!();
		switch (key) {
			case 'anchorX':
			case 'anchorY':
			case 'pivotX':
			case 'pivotY':
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
			case 'tint-0':
			case 'tint-1':
			case 'tint-2':
			case 'tint-3': {
				const index = key.slice(-1);
				if (frame.tint[index] !== value) {
					frame.tint[index] = value;
					Animation.updateFrameContexts!();
				}
				break;
			}
		}
		Animation.requestRendering!();
	};

	Inspector.animSpriteFrame = AnimSpriteFrame;
}
