import { $ } from '@app/utils/dom';
import { Window } from '@app/legacy/tools/window-object.ts';
import { getFocus } from '@app/utils/element-utils';

export interface SetQuantityForm {
	quantity: number;
	max: number;
}

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
};

SetQuantity.open = function (
	this: typeof SetQuantity,
	quantity: number,
	maximum: number,
	callback: (value: number) => void
) {
	this.callback = callback;
	Window.open!('setQuantity');
	const setForm = (
		$('#setQuantity') as
			| (HTMLElement & { setForm?: (data: Partial<SetQuantityForm>) => void })
			| null
	)?.setForm;
	setForm?.({ quantity, max: maximum });
	getFocus($('#setQuantity-quantity'), 'all');
};

SetQuantity.windowClosed = function (this: typeof SetQuantity, event: Event) {
	this.callback = null;
}.bind(SetQuantity);

SetQuantity.confirm = function (this: typeof SetQuantity, event: Event) {
	const getForm = (
		$('#setQuantity') as (HTMLElement & { getForm?: () => SetQuantityForm }) | null
	)?.getForm;
	this.callback!(getForm?.()?.quantity ?? 0);
	Window.close!('setQuantity');
}.bind(SetQuantity);
