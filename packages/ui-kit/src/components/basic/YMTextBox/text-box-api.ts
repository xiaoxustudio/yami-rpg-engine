import { attachApi } from '../../../utils/attach-api';

export interface TextBoxApiOptions {
	id?: string;
	modelValue?: string;
	disabled?: boolean;
}

export interface TextBoxApi extends HTMLElement {
	input?: HTMLInputElement;
	lastText: string;
	hiddenNodes: HTMLElement[];
	_initialized: boolean;
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

const clamp = (value: number, min: number, max: number): number =>
	Math.min(Math.max(value, min), max);

export function attachTextBoxApi(el: HTMLElement, options: TextBoxApiOptions = {}): TextBoxApi {
	const box = el as TextBoxApi;
	if (box._initialized) return box;

	const input = document.createElement('input');
	input.className = 'text-box-input';
	input.type = 'text';
	box.appendChild(input);
	box.input = input;

	box.lastText = '';
	box.hiddenNodes = [];

	let isEditing = false;
	const keydownFilters: ((event: KeyboardEvent) => boolean)[] = [];

	const read = (): string => input.value;
	const write = (value: string): void => {
		input.value = value;
		box.lastText = value;
	};
	const insert = (value: string): void => {
		input.dispatchEvent(
			new InputEvent('beforeinput', {
				inputType: 'insertFromPaste',
				data: value,
				bubbles: true
			})
		);
		document.execCommand('insertText', false, value);
	};
	const enable = (): void => {
		box.classList.remove('disabled');
		for (const child of Array.from(box.children)) {
			(child as HTMLElement).style.display = '';
		}
	};
	const disable = (): void => {
		box.classList.add('disabled');
		for (const child of Array.from(box.children)) {
			(child as HTMLElement).style.display = 'none';
		}
	};
	const focus = (): void => {
		input.focus();
	};
	const getFocus = (mode: string | null): HTMLInputElement | undefined => {
		setTimeout(() => {
			input.focus();
			switch (mode) {
				case 'all':
					input.select();
					input.scrollLeft = 0;
					break;
				case 'end':
					if (typeof input.selectionStart === 'number') {
						input.setSelectionRange(input.value.length, input.value.length);
						input.scrollLeft = input.scrollWidth;
					}
					break;
			}
		});
		return input;
	};
	const setPlaceholder = (placeholder: string): void => {
		input.placeholder = placeholder;
	};
	const setMaxLength = (maxLength: number): void => {
		input.maxLength = maxLength;
	};
	const fitContent = (): void => {
		const parent = box.parentNode as HTMLElement;
		if (!parent) return;
		box.style.width = '0';
		const parentRight = parent.getBoundingClientRect().right;
		const elLeft = box.getBoundingClientRect().left;
		box.style.width = `${clamp(input.scrollWidth + 2, 0, parentRight - elLeft)}px`;
	};
	const deleteInputContent = (): void => {
		if (read() !== '') {
			input.select();
			input.dispatchEvent(
				new InputEvent('beforeinput', {
					inputType: 'deleteContentForward',
					bubbles: true
				})
			);
			document.execCommand('delete');
		}
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
		box.lastText = read();
	});
	input.addEventListener('change', () => {
		box.dispatchEvent(new Event('change', { bubbles: true }));
	});

	box._initialized = true;

	attachApi(box, {
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
