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
	getWindowStore().open('rename');
	Object.assign(form, { name });
	const setForm = (
		document.getElementById('rename') as
			| (HTMLElement & { setForm?: (data: Partial<RenameForm>) => void })
			| null
	)?.setForm;
	setForm?.({ name });
	getFocus(document.getElementById('rename-name'), 'all');
};

const confirm = (): void => {
	const getForm = (
		document.getElementById('rename') as (HTMLElement & { getForm?: () => RenameForm }) | null
	)?.getForm;
	callback?.(getForm?.()?.name ?? '');
	getWindowStore().close('rename');
};

const onWindowClosed = (): void => {
	callback = null;
};

export function useRenameWindow(): RenameWindow {
	return { form, open, confirm, onWindowClosed };
}
