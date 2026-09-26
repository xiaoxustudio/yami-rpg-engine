import { attachApi } from '../../../utils/attach-api';
import { elementDataOf, isApiAttached, markApiAttached } from '../../../utils/element-data';
import { createTextBoxCore } from './text-box-core';

export interface TextBoxApiOptions {
	id?: string;
	modelValue?: string;
	disabled?: boolean;
}

export interface TextBoxApi extends HTMLElement {
	input?: HTMLInputElement;
	lastText: string;
	hiddenNodes: HTMLElement[];
	read(...args: unknown[]): string;
	write(...args: unknown[]): void;
	insert(...args: unknown[]): void;
	enable(...args: unknown[]): void;
	disable(...args: unknown[]): void;
	focus(...args: unknown[]): void;
	getFocus(...args: unknown[]): unknown;
	setPlaceholder(...args: unknown[]): void;
	setMaxLength(...args: unknown[]): void;
	fitContent(...args: unknown[]): void;
	deleteInputContent(...args: unknown[]): void;
	addCloseButton(...args: unknown[]): void;
	addKeydownFilter(fn: (event: KeyboardEvent) => boolean): void;
	on(...args: unknown[]): void;
}

export function attachTextBoxApi(el: HTMLElement, options: TextBoxApiOptions = {}): TextBoxApi {
	const box = el as TextBoxApi;
	if (isApiAttached(box)) return box;

	const input = document.createElement('input');
	input.className = 'text-box-input';
	input.type = 'text';
	box.appendChild(input);
	box.input = input;

	// 这两个字段走显式元素数据（已从 DATA_FIELDS 摘除）
	const data = elementDataOf<TextBoxApi>(box);
	data.lastText = '';
	data.hiddenNodes = [];

	let isEditing = false;
	const keydownFilters: ((event: KeyboardEvent) => boolean)[] = [];

	const core = createTextBoxCore({
		getRoot: () => box,
		getInput: () => input
	});
	const {
		read,
		insert,
		enable,
		disable,
		focus,
		getFocus,
		setPlaceholder,
		setMaxLength,
		fitContent,
		deleteInputContent
	} = core;

	const write = (value: string): void => {
		input.value = value;
		data.lastText = value;
	};
	const addCloseButton = (): void => {
		const close = document.createElement('button');
		close.className = 'text-box-close';
		close.textContent = '×';
		close.addEventListener('click', () => {
			write('');
			box.dispatchEvent(new Event('change', { bubbles: true }));
		});
		box.appendChild(close);
	};
	const addKeydownFilter = (fn: (event: KeyboardEvent) => boolean): void => {
		keydownFilters.push(fn);
	};
	const on = (
		type: string,
		listener: (event: Event) => void,
		listenerOptions?: boolean | AddEventListenerOptions
	): void => {
		box.addEventListener(type, listener as EventListener, listenerOptions);
	};

	input.addEventListener('compositionstart', () => {
		isEditing = true;
	});
	input.addEventListener('compositionend', () => {
		isEditing = false;
	});
	input.addEventListener(
		'keydown',
		(e) => {
			if (isEditing) {
				switch (e.code) {
					case 'Escape':
					case 'Enter':
						e.stopPropagation();
						return;
				}
			}
			for (const fn of keydownFilters) {
				if (fn(e)) {
					e.stopPropagation();
					e.preventDefault();
					return;
				}
			}
		},
		{ capture: true }
	);
	input.addEventListener('input', () => {
		data.lastText = read();
	});
	input.addEventListener('change', () => {
		box.dispatchEvent(new Event('change', { bubbles: true }));
	});

	markApiAttached(box);

	attachApi<TextBoxApi>(box, {
		read,
		write,
		insert,
		enable,
		disable,
		focus,
		getFocus,
		setPlaceholder,
		setMaxLength,
		fitContent,
		deleteInputContent,
		addCloseButton,
		addKeydownFilter,
		on
	});

	if (options.modelValue !== undefined) {
		write(options.modelValue);
	}
	if (options.disabled) {
		disable();
	}

	return box;
}

export function createTextBoxElement(options?: TextBoxApiOptions): TextBoxApi {
	const el = document.createElement('div');
	el.className = 'text-box';
	if (options?.id) el.id = options.id;
	return attachTextBoxApi(el, options);
}
