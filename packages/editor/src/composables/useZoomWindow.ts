import { getWindowStore } from '@app/stores/window';
import { getWindowFormsStore } from '@app/stores/window-forms';
import { requestFocus } from '@app/directives/focus';
import { Editor } from '@app/services/project/editor.ts';
import { webFrame } from 'electron';

export interface ZoomForm {
	factor: number;
}

interface ZoomWindow {
	form: ZoomForm;
	getFactor: () => number;
	open: () => void;
	confirm: () => void;
}

// 表单真源在 `stores/window-forms.ts`（原先是本文件的模块级 `reactive`）。
// 逐字段访问器 ⇒ `Object.assign(form, { factor })`、`form.factor` 与模板 v-model 都不用改。
const form: ZoomForm = {
	get factor() {
		return getWindowFormsStore().zoomForm.factor;
	},
	set factor(value: number) {
		getWindowFormsStore().zoomForm.factor = value;
	}
};

const getFactor = (): number => webFrame.getZoomFactor();

const open = (): void => {
	const factor = getFactor();
	getWindowStore().open('zoom');
	Object.assign(form, { factor });
	requestFocus('zoom-factor', 'all');
};

const confirm = (): void => {
	Editor.config!.zoom = form.factor;
	getWindowStore().close('zoom');
	webFrame.setZoomFactor(Editor.config!.zoom!);
};

export function useZoomWindow(): ZoomWindow {
	return { form, getFactor, open, confirm };
}

export const Zoom = {
	initialize: (): void => undefined,
	getFactor,
	open,
	confirm
};
