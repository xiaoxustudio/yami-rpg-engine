import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { getFocus, write } from '@/util/element-utils';
import { Editor } from '@/main/editor.ts';
import { webFrame } from 'electron';

export const Zoom = {
	initialize: null as unknown as () => void,
	getFactor: null as unknown as () => number,
	open: null as unknown as () => void,
	confirm: null as unknown as () => void
};

Zoom.initialize = function (this: typeof Zoom) {
	if (!$('#zoom-confirm')) return;
	$('#zoom-confirm').on('click', this.confirm);
};

Zoom.open = function (this: typeof Zoom) {
	Window.open!('zoom');
	write($('#zoom-factor'), this.getFactor!());
	getFocus($('#zoom-factor'), 'all');
};

Zoom.getFactor = function (this: typeof Zoom) {
	return webFrame.getZoomFactor();
};

Zoom.confirm = function (this: typeof Zoom) {
	Window.close!('zoom');
	webFrame.setZoomFactor(Editor.config!.zoom!);
};
