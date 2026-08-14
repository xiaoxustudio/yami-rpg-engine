import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { getFocus } from '@/util/element-utils';
import { Editor } from '@/main/editor.ts';
import { webFrame } from 'electron';

export interface ZoomForm {
	factor: number;
}

export const Zoom = {
	initialize: null as unknown as () => void,
	getFactor: null as unknown as () => number,
	open: null as unknown as () => void,
	confirm: null as unknown as () => void
};

Zoom.initialize = function (this: typeof Zoom) {};

Zoom.open = function (this: typeof Zoom) {
	Window.open!('zoom');
	const setForm = (
		$('#zoom') as (HTMLElement & { setForm?: (data: Partial<ZoomForm>) => void }) | null
	)?.setForm;
	setForm?.({ factor: this.getFactor!() });
	getFocus($('#zoom-factor'), 'all');
};

Zoom.getFactor = function (this: typeof Zoom) {
	return webFrame.getZoomFactor();
};

Zoom.confirm = function (this: typeof Zoom) {
	const getForm = ($('#zoom') as (HTMLElement & { getForm?: () => ZoomForm }) | null)?.getForm;
	const factor = getForm?.()?.factor;
	if (factor !== undefined) {
		Editor.config!.zoom = factor;
	}
	Window.close!('zoom');
	webFrame.setZoomFactor(Editor.config!.zoom!);
};
