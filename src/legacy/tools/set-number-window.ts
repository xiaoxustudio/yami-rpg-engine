import { $ } from '@/util/dom.ts';
import { getFocus, read, write } from '@/util/element-utils';
import { Window } from './window-object.ts';

export const SetQuantity = {
	callback: null,
	initialize: null,
	open: null,
	windowClosed: null,
	confirm: null
};

SetQuantity.initialize = function () {
	if (!$('#setQuantity')) return;
	$('#setQuantity').on('closed', this.windowClosed);
	$('#setQuantity-confirm').on('click', this.confirm);
};

SetQuantity.open = function (quantity, maximum, callback) {
	this.callback = callback;
	Window.open('setQuantity');
	$('#setQuantity-quantity').input.max = maximum;
	write($('#setQuantity-quantity'), quantity);
	getFocus($('#setQuantity-quantity'), 'all');
};

SetQuantity.windowClosed = function (event) {
	this.callback = null;
}.bind(SetQuantity);

SetQuantity.confirm = function (event) {
	this.callback(read($('#setQuantity-quantity')));
	Window.close('setQuantity');
}.bind(SetQuantity);
