import { $ } from '@app/utils/dom';
import { reactive } from 'vue';
import { Window } from '@app/tools/window-object.ts';
import { getFocus, on } from '@app/utils/element-utils.ts';

export interface FrameGeneratorForm {
	strideX: number;
	strideY: number;
	count: number;
}

const form = reactive<FrameGeneratorForm>({ strideX: 0, strideY: 0, count: 1 });

// oxlint-disable-next-line no-explicit-any
export const FrameGenerator: Record<string, any> = {
	form,
	callback: null,
	initialize: null,
	open: null,
	windowClosed: null,
	confirm: null
};

FrameGenerator.initialize = function (this: typeof FrameGenerator) {
	form.strideX = 0;
	form.strideY = 0;
	form.count = 1;

	const frameWindow = $('#autoTile-generateFrames');
	if (frameWindow) on(frameWindow, 'closed', this.windowClosed);
	const confirmEl = $('#autoTile-generateFrames-confirm');
	if (confirmEl) on(confirmEl, 'click', this.confirm);
};

FrameGenerator.open = function (
	this: typeof FrameGenerator,
	callback: (strideX: number, strideY: number, count: number) => void
) {
	this.callback = callback;
	Window.open!('autoTile-generateFrames');
	getFocus($('#autoTile-generateFrames-strideX'), 'all');
};

FrameGenerator.windowClosed = function (this: typeof FrameGenerator, _event: Event) {
	this.callback = null;
}.bind(FrameGenerator);

FrameGenerator.confirm = function (this: typeof FrameGenerator, _event: Event) {
	const strideX = form.strideX;
	const strideY = form.strideY;
	const count = form.count;
	if (strideX === 0 && strideY === 0) {
		return getFocus($('#autoTile-generateFrames-strideX'));
	}
	this.callback(strideX, strideY, count);
	Window.close!('autoTile-generateFrames');
}.bind(FrameGenerator);
