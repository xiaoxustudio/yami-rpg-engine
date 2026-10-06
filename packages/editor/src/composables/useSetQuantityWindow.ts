import { getWindowFormsStore } from '@app/stores/window-forms';
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

// 表单真源在 `stores/window-forms.ts`（原先是本文件的模块级 `reactive`）。
// 逐字段访问器 ⇒ `Object.assign(form, …)`、`const data = form` 与模板 v-model 都不用改。
const form: SetQuantityForm = {
	get quantity(): SetQuantityForm['quantity'] {
		return getWindowFormsStore().setQuantityForm.quantity;
	},
	set quantity(value: SetQuantityForm['quantity']) {
		getWindowFormsStore().setQuantityForm.quantity = value;
	},
	get max(): SetQuantityForm['max'] {
		return getWindowFormsStore().setQuantityForm.max;
	},
	set max(value: SetQuantityForm['max']) {
		getWindowFormsStore().setQuantityForm.max = value;
	}
};
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
