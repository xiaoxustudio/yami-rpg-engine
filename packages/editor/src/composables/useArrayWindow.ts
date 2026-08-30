/* oxlint-disable eslint/no-restricted-properties */
import { reactive, ref } from 'vue';
import { h, render } from 'vue';
import { getWindowStore } from '@app/stores/window';
import { getFocus, on, read } from '@app/utils/element-utils';
import { getYamiI18n } from '@app/i18n';

const t = (key: string) => getYamiI18n().global.t(key);
import { $ } from '@app/utils/dom';
import { Command } from '@app/commands/command-object.ts';

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

const form = reactive<ArrayForm>({ values: [] });
const numberForm = reactive<ArrayNumberForm>({ value: 0 });
const stringForm = reactive<ArrayStringForm>({ value: '' });
const changedState = ref(false);
let callback: ((value: unknown) => void) | null = null;

const openForm = (values: unknown[], cb: (value: unknown) => void): void => {
	callback = cb;
	getWindowStore().open('arrayList');
	Object.assign(form, { values });
	getFocus(document.getElementById('arrayList-list'));
};

const confirmForm = (): void => {
	changedState.value = false;
	callback?.(form.values);
	getWindowStore().close('arrayList');
};

const markChanged = (): void => {
	changedState.value = true;
};

const onWindowClose = (event: Event): void => {
	if (changedState.value) {
		event.preventDefault();
		const get = (key: string) => t('confirmation.' + key);
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

const openNumberForm = (value: number): void => {
	getWindowStore().open('arrayList-number');
	Object.assign(numberForm, { value });
	getFocus(document.getElementById('arrayList-number-value'), 'all');
};

const confirmNumber = (): number => {
	const value = numberForm.value;
	getWindowStore().close('arrayList-number');
	return value;
};

const openStringForm = (value: string): void => {
	getWindowStore().open('arrayList-string');
	Object.assign(stringForm, { value });
	getFocus(document.getElementById('arrayList-string-value'), 'all');
};

const confirmString = (): string => {
	const value = stringForm.value;
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
		open: openForm,
		confirm: confirmForm,
		markChanged,
		onWindowClose,
		onWindowClosed,
		openNumber: openNumberForm,
		confirmNumber,
		openString: openStringForm,
		confirmString
	};
}

interface ArrayListTarget {
	previousSibling: Node;
	filter: string;
	input?: (value: unknown) => void;
	[k: string]: unknown;
}

interface ArrayListInterface {
	parsers: Record<string, (value: unknown) => string>;
	defaults: Record<string, number | string>;
	windows: Record<string, string>;
	inputs: Record<string, HTMLElement>;
	initialize(list: HTMLElement): void;
	parse(value: unknown, data: unknown, index: number): HTMLElement[];
	open(value: unknown): void;
	save(): unknown;
}

let targetState: ArrayListTarget | null = null;

const parsers: Record<string, (value: unknown) => string> = {
	number: (number: unknown) => (number as number | string).toString(),
	string: (string: unknown) => Command.parseMultiLineString!(string as string)
};

const defaults: Record<string, number | string> = {
	number: 0,
	string: ''
};

const windows: Record<string, string> = {
	number: 'arrayList-number',
	string: 'arrayList-string'
};

const inputs: Record<string, HTMLElement> = {
	get number() {
		return $('#arrayList-number-value');
	},
	get string() {
		return $('#arrayList-string-value');
	}
};

const listInterface: ArrayListInterface = {
	parsers,
	defaults,
	windows,
	inputs,
	initialize: function (this: unknown, list: HTMLElement) {
		const numberConfirm = $('#arrayList-number-confirm');
		if (numberConfirm) on(numberConfirm, 'click', () => list.save());
		const stringConfirm = $('#arrayList-string-confirm');
		if (stringConfirm) on(stringConfirm, 'click', () => list.save());
	},
	parse: function (value: unknown, data: unknown, index: number) {
		const { filter } = targetState!;
		const indexText = document.createElement('div');
		render(
			h(
				'div',
				{ class: 'array-index text' },
				Number.padZero(index, (data as ArrayLike<unknown>).length, ' ') + ':'
			),
			indexText
		);
		const valueText = document.createElement('div');
		render(
			h('div', { class: 'array-value text' }, listInterface.parsers[filter](value)),
			valueText
		);
		return [
			indexText.firstElementChild as HTMLElement,
			valueText.firstElementChild as HTMLElement
		];
	},
	open: function (value: unknown) {
		const { filter } = targetState!;
		value = value ?? listInterface.defaults[filter];
		if (filter === 'number') {
			openNumberForm(value as number);
		} else {
			openStringForm(value as string);
		}
	},
	save: function () {
		const { filter } = targetState!;
		if (filter === 'number') {
			return confirmNumber();
		}
		return confirmString();
	}
};

const getList = (): HTMLElement => $('#arrayList-list');

const initialize = (): void => {
	const list = getList();
	if (!list) return;
	list.bind(listInterface);

	$('#arrayList').addEventListener('close', windowClose);
	$('#arrayList').addEventListener('closed', windowClosed);
	on($('#arrayList-confirm'), 'click', confirm);
};

const open = (target: ArrayListTarget): void => {
	targetState = target;
	const label = target.previousSibling;
	const alias = label.textContent;
	$('#arrayList').setTitle(alias);
	openForm(read(target).slice(), (value) => {
		targetState?.input?.(value);
	});
};

const windowClose = (event: Event): void => {
	onWindowClose(event);
};

const windowClosed = (_event: Event): void => {
	targetState = null;
	getList().clear();
	onWindowClosed();
};

const listChange = (_event?: Event): void => {
	markChanged();
};

const confirm = (_event: Event): void => {
	confirmForm();
};

export const ArrayList: {
	get list(): HTMLElement;
	target: ArrayListTarget | null;
	changed: boolean;
	interface: ArrayListInterface;
	initialize: (list?: HTMLElement) => void;
	open: (target: ArrayListTarget) => void;
	windowClose: (event: Event) => void;
	windowClosed: (event: Event) => void;
	listChange: (event?: Event) => void;
	confirm: (event: Event) => void;
} = {
	get list() {
		return getList();
	},
	target: null as ArrayListTarget | null,
	get changed() {
		return changedState.value;
	},
	interface: listInterface,
	initialize,
	open,
	windowClose,
	windowClosed,
	listChange,
	confirm
};
