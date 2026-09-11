import { reactive } from 'vue';
import { getWindowStore } from '@app/stores/window';
import { requestFocus } from '@app/directives/focus';

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
	Object.assign(form, { quantity, max: maximum });
	getWindowStore().open('setQuantity');
	requestFocus('setQuantity-quantity', 'all');
};

const confirm = (): void => {
	callback?.(form.quantity);
	getWindowStore().close('setQuantity');
};

const onWindowClosed = (): void => {
	callback = null;
};

export function useSetQuantityWindow(): SetQuantityWindow {
	return { form, open, confirm, onWindowClosed };
}
