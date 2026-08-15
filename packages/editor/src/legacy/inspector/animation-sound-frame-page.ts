import { $ } from '@/util/dom.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Inspector } from './inspector.ts';

{
	interface AnimSoundFrameShape {
		target: Record<string, unknown> | null;
		update: ((frame: Record<string, unknown>, key: string, value: unknown) => void) | null;
		[k: string]: unknown;
	}
	const AnimSoundFrame: AnimSoundFrameShape = {
		motion: null,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		write: null,
		update: null
	};

	AnimSoundFrame.initialize = function (this: typeof AnimSoundFrame) {
		if (!$('#animSoundFrame-sound')) return;
		const elements = document.querySelectorAll('#animSoundFrame-sound, #animSoundFrame-volume');
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
	};

	AnimSoundFrame.create = function (this: typeof AnimSoundFrame) {
		return {
			start: 0,
			end: 1,
			sound: '',
			volume: 1
		};
	};

	AnimSoundFrame.open = function (this: typeof AnimSoundFrame, frame: Record<string, unknown>) {
		if (this.target !== frame) {
			this.target = frame;
			this.motion = Animation.motion;
			($('#animSoundFrame-vue-mount') as HTMLElement & { sync?: () => void })?.sync?.();
		}
	};

	AnimSoundFrame.close = function (this: typeof AnimSoundFrame) {
		if (this.target) {
			Animation.unselectMarquee!(this.target);
			this.target = null;
			this.motion = null;
		}
	};

	AnimSoundFrame.write = function (
		this: typeof AnimSoundFrame,
		options: Record<string, unknown>
	) {
		($('#animSoundFrame-vue-mount') as HTMLElement & { sync?: () => void })?.sync?.();
	};

	AnimSoundFrame.update = function (
		this: typeof AnimSoundFrame,
		frame: Record<string, unknown>,
		key: string,
		value: unknown
	) {
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

	Inspector.animSoundFrame = AnimSoundFrame;
}
