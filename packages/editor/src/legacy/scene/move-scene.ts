import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { getFocus } from '@/util/element-utils';

export interface SceneShiftForm {
	x: number;
	y: number;
}

export const SceneShift: {
	callback: ((x: number, y: number) => void) | null;
	initialize: (() => void) | null;
	open: ((callback: ((x: number, y: number) => void) | null) => void) | null;
	windowClosed: ((event: Event) => void) | null;
	confirm: ((event: Event) => void) | null;
} = {
	callback: null,
	initialize: null,
	open: null,
	windowClosed: null,
	confirm: null
};

SceneShift.initialize = function () {
	const shiftEl = $('#scene-shift');
	if (!shiftEl) return;
	shiftEl.addEventListener('closed', this.windowClosed!);
};

SceneShift.open = function (callback: ((x: number, y: number) => void) | null) {
	this.callback = callback;
	Window.open!('scene-shift');
	const setForm = (
		$('#scene-shift') as
			| (HTMLElement & { setForm?: (data: Partial<SceneShiftForm>) => void })
			| null
	)?.setForm;
	setForm?.({ x: 0, y: 0 });
	getFocus($('#scene-shift-x'), 'all');
};

SceneShift.windowClosed = function (event: Event) {
	SceneShift.callback = null;
};

SceneShift.confirm = function (event: Event) {
	const getForm = ($('#scene-shift') as (HTMLElement & { getForm?: () => SceneShiftForm }) | null)
		?.getForm;
	const { x, y } = getForm?.() ?? ({} as SceneShiftForm);
	if (x === 0 && y === 0) {
		return getFocus($('#scene-shift-x'));
	}
	SceneShift.callback!(x, y);
	Window.close!('scene-shift');
};
