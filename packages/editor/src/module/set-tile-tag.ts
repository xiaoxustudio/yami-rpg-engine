import { $ } from '@app/utils/dom';
import { Window } from '@app/tools/window-object.ts';
import { getFocus, on, read, write } from '@app/utils/element-utils.ts';

/* 设置图块标签 */
export const SetTileTag: {
	callback: ((tag: unknown) => void) | null;
	initialize: (() => void) | null;
	open: ((tag: unknown, callback: (tag: unknown) => void) => void) | null;
	windowClosed: (() => void) | null;
	confirm: (() => void) | null;
} = {
	// properties
	callback: null,
	// methods
	initialize: null,
	open: null,
	// events
	windowClosed: null,
	confirm: null
};

SetTileTag.initialize = function () {
	if (!$('#setTileTag')) return;
	on($('#setTileTag'), 'closed', this.windowClosed!);
	on($('#setTileTag-confirm'), 'click', this.confirm!);
};

SetTileTag.open = function (tag: unknown, callback: (tag: unknown) => void) {
	this.callback = callback;
	Window.open!('setTileTag');
	write($('#setTileTag-tag'), tag);
	getFocus($('#setTileTag-tag'), 'all');
};

SetTileTag.windowClosed = function (this: typeof SetTileTag) {
	this.callback = null;
}.bind(SetTileTag);

SetTileTag.confirm = function (this: typeof SetTileTag) {
	this.callback!(read($('#setTileTag-tag')));
	Window.close!('setTileTag');
}.bind(SetTileTag);
