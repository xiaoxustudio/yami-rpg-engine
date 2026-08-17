import { reactive } from 'vue';
import { Window } from '@app/legacy/tools/window-object.ts';
import { getFocus } from '@app/legacy/util/element-utils';

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
	Window.open!('rename');
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
	Window.close!('rename');
};

const onWindowClosed = (): void => {
	callback = null;
};

export function useRenameWindow(): RenameWindow {
	return { form, open, confirm, onWindowClosed };
}
