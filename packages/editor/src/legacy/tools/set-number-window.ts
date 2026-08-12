import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { getFocus, read, write } from '@/util/element-utils';

export const SetQuantity = {
	callback: null as unknown as ((value: number) => void) | null,
	initialize: null as unknown as () => void,
	open: null as unknown as (
		quantity: number,
		maximum: number,
		callback: (value: number) => void
	) => void,
	windowClosed: null as unknown as (event: Event) => void,
	confirm: null as unknown as (event: Event) => void
};

SetQuantity.initialize = function (this: typeof SetQuantity) {
	if (!$('#setQuantity')) return;
	$('#setQuantity').on('closed', this.windowClosed);
	$('#setQuantity-confirm').on('click', this.confirm);
};

SetQuantity.open = function (
	this: typeof SetQuantity,
	quantity: number,
	maximum: number,
	callback: (value: number) => void
) {
	this.callback = callback;
	Window.open!('setQuantity');
	($('#setQuantity-quantity').input! as HTMLInputElement).max = maximum as unknown as string;
	write($('#setQuantity-quantity'), quantity);
	getFocus($('#setQuantity-quantity'), 'all');
};

SetQuantity.windowClosed = function (this: typeof SetQuantity, event: Event) {
	this.callback = null;
}.bind(SetQuantity);

SetQuantity.confirm = function (this: typeof SetQuantity, event: Event) {
	this.callback!(read($('#setQuantity-quantity')));
	Window.close!('setQuantity');
}.bind(SetQuantity);
