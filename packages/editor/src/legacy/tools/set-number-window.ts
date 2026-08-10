import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { getFocus, read, write } from '@/util/element-utils';

export const SetQuantity = {
	callback: null as unknown as ((value: any) => void) | null,
	initialize: null as unknown as (...args: unknown[]) => any,
	open: null as unknown as (...args: unknown[]) => any,
	windowClosed: null as unknown as (...args: unknown[]) => any,
	confirm: null as unknown as (...args: unknown[]) => any
};

SetQuantity.initialize = function (this: any) {
	if (!$('#setQuantity')) return;
	$('#setQuantity').on('closed', this.windowClosed);
	$('#setQuantity-confirm').on('click', this.confirm);
};

SetQuantity.open = function (this: any, quantity: any, maximum: any, callback: any) {
	this.callback = callback;
	Window.open!('setQuantity');
	($('#setQuantity-quantity').input! as HTMLInputElement).max = maximum;
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
