import { reactive, ref } from 'vue';
import { getWindowStore } from '@app/stores/window';
import { getFocus } from '@app/utils/element-utils';
import { createGetter } from '@app/i18n';

export interface ArrayForm {
	values: unknown[];
}

export interface ArrayNumberForm {
	value: number;
}

export interface ArrayStringForm {
	value: string;
}

interface ArrayWindow {
	form: ArrayForm;
	numberForm: ArrayNumberForm;
	stringForm: ArrayStringForm;
	changed: boolean;
	open: (values: unknown[], callback: (value: unknown) => void) => void;
	confirm: () => void;
	markChanged: () => void;
	onWindowClose: (event: Event) => void;
	onWindowClosed: () => void;
	openNumber: (value: number) => void;
	confirmNumber: () => number;
	openString: (value: string) => void;
	confirmString: () => string;
}

type ArrayFrame = HTMLElement & {
	setForm?: (data: Record<string, unknown>) => void;
	getForm?: () => Record<string, unknown>;
};

const form = reactive<ArrayForm>({ values: [] });
const numberForm = reactive<ArrayNumberForm>({ value: 0 });
const stringForm = reactive<ArrayStringForm>({ value: '' });
const changedState = ref(false);
let callback: ((value: unknown) => void) | null = null;

const getFrame = (windowId: string): ArrayFrame | null =>
	document.getElementById(windowId) as ArrayFrame | null;

const open = (values: unknown[], cb: (value: unknown) => void): void => {
	callback = cb;
	getWindowStore().open('arrayList');
	Object.assign(form, { values });
	getFrame('arrayList')?.setForm?.({ values });
	getFocus(document.getElementById('arrayList-list'));
};

const confirm = (): void => {
	changedState.value = false;
	callback?.(getFrame('arrayList')?.getForm?.()?.values);
	getWindowStore().close('arrayList');
};

const markChanged = (): void => {
	changedState.value = true;
};

const onWindowClose = (event: Event): void => {
	if (changedState.value) {
		event.preventDefault();
		const get = createGetter('confirmation');
		getWindowStore().confirm(
			{
				message: get('closeUnsavedData')
			},
			[
				{
					label: get('yes'),
					click: () => {
						changedState.value = false;
						getWindowStore().close('arrayList');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
};

const onWindowClosed = (): void => {
	callback = null;
};

const openNumber = (value: number): void => {
	getWindowStore().open('arrayList-number');
	Object.assign(numberForm, { value });
	getFrame('arrayList-number')?.setForm?.({ value });
	getFocus(document.getElementById('arrayList-number-value'), 'all');
};

const confirmNumber = (): number => {
	const value = getFrame('arrayList-number')?.getForm?.()?.value as number;
	getWindowStore().close('arrayList-number');
	return value;
};

const openString = (value: string): void => {
	getWindowStore().open('arrayList-string');
	Object.assign(stringForm, { value });
	getFrame('arrayList-string')?.setForm?.({ value });
	getFocus(document.getElementById('arrayList-string-value'), 'all');
};

const confirmString = (): string => {
	const value = getFrame('arrayList-string')?.getForm?.()?.value as string;
	getWindowStore().close('arrayList-string');
	return value;
};

export function useArrayWindow(): ArrayWindow {
	return {
		form,
		numberForm,
		stringForm,
		get changed() {
			return changedState.value;
		},
		open,
		confirm,
		markChanged,
		onWindowClose,
		onWindowClosed,
		openNumber,
		confirmNumber,
		openString,
		confirmString
	};
}
