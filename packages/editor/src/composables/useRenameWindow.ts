/* oxlint-disable eslint/no-restricted-properties */
import { reactive } from 'vue';
import { getWindowStore } from '@app/stores/window';
import { getFocus } from '@app/utils/element-utils';

export interface RenameForm {
	name: string;
}

interface RenameWindow {
	form: RenameForm;
	open: (name: string, callback: (value: string) => void) => void;
	confirm: () => void;
	onWindowClosed: () => void;
}

const form = reactive<RenameForm>({ name: '' });
let callback: ((value: string) => void) | null = null;

const open = (name: string, cb: (value: string) => void): void => {
	callback = cb;
	Object.assign(form, { name });
	getWindowStore().open('rename');
	getFocus(document.getElementById('rename-name'), 'all');
};

const confirm = (): void => {
	callback?.(form.name);
	getWindowStore().close('rename');
};

const onWindowClosed = (): void => {
	callback = null;
};

export function useRenameWindow(): RenameWindow {
	return { form, open, confirm, onWindowClosed };
}

export const Rename = {
	callback: null as ((value: string) => void) | null,
	initialize: (): void => undefined,
	open,
	windowClosed: onWindowClosed,
	confirm
};
