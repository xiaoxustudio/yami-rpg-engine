import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { getFocus, read, write } from '@/util/element-utils';

export const SceneShift: {
	callback: ((...args: any[]) => any) | null;
	initialize: ((...args: any[]) => any) | null;
	open: ((...args: any[]) => any) | null;
	windowClosed: ((...args: any[]) => any) | null;
	confirm: ((...args: any[]) => any) | null;
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
	shiftEl.addEventListener('closed', this.windowClosed as (...args: unknown[]) => any);
	$('#scene-shift-confirm')?.addEventListener(
		'click',
		this.confirm as (...args: unknown[]) => any
	);
};

SceneShift.open = function (callback: (() => void) | null) {
	this.callback = callback;
	Window.open!('scene-shift');
	write($('#scene-shift-x'), 0);
	write($('#scene-shift-y'), 0);
	getFocus($('#scene-shift-x'), 'all');
};

SceneShift.windowClosed = function (event: Event) {
	SceneShift.callback = null;
};

SceneShift.confirm = function (event: Event) {
	const x = read($('#scene-shift-x'));
	const y = read($('#scene-shift-y'));
	if (x === 0 && y === 0) {
		return getFocus($('#scene-shift-x'));
	}
	SceneShift.callback!(x, y);
	Window.close!('scene-shift');
};
