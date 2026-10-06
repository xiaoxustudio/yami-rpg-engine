import { getWindowStore } from '@app/stores/window';
import { getWindowFormsStore } from '@app/stores/window-forms';
import { requestFocus } from '@app/directives/focus';

export interface RenameForm {
	name: string;
}

interface RenameWindow {
	form: RenameForm;
	open: (name: string, callback: (value: string) => void) => void;
	confirm: () => void;
	onWindowClosed: () => void;
}

// 表单真源在 `stores/window-forms.ts`（原先是本文件的模块级 `reactive`）。
// 逐字段访问器 ⇒ 本文件 `Object.assign(form, { name })`、`form.name` 与模板 v-model 都不用改。
const form: RenameForm = {
	get name() {
		return getWindowFormsStore().renameForm.name;
	},
	set name(value: string) {
		getWindowFormsStore().renameForm.name = value;
	}
};
let callback: ((value: string) => void) | null = null;

const open = (name: string, cb: (value: string) => void): void => {
	callback = cb;
	Object.assign(form, { name });
	getWindowStore().open('rename');
	requestFocus('rename-name', 'all');
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
