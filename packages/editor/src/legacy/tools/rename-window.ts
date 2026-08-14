import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { getFocus } from '@/util/element-utils';

export interface RenameForm {
	name: string;
}

export const Rename: {
	callback: ((value: string) => void) | null;
	initialize: (this: typeof Rename) => void;
	open: (this: typeof Rename, name: string, callback: (value: string) => void) => void;
	windowClosed: (this: typeof Rename, event: Event) => void;
	confirm: (this: typeof Rename, event: Event) => void;
} = {
	callback: null as unknown as ((value: string) => void) | null,
	initialize: null as unknown as (this: typeof Rename) => void,
	open: null as unknown as (
		this: typeof Rename,
		name: string,
		callback: (value: string) => void
	) => void,
	windowClosed: null as unknown as (this: typeof Rename, event: Event) => void,
	confirm: null as unknown as (this: typeof Rename, event: Event) => void
};

Rename.initialize = function (this: typeof Rename) {
	if (!$('#rename')) return;
	$('#rename').on('closed', this.windowClosed);
};

Rename.open = function (this: typeof Rename, name: string, callback: (value: string) => void) {
	this.callback = callback;
	Window.open!('rename');
	const setForm = (
		$('#rename') as (HTMLElement & { setForm?: (data: Partial<RenameForm>) => void }) | null
	)?.setForm;
	setForm?.({ name });
	getFocus($('#rename-name'), 'all');
};

Rename.windowClosed = function (this: typeof Rename, event: Event) {
	this.callback = null;
}.bind(Rename);

Rename.confirm = function (this: typeof Rename, event: Event) {
	const getForm = ($('#rename') as (HTMLElement & { getForm?: () => RenameForm }) | null)
		?.getForm;
	this.callback!(getForm?.()?.name ?? '');
	Window.close!('rename');
}.bind(Rename);
