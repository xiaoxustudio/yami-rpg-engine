import { $ } from '@/util/dom.ts';
import { getFocus, read, write } from '@/util/element-utils';
import { Window } from './window-object.ts';

export const Rename = {
	callback: null,
	initialize: null,
	open: null,
	windowClosed: null,
	confirm: null
};

Rename.initialize = function () {
	if (!$('#rename')) return;
	$('#rename').on('closed', this.windowClosed);
	$('#rename-confirm').on('click', this.confirm);
};

Rename.open = function (name, callback) {
	this.callback = callback;
	Window.open('rename');
	write($('#rename-name'), name);
	getFocus($('#rename-name'), 'all');
};

Rename.windowClosed = function (event) {
	this.callback = null;
}.bind(Rename);

Rename.confirm = function (event) {
	this.callback(read($('#rename-name')));
	Window.close('rename');
}.bind(Rename);
