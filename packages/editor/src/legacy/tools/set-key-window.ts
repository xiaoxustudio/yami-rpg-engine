import { $ } from '@/util/dom.ts';
import { getFocus, read, write } from '@/util/element-utils';
import { Window } from './window-object.ts';

export const SetKey = {
	callback: null as ((key: string) => void) | null,
	initialize: null as (() => void) | null,
	open: null as ((key: string, callback: (key: string) => void) => void) | null,
	windowClosed: null as ((event: any) => void) | null,
	confirm: null as ((event: any) => void) | null
};

SetKey.initialize = function () {
	if (!$('#setKey')) return;
	$('#setKey').on('closed', this.windowClosed);
	$('#setKey-confirm').on('click', this.confirm);
};

SetKey.open = function (key, callback) {
	this.callback = callback;
	Window.open!('setKey');
	write($('#setKey-key'), key);
	getFocus($('#setKey-key'), 'all');
};

SetKey.windowClosed = function (this: any, event: any) {
	this.callback = null;
}.bind(SetKey);

SetKey.confirm = function (this: any, event: any) {
	this.callback(read($('#setKey-key')));
	Window.close!('setKey');
}.bind(SetKey);
