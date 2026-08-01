import { $ } from '@/util/dom.ts';
import { getFocus, read, write } from '@/util/element-utils';
function getWindow() {
	return (window as any).Window;
}

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
	shiftEl.on('closed', this.windowClosed);
	$('#scene-shift-confirm')?.on('click', this.confirm);
};

SceneShift.open = function (callback: any) {
	this.callback = callback;
	getWindow().open('scene-shift');
	write($('#scene-shift-x'), 0);
	write($('#scene-shift-y'), 0);
	getFocus($('#scene-shift-x'), 'all');
};

SceneShift.windowClosed = function (event: any) {
	SceneShift.callback = null;
};

SceneShift.confirm = function (event: any) {
	const x = read($('#scene-shift-x'));
	const y = read($('#scene-shift-y'));
	if (x === 0 && y === 0) {
		return getFocus($('#scene-shift-x'));
	}
	SceneShift.callback!(x, y);
	getWindow().close('scene-shift');
};
