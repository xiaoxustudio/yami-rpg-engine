import { $ } from '@app/utils/dom';
import { Animation } from '@app/legacy/animation/animation-window.ts';
import { Curve } from '@app/legacy/animation/curve-window.ts';
import { Inspector } from './inspector.ts';
import { Sprite } from '@app/engine/sprite/sprite.ts';

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

	AnimSpriteFrame.initialize = function (this: typeof AnimSpriteFrame) {};

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
