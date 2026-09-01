import '@app/inspector/element-video-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/inspector/inspector.ts';

interface UIVideoForm {
	video: string;
	playbackRate: number;
	loop: boolean;
	flip: string;
	blend: string;
}

const VIDEO_KEYS: (keyof UIVideoForm)[] = ['video', 'playbackRate', 'loop', 'flip', 'blend'];

export function useUIVideoPage() {
	const form = reactive<Partial<UIVideoForm>>({});

	const sync = (): void => {
		const target = Inspector?.uiVideo?.target as Partial<UIVideoForm> | null | undefined;
		if (!target) return;
		for (const key of VIDEO_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
	};

	const onParamInput = (event?: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^uiVideo-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.uiVideo.update(
				Inspector.uiVideo.target,
				Inspector.getKey(element),
				(form as Record<string, unknown>)[Inspector.getKey(element)]
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
