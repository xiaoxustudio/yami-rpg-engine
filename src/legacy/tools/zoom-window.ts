import { $ } from '@/util/dom.ts';
import { getFocus, read, write } from '@/util/element-utils';
import { Window } from './window-object.ts';
import { Editor } from '@/main/editor.ts';
import { webFrame } from 'electron';

export const Zoom = {
	initialize: null,
	getFactor: null,
	open: null,
	confirm: null
};

Zoom.initialize = function () {
	if (!$('#zoom-confirm')) return;
	$('#zoom-confirm').on('click', this.confirm);
};

Zoom.open = function () {
	Window.open('zoom');
	write($('#zoom-factor'), this.getFactor());
	getFocus($('#zoom-factor'), 'all');
};

Zoom.getFactor = function () {
	return webFrame.getZoomFactor();
};

Zoom.confirm = function (event) {
	Window.close!('zoom');
	webFrame.setZoomFactor((Editor.config.zoom = read($('#zoom-factor'))));
};
