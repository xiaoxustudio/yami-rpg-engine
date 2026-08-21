import { reactive } from 'vue';
import { Animation } from '@app/animation/animation-window.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { $ } from '@app/utils/dom';
import { read } from '@app/utils/element-utils';

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

AnimSoundFrame.initialize = function (this: typeof AnimSoundFrame) {};

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

AnimSoundFrame.write = function (this: typeof AnimSoundFrame, options: Record<string, unknown>) {
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

Inspector.animSoundFrame ??= AnimSoundFrame;

interface AnimSoundFrameForm {
	sound: string;
	volume: number;
}

const ANIM_SOUND_FRAME_KEYS: (keyof AnimSoundFrameForm)[] = ['sound', 'volume'];

export function useAnimSoundFramePage() {
	const form = reactive<Partial<AnimSoundFrameForm>>({});

	const sync = (): void => {
		const target = Inspector?.animSoundFrame?.target as
			| Partial<AnimSoundFrameForm>
			| null
			| undefined;
		if (!target) return;
		for (const key of ANIM_SOUND_FRAME_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^animSoundFrame-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.animSoundFrame.update(
				Inspector.animSoundFrame.target,
				Inspector.getKey(element),
				read(element)
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
