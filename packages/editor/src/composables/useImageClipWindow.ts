import { reactive } from 'vue';
import { getWindowStore } from '@app/stores/window';

export interface ImageClipForm {
	x: number;
	y: number;
	width: number;
	height: number;
}

interface ImageClipWindow {
	form: ImageClipForm;
	open: (data: ImageClipForm, callback: (value: number[]) => void) => void;
	confirm: () => void;
	onWindowClosed: () => void;
}

const form = reactive<ImageClipForm>({ x: 0, y: 0, width: 0, height: 0 });
let callback: ((value: number[]) => void) | null = null;

const open = (data: ImageClipForm, cb: (value: number[]) => void): void => {
	callback = cb;
	getWindowStore().open('imageClip');
	Object.assign(form, data);
};

const confirm = (): void => {
	const data = form;
	callback?.([data.x, data.y, data.width, data.height]);
	getWindowStore().close('imageClip');
};

const onWindowClosed = (): void => {
	callback = null;
};

export function useImageClipWindow(): ImageClipWindow {
	return { form, open, confirm, onWindowClosed };
}
