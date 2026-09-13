import { attachApi } from '../../../utils/attach-api';
import { addClass } from '../../../utils/dom';
import { NumberHistory } from '../../../utils/history';
import { createNumberBoxCore } from './number-box-core';

export interface NumberBoxApiOptions {
	dom?: HTMLElement | null;
	min?: string;
	max?: string;
	step?: string;
	unit?: string | null;
	decimals?: number;
	modelValue?: string | number;
	disabled?: boolean;
	measureText?: ((text: string, font?: string) => { width: number }) | null;
}

export interface NumberBoxApi extends HTMLElement {
	input?: HTMLInputElement;
	decimals: number;
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;
	_unit: string | null;
	_initialized: boolean;
	read(...args: unknown[]): number;
	write(...args: unknown[]): void;
	enable(...args: unknown[]): void;
	disable(...args: unknown[]): void;
	getFocus(mode?: string): void;
	on(...args: unknown[]): void;
}

interface HistoryInputElement extends HTMLInputElement {
	history: { reset(): void };
}

export function attachNumberBoxApi(
	el: HTMLElement,
	options: NumberBoxApiOptions = {}
): NumberBoxApi {
	const box = el as NumberBoxApi;
	if (box._initialized) return box;

	const input = document.createElement('input');
	addClass(input, 'number-box-input');
	input.type = 'number';
	input.min = '0';
	input.max = '0';
	input.step = '1';
	input.title = '';
	(input as HistoryInputElement).history = new NumberHistory(input);

	box.focusEventEnabled = false;
	box.blurEventEnabled = false;

	const core = createNumberBoxCore(
		{
			getRoot: () => el,
			getInput: () => input
		},
		box
	);
	const { inputKeydown, readValue, enable, disable, getFocus, on } = core;

	input.addEventListener('keydown', inputKeydown);
	input.addEventListener('change', () => {
		input.value = String(readValue(box.decimals));
	});

	const src = options.dom instanceof HTMLElement ? options.dom : el;
	const min = options.min ?? src.getAttribute('min') ?? '0';
	const max = options.max ?? src.getAttribute('max') ?? '0';
	const step = options.step ?? src.getAttribute('step') ?? '1';
	const unit = options.unit !== undefined ? options.unit : src.getAttribute('unit');
	const decimals = options.decimals ?? (parseInt(src.getAttribute('decimals') ?? '') || 0);

	input.min = min;
	input.max = max;
	input.step = step;

	box.input = input;
	box.decimals = decimals;
	box._unit = unit;

	el.appendChild(input);

	const measure = options.measureText ?? null;
	if (el.childNodes.length > 1) {
		const label = el.childNodes[0]?.textContent ?? '';
		const font = 'var(--ym-font-mono)';
		const padding = (measure ? measure(label, font).width : label.length * 8) + 8;
		input.style.paddingLeft = `${padding}px`;
	}

	if (unit !== null) {
		const unitText = document.createElement('div');
		const font = 'var(--ym-font-mono)';
		const padding = (measure ? measure(unit, font).width : unit.length * 8) + 8;
		addClass(unitText, 'unit');
		addClass(unitText, 'text');
		unitText.textContent = unit;
		el.insertBefore(unitText, input);
		input.style.paddingRight = `${padding}px`;
	}

	const read = (): number => readValue(box.decimals);

	const write = (value: string | number): void => {
		core.write(value, box.decimals);
	};

	attachApi(box, { read, write, enable, disable, getFocus, on });

	box._initialized = true;

	if (options.modelValue !== undefined && options.modelValue !== null) {
		box.write(options.modelValue);
	}
	if (options.disabled) {
		box.disable();
	}

	return box;
}

export function createNumberBoxElement(options?: NumberBoxApiOptions): NumberBoxApi {
	const el = document.createElement('div');
	el.className = 'number-box';
	return attachNumberBoxApi(el, options);
}
