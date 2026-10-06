import { getWindowStore } from '@app/stores/window';
import { getWindowFormsStore } from '@app/stores/window-forms';
import { requestFocus } from '@app/directives/focus';

export interface SetKeyForm {
	key: string;
}

interface SetKeyWindow {
	form: SetKeyForm;
	open: (key: string, callback: (key: string) => void) => void;
	confirm: () => void;
	onWindowClosed: () => void;
}

const form: SetKeyForm = {
	get key() {
		return getWindowFormsStore().setKeyForm.key;
	},
	set key(value: string) {
		getWindowFormsStore().setKeyForm.key = value;
	}
};
let callback: ((key: string) => void) | null = null;

const open = (key: string, cb: (key: string) => void): void => {
	callback = cb;
	Object.assign(form, { key });
	getWindowStore().open('setKey');
	requestFocus('setKey-key', 'all');
};

const confirm = (): void => {
	callback?.(form.key);
	getWindowStore().close('setKey');
};

const onWindowClosed = (): void => {
	callback = null;
};

export function useSetKeyWindow(): SetKeyWindow {
	return { form, open, confirm, onWindowClosed };
}

export const SetKey = {
	callback: null as ((key: string) => void) | null,
	initialize: (): void => undefined,
	open,
	windowClosed: onWindowClosed,
	confirm
};
