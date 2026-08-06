import { $ } from '@/util/dom.ts';
import { getFocus, read, write } from '@/util/element-utils';
import { Window } from './window-object.ts';

export const Rename = {
	callback: null as any,
	initialize: null as any,
	open: null as any,
	windowClosed: null as any,
	confirm: null as any
};

Rename.initialize = function (this: any) {
	if (!$('#rename')) return;
	$('#rename').on('closed', this.windowClosed);
	$('#rename-confirm').on('click', this.confirm);
};

Rename.open = function (this: any, name: any, callback: any) {
	this.callback = callback;
	Window.open!('rename');
	write($('#rename-name'), name);
	getFocus($('#rename-name'), 'all');
};

Rename.windowClosed = function (this: any, event: any) {
	this.callback = null;
}.bind(Rename);

Rename.confirm = function (this: any, event: any) {
	this.callback(read($('#rename-name')));
	Window.close!('rename');
}.bind(Rename);
