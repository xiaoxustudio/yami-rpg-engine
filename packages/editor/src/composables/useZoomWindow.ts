import { reactive } from 'vue';
import { Window } from '@/tools/window-object.ts';
import { getFocus } from '@/util/element-utils';
import { Editor } from '@/main/editor.ts';
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
	Window.open!('zoom');
	Object.assign(form, { factor });
	const setForm = (
		document.getElementById('zoom') as
			| (HTMLElement & { setForm?: (data: Partial<ZoomForm>) => void })
			| null
	)?.setForm;
	setForm?.({ factor });
	getFocus(document.getElementById('zoom-factor'), 'all');
};

const confirm = (): void => {
	const getForm = (
		document.getElementById('zoom') as (HTMLElement & { getForm?: () => ZoomForm }) | null
	)?.getForm;
	const factor = getForm?.()?.factor;
	if (factor !== undefined) {
		Editor.config!.zoom = factor;
	}
	Window.close!('zoom');
	webFrame.setZoomFactor(Editor.config!.zoom!);
};

export function useZoomWindow(): ZoomWindow {
	return { form, getFactor, open, confirm };
}
