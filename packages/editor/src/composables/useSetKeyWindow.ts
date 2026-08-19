import { reactive } from 'vue';
import { Window } from '@app/legacy/tools/window-object.ts';
import { getFocus } from '@app/utils/element-utils';

export interface SetKeyForm {
	key: string;
}

interface SetKeyWindow {
	form: SetKeyForm;
	open: (key: string, callback: (key: string) => void) => void;
	confirm: () => void;
	onWindowClosed: () => void;
}

const form = reactive<SetKeyForm>({ key: '' });
let callback: ((key: string) => void) | null = null;

const open = (key: string, cb: (key: string) => void): void => {
	callback = cb;
	Window.open!('setKey');
	Object.assign(form, { key });
	const setForm = (
		document.getElementById('setKey') as
			| (HTMLElement & { setForm?: (data: Partial<SetKeyForm>) => void })
			| null
	)?.setForm;
	setForm?.({ key });
	getFocus(document.getElementById('setKey-key'), 'all');
};

const confirm = (): void => {
	const getForm = (
		document.getElementById('setKey') as (HTMLElement & { getForm?: () => SetKeyForm }) | null
	)?.getForm;
	callback?.(getForm?.()?.key ?? '');
	Window.close!('setKey');
};

const onWindowClosed = (): void => {
	callback = null;
};

export function useSetKeyWindow(): SetKeyWindow {
	return { form, open, confirm, onWindowClosed };
}
