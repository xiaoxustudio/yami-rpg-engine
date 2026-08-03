import { $ } from '@/util/dom.ts';
import { getFocus, read, write } from '@/util/element-utils';
import { Window } from './window-object.ts';

export const SetKey = {
	callback: null,
	initialize: null,
	open: null,
	windowClosed: null,
	confirm: null
};

SetKey.initialize = function () {
	if (!$('#setKey')) return;
	$('#setKey').on('closed', this.windowClosed);
	$('#setKey-confirm').on('click', this.confirm);
};

SetKey.open = function (key, callback) {
	this.callback = callback;
	Window.open('setKey');
	write($('#setKey-key'), key);
	getFocus($('#setKey-key'), 'all');
};

SetKey.windowClosed = function (event) {
	this.callback = null;
}.bind(SetKey);

SetKey.confirm = function (event) {
	this.callback(read($('#setKey-key')));
	Window.close('setKey');
}.bind(SetKey);
