import { $ } from '@/util/dom.ts';
import { getFocus, write } from '@/util/element-utils';
import { Window } from './window-object.ts';
import { Editor } from '@/main/editor.ts';
import { webFrame } from 'electron';

export const Zoom = {
	initialize: null as any,
	getFactor: null as any,
	open: null as any,
	confirm: null as any
};

Zoom.initialize = function (this: any) {
	if (!$('#zoom-confirm')) return;
	$('#zoom-confirm').on('click', this.confirm);
};

Zoom.open = function (this: any) {
	Window.open!('zoom');
	write($('#zoom-factor'), this.getFactor!());
	getFocus($('#zoom-factor'), 'all');
};

Zoom.getFactor = function (this: any) {
	return webFrame.getZoomFactor();
};

Zoom.confirm = function (this: any, event: any) {
	Window.close!('zoom');
	webFrame.setZoomFactor((Editor.config as any).zoom);
};
