import { clamp, roundTo } from '../../../utils/dom';

export interface NumberBoxCoreAccess {
	getRoot: () => HTMLElement | null;
	getInput: () => HTMLInputElement | null;
}

export interface NumberBoxBridgeState {
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;
}

export interface NumberBoxCore {
	inputKeydown: (event: KeyboardEvent & { cmdOrCtrlKey?: boolean }) => void;
	readValue: (decimals: number) => number;
	write: (value: string | number, decimals: number) => void;
	enable: () => void;
	disable: () => void;
	getFocus: (mode?: string) => void;
	on: (
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	) => void;
}

const whiteList = new Set([
	'Digit0',
	'Digit1',
	'Digit2',
	'Digit3',
	'Digit4',
	'Digit5',
	'Digit6',
	'Digit7',
	'Digit8',
	'Digit9',
	'Minus',
	'Period',
	'Numpad0',
	'Numpad1',
	'Numpad2',
	'Numpad3',
	'Numpad4',
	'Numpad5',
	'Numpad6',
	'Numpad7',
	'Numpad8',
	'Numpad9',
	'NumpadSubtract',
	'NumpadDecimal',
	'Backspace',
	'Delete',
	'Tab',
	'Enter',
	'ArrowLeft',
	'ArrowUp',
	'ArrowRight',
	'ArrowDown',
	'Home',
	'End',
	'NumpadEnter'
]);

export function createNumberBoxCore(
	access: NumberBoxCoreAccess,
	state: NumberBoxBridgeState
): NumberBoxCore {
	const getRoot = (): HTMLElement | null => access.getRoot();
	const getInput = (): HTMLInputElement | null => access.getInput();

	const inputKeydown = (event: KeyboardEvent & { cmdOrCtrlKey?: boolean }): void => {
		const cmdOrCtrlKey = event.cmdOrCtrlKey ?? (event.ctrlKey || event.metaKey);
		if (!whiteList.has(event.code) && !cmdOrCtrlKey) {
			event.preventDefault();
		}
	};

	const readValue = (decimals: number): number => {
		const el = getInput();
		if (!el) return 0;
		const min = parseFloat(el.min);
		const max = parseFloat(el.max);
		let value = parseFloat(el.value) || 0;
		value = clamp(value, min, max);
		return roundTo(value, decimals);
	};

	const write = (value: string | number, decimals: number): void => {
		const el = getInput();
		if (!el) return;
		el.value = String(value);
		el.value = String(readValue(decimals));
		(el as HTMLInputElement & { history?: { reset(): void } }).history?.reset();
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

	const getFocus = (mode?: string): void => {
		const el = getInput();
		if (!el) return;
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
	};

	const on = (
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void => {
		const el = getRoot();
		if (!el) return;
		el.addEventListener(type, listener, options);
		switch (type) {
			case 'focus':
				if (!state.focusEventEnabled) {
					state.focusEventEnabled = true;
					getInput()?.addEventListener('focus', () => {
						el.dispatchEvent(new FocusEvent('focus'));
					});
				}
				break;
			case 'blur':
				if (!state.blurEventEnabled) {
					state.blurEventEnabled = true;
					getInput()?.addEventListener('blur', () => {
						el.dispatchEvent(new FocusEvent('blur'));
					});
				}
				break;
		}
	};

	return { inputKeydown, readValue, write, enable, disable, getFocus, on };
}
