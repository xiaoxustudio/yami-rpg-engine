import { reactive, ref } from 'vue';
import { composableEls } from '@app/composables/element-registry';
import { h } from 'vue';
import { getWindowStore } from '@app/stores/window';
import { on, read } from '@app/utils/element-utils';
import { renderDetached } from '@app/utils/dom';
import { requestFocus } from '@app/directives/focus';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { Command } from '@app/commands/command-object.ts';
import type { YamiElement } from '@app/types/element-api';
import { padZero } from '@app/utils/number';

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
	requestFocus('arrayList-list');
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
	requestFocus('arrayList-number-value', 'all');
};

const confirmNumber = (): number => {
	const value = numberForm.value;
	getWindowStore().close('arrayList-number');
	return value;
};

const openStringForm = (value: string): void => {
	getWindowStore().open('arrayList-string');
	Object.assign(stringForm, { value });
	requestFocus('arrayList-string-value', 'all');
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
	inputs: Record<string, YamiElement>;
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

const inputs: Record<string, YamiElement> = {
	get number() {
		return composableEls.get('arrayList-number-value') as YamiElement;
	},
	get string() {
		return composableEls.get('arrayList-string-value') as YamiElement;
	}
};

const listInterface: ArrayListInterface = {
	parsers,
	defaults,
	windows,
	inputs,
	initialize: function (this: unknown, list: YamiElement) {
		const numberConfirm = composableEls.get('arrayList-number-confirm') as YamiElement;
		if (numberConfirm) on(numberConfirm, 'click', () => list.save());
		const stringConfirm = composableEls.get('arrayList-string-confirm') as YamiElement;
		if (stringConfirm) on(stringConfirm, 'click', () => list.save());
	},
	parse: function (value: unknown, data: unknown, index: number) {
		const { filter } = targetState!;
		// 离屏节点统一走 utils/dom 的 renderDetached（原先各自 document.createElement + render）
		const indexText = renderDetached(
			h(
				'div',
				{ class: 'array-index text' },
				padZero(index, (data as ArrayLike<unknown>).length, ' ') + ':'
			)
		);
		const valueText = renderDetached(
			h('div', { class: 'array-value text' }, listInterface.parsers[filter](value))
		);
		return [indexText, valueText];
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

const getList = (): YamiElement => composableEls.get('arrayList-list') as YamiElement;

const initialize = (): void => {
	const list = getList();
	if (!list) return;
	list.bind(listInterface);

	composableEls.get('arrayList')?.addEventListener?.('close', windowClose);
	composableEls.get('arrayList')?.addEventListener?.('closed', windowClosed);
	// confirm 由 ArrayList.vue 的 @confirm 驱动（按钮由 WindowFrame 生成，注册表取不到）
};

const open = (target: ArrayListTarget): void => {
	targetState = target;
	const label = target.previousSibling;
	const alias = label.textContent;
	composableEls.get('arrayList')?.setTitle?.(alias);
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
