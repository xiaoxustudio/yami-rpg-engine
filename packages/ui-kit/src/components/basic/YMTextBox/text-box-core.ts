import { clamp } from '../../../utils/dom';

export interface TextBoxCoreAccess {
	getRoot: () => HTMLElement | null;
	getInput: () => HTMLInputElement | null;
}

export interface TextBoxCore {
	read: () => string;
	insert: (value: string) => void;
	enable: () => void;
	disable: () => void;
	focus: () => void;
	getFocus: (mode: string | null) => HTMLInputElement | undefined;
	setPlaceholder: (placeholder: string) => void;
	setMaxLength: (length: number) => void;
	fitContent: () => void;
	deleteInputContent: () => void;
}

export function createTextBoxCore(access: TextBoxCoreAccess): TextBoxCore {
	const getRoot = (): HTMLElement | null => access.getRoot();
	const getInput = (): HTMLInputElement | null => access.getInput();

	const read = (): string => getInput()?.value ?? '';

	const insert = (value: string): void => {
		const el = getInput();
		if (!el) return;
		el.dispatchEvent(
			new InputEvent('beforeinput', {
				inputType: 'insertFromPaste',
				data: value,
				bubbles: true
			})
		);
		document.execCommand('insertText', false, value);
	};

	const enable = (): void => {
		const el = getRoot();
		if (!el) return;
		el.classList.remove('disabled');
		for (const child of Array.from(el.children)) {
			(child as HTMLElement).style.display = '';
		}
	};

	const disable = (): void => {
		const el = getRoot();
		if (!el) return;
		el.classList.add('disabled');
		for (const child of Array.from(el.children)) {
			(child as HTMLElement).style.display = 'none';
		}
	};

	const focus = (): void => {
		getInput()?.focus();
	};

	const getFocus = (mode: string | null): HTMLInputElement | undefined => {
		const el = getInput();
		if (!el) return undefined;
		setTimeout(() => {
			el.focus();
			switch (mode) {
				case 'all':
					el.select();
					el.scrollLeft = 0;
					break;
				case 'end':
					if (typeof el.selectionStart === 'number') {
						el.setSelectionRange(el.value.length, el.value.length);
						el.scrollLeft = el.scrollWidth;
					}
					break;
			}
		});
		return el;
	};

	const setPlaceholder = (placeholder: string): void => {
		const el = getInput();
		if (el) el.placeholder = placeholder;
	};

	const setMaxLength = (length: number): void => {
		const el = getInput();
		if (el) el.maxLength = length;
	};

	const fitContent = (): void => {
		const el = getRoot();
		const input = getInput();
		if (!el || !input) return;
		const parent = el.parentNode as HTMLElement | null;
		if (!parent) return;
		el.style.width = '0';
		const parentRight = parent.getBoundingClientRect().right;
		const elLeft = el.getBoundingClientRect().left;
		el.style.width = `${clamp(input.scrollWidth + 2, 0, parentRight - elLeft)}px`;
	};

	const deleteInputContent = (): void => {
		const el = getInput();
		if (!el) return;
		if (read() !== '') {
			el.select();
			el.dispatchEvent(
				new InputEvent('beforeinput', {
					inputType: 'deleteContentForward',
					bubbles: true
				})
			);
			document.execCommand('delete');
		}
	};

	return {
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
	};
}
