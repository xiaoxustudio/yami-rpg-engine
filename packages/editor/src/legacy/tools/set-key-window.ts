import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { getFocus } from '@/util/element-utils';

export interface SetKeyForm {
	key: string;
}

export const SetKey = {
	callback: null as ((key: string) => void) | null,
	initialize: null as (() => void) | null,
	open: null as ((key: string, callback: (key: string) => void) => void) | null,
	windowClosed: null as ((event: Event) => void) | null,
	confirm: null as ((event: Event) => void) | null
};

SetKey.initialize = function () {
	if (!$('#setKey')) return;
	$('#setKey').on('closed', this.windowClosed);
};

SetKey.open = function (key, callback) {
	this.callback = callback;
	Window.open!('setKey');
	const setForm = (
		$('#setKey') as (HTMLElement & { setForm?: (data: Partial<SetKeyForm>) => void }) | null
	)?.setForm;
	setForm?.({ key });
	getFocus($('#setKey-key'), 'all');
};

SetKey.windowClosed = function (this: typeof SetKey, event: Event) {
	this.callback = null;
}.bind(SetKey);

SetKey.confirm = function (this: typeof SetKey, event: Event) {
	const getForm = ($('#setKey') as (HTMLElement & { getForm?: () => SetKeyForm }) | null)
		?.getForm;
	this.callback!(getForm?.()?.key ?? '');
	Window.close!('setKey');
}.bind(SetKey);
