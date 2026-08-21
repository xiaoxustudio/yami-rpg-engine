import { reactive } from 'vue';
import { getWindowStore } from '@app/stores/window';
import { getFocus } from '@app/utils/element-utils';

export interface SetQuantityForm {
	quantity: number;
	max: number;
}

interface SetQuantityWindow {
	form: SetQuantityForm;
	open: (quantity: number, maximum: number, callback: (value: number) => void) => void;
	confirm: () => void;
	onWindowClosed: () => void;
}

const form = reactive<SetQuantityForm>({ quantity: 1, max: 1 });
let callback: ((value: number) => void) | null = null;

const open = (quantity: number, maximum: number, cb: (value: number) => void): void => {
	callback = cb;
	getWindowStore().open('setQuantity');
	Object.assign(form, { quantity, max: maximum });
	const setForm = (
		document.getElementById('setQuantity') as
			| (HTMLElement & { setForm?: (data: Partial<SetQuantityForm>) => void })
			| null
	)?.setForm;
	setForm?.({ quantity, max: maximum });
	getFocus(document.getElementById('setQuantity-quantity'), 'all');
};

const confirm = (): void => {
	const getForm = (
		document.getElementById('setQuantity') as
			| (HTMLElement & { getForm?: () => SetQuantityForm })
			| null
	)?.getForm;
	callback?.(getForm?.()?.quantity ?? 0);
	getWindowStore().close('setQuantity');
};

const onWindowClosed = (): void => {
	callback = null;
};

export function useSetQuantityWindow(): SetQuantityWindow {
	return { form, open, confirm, onWindowClosed };
}
