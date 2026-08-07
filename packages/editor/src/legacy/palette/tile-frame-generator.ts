import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { write, getFocus, read, on } from '@/util/element-utils.ts';

export const FrameGenerator = {
	callback: null as any,
	initialize: null as any,
	open: null as any,
	windowClosed: null as any,
	confirm: null as any
};

FrameGenerator.initialize = function (this: any) {
	const el = $('#autoTile-generateFrames-strideX');
	if (!el) return;
	write(el, 0);
	const strideYEl = $('#autoTile-generateFrames-strideY');
	if (strideYEl) write(strideYEl, 0);
	const countEl = $('#autoTile-generateFrames-count');
	if (countEl) write(countEl, 1);

	const frameWindow = $('#autoTile-generateFrames');
	if (frameWindow) on(frameWindow, 'closed', this.windowClosed);
	const confirmEl = $('#autoTile-generateFrames-confirm');
	if (confirmEl) on(confirmEl, 'click', this.confirm);
};

FrameGenerator.open = function (this: any, callback: any) {
	this.callback = callback;
	Window.open!('autoTile-generateFrames');
	getFocus($('#autoTile-generateFrames-strideX'), 'all');
};

FrameGenerator.windowClosed = function (this: any, event: any) {
	this.callback = null;
}.bind(FrameGenerator);

FrameGenerator.confirm = function (this: any, event: any) {
	const strideX = read($('#autoTile-generateFrames-strideX'));
	const strideY = read($('#autoTile-generateFrames-strideY'));
	const count = read($('#autoTile-generateFrames-count'));
	if (strideX === 0 && strideY === 0) {
		return getFocus($('#autoTile-generateFrames-strideX'));
	}
	this.callback(strideX, strideY, count);
	Window.close!('autoTile-generateFrames');
}.bind(FrameGenerator);
