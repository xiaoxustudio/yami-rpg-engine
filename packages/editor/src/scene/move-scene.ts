import { sceneEls } from '@app/scene/element-registry';
import { Window } from '@app/tools/window-object.ts';
import { requestFocus } from '@app/directives/focus';
import type { YamiElement } from '@app/types/element-api';

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
	const shiftEl = sceneEls.get('scene-shift') as YamiElement;
	if (!shiftEl) return;
	shiftEl.addEventListener('closed', this.windowClosed!);
};

SceneShift.open = function (callback: ((x: number, y: number) => void) | null) {
	this.callback = callback;
	Window.open!('scene-shift');
	const setForm = (
		sceneEls.get('scene-shift') as unknown as unknown as
			| (HTMLElement & { setForm?: (data: Partial<SceneShiftForm>) => void })
			| null
	)?.setForm;
	setForm?.({ x: 0, y: 0 });
	requestFocus('scene-shift-x', 'all');
};

SceneShift.windowClosed = function (_event: Event) {
	SceneShift.callback = null;
};

SceneShift.confirm = function (_event: Event) {
	const getForm = (
		sceneEls.get('scene-shift') as unknown as
			| (HTMLElement & { getForm?: () => SceneShiftForm })
			| null
	)?.getForm;
	const { x, y } = getForm?.() ?? ({} as SceneShiftForm);
	if (x === 0 && y === 0) {
		return requestFocus('scene-shift-x');
	}
	SceneShift.callback!(x, y);
	Window.close!('scene-shift');
};
