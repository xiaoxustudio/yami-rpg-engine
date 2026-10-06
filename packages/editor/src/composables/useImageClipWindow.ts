import { getWindowFormsStore } from '@app/stores/window-forms';
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

// 表单真源在 `stores/window-forms.ts`（原先是本文件的模块级 `reactive`）。
// 逐字段访问器 ⇒ `Object.assign(form, …)`、`const data = form` 与模板 v-model 都不用改。
const form: ImageClipForm = {
	get x(): ImageClipForm['x'] {
		return getWindowFormsStore().imageClipForm.x;
	},
	set x(value: ImageClipForm['x']) {
		getWindowFormsStore().imageClipForm.x = value;
	},
	get y(): ImageClipForm['y'] {
		return getWindowFormsStore().imageClipForm.y;
	},
	set y(value: ImageClipForm['y']) {
		getWindowFormsStore().imageClipForm.y = value;
	},
	get width(): ImageClipForm['width'] {
		return getWindowFormsStore().imageClipForm.width;
	},
	set width(value: ImageClipForm['width']) {
		getWindowFormsStore().imageClipForm.width = value;
	},
	get height(): ImageClipForm['height'] {
		return getWindowFormsStore().imageClipForm.height;
	},
	set height(value: ImageClipForm['height']) {
		getWindowFormsStore().imageClipForm.height = value;
	}
};
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
