import { $ } from '@/util/dom.ts';
import { getFocus, read, write } from '@/util/element-utils';
import { Window } from './window-object.ts';

export const SetQuantity = {
	callback: null as any,
	initialize: null as any,
	open: null as any,
	windowClosed: null as any,
	confirm: null as any
};

SetQuantity.initialize = function (this: any) {
	if (!$('#setQuantity')) return;
	$('#setQuantity').on('closed', this.windowClosed);
	$('#setQuantity-confirm').on('click', this.confirm);
};

SetQuantity.open = function (this: any, quantity: any, maximum: any, callback: any) {
	this.callback = callback;
	Window.open!('setQuantity');
	$('#setQuantity-quantity').input.max = maximum;
	write($('#setQuantity-quantity'), quantity);
	getFocus($('#setQuantity-quantity'), 'all');
};

SetQuantity.windowClosed = function (this: any, event: any) {
	this.callback = null;
}.bind(SetQuantity);

SetQuantity.confirm = function (this: any, event: any) {
	this.callback(read($('#setQuantity-quantity')));
	Window.close!('setQuantity');
}.bind(SetQuantity);
