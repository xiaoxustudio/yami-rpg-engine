import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { getFocus, read, write } from '@/util/element-utils';

export const Rename = {
	callback: null as unknown as ((value: any) => void) | null,
	initialize: null as unknown as (...args: unknown[]) => any,
	open: null as unknown as (...args: unknown[]) => any,
	windowClosed: null as unknown as (...args: unknown[]) => any,
	confirm: null as unknown as (...args: unknown[]) => any
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
