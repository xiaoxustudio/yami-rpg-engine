/* oxlint-disable eslint/no-restricted-properties */
import { reactive } from 'vue';
import { getWindowStore } from '@app/stores/window';
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

const form = reactive<ZoomForm>({ factor: 1 });

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
