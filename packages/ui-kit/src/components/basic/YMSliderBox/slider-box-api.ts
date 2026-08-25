import { attachApi } from '../../../utils/attach-api';
import { addClass, removeClass, read } from '../../../utils/dom';
import type { NumberBoxApi } from '../YMNumberBox/number-box-api';

export interface SliderBoxApiOptions {
	min?: string;
	max?: string;
	step?: string;
	activeWheel?: boolean;
	modelValue?: unknown;
	disabled?: boolean;
}

export interface SliderBoxApi extends HTMLElement {
	bar?: HTMLElement | null;
	filler?: HTMLElement | null;
	input?: HTMLInputElement;
	synchronizer: NumberBoxApi | null;
	step: number;
	activeWheel: boolean;
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;
	_initialized: boolean;
	read(...args: unknown[]): number;
	write(...args: unknown[]): void;
	enable(...args: unknown[]): void;
	disable(...args: unknown[]): void;
	updateFiller(): void;
	synchronize(target: NumberBoxApi): void;
	on(...args: unknown[]): void;
	sliderInput(event?: Event): void;
	inputWheel(event: WheelEvent): void;
}

const roundTo = (value: number, decimals: number): number => {
	const factor = Math.pow(10, decimals);
	return Math.round(value * factor) / factor;
};

const showChildNodes = (el: HTMLElement): void => {
	for (const child of Array.from(el.children)) {
		(child as HTMLElement).style.display = '';
	}
};

const hideChildNodes = (el: HTMLElement): void => {
	for (const child of Array.from(el.children)) {
		(child as HTMLElement).style.display = 'none';
	}
};

export function attachSliderBoxApi(
	el: HTMLElement,
	options: SliderBoxApiOptions = {}
): SliderBoxApi {
	const box = el as unknown as SliderBoxApi;
	if (box._initialized) return box;

	const bar = document.createElement('div');
	const filler = document.createElement('div');
	addClass(bar, 'slider-bar');
	addClass(filler, 'slider-filler');
	bar.appendChild(filler);

	const input = document.createElement('input');
	addClass(input, 'slider-input');
	input.type = 'range';
	input.tabIndex = -1;

	box.bar = bar;
	box.filler = filler;
	box.input = input;
	box.synchronizer = null;
	box.focusEventEnabled = false;
	box.blurEventEnabled = false;

	input.min = options.min ?? el.getAttribute('min') ?? '0';
	input.max = options.max ?? el.getAttribute('max') ?? '0';
	input.step = options.step ?? el.getAttribute('step') ?? '1';
	box.activeWheel = options.activeWheel ?? el.hasAttribute('active-wheel');

	el.appendChild(bar);
	el.appendChild(input);

	const updateFiller = function (): void {
		const value = read(box) as number;
		if ((filler as HTMLElement & { value?: number }).value !== value) {
			(filler as HTMLElement & { value?: number }).value = value;
			const min = parseFloat(input.min);
			const max = parseFloat(input.max);
			if (min !== max) {
				const p = roundTo(((value - min) * 100) / (max - min), 6);
				filler.style.width = `${p}%`;
			}
		}
	};

	const readValue = function (): number {
		return parseFloat(input.value);
	};

	const write = function (value: unknown): void {
		input.value = value as string;
		box.updateFiller();
	};

	const enable = function (): void {
		if (removeClass(box, 'disabled')) {
			showChildNodes(box);
		}
	};

	const disable = function (): void {
		if (addClass(box, 'disabled')) {
			hideChildNodes(box);
		}
	};

	const synchronize = function (target: NumberBoxApi): void {
		const slider = box;
		const number = target;
		if (slider.synchronizer) {
			return;
		}

		if (
			number &&
			number.input instanceof HTMLInputElement &&
			typeof number.write === 'function'
		) {
			// oxlint-disable-next-line unbound-method
			const writeSlider = slider.write;
			// oxlint-disable-next-line unbound-method
			const writeNumber = number.write;

			const sliderPointerdown = () => {
				slider.input!.focus();
			};

			const sliderInput = (event?: Event) => {
				writeNumber.call(number, read(slider));
				if (event) number.dispatchEvent(new Event('input'));
			};

			const numberInput = (event?: Event) => {
				writeSlider.call(slider, read(number));
				if (event) slider.dispatchEvent(new Event('input'));
			};

			slider.synchronizer = target;

			input.addEventListener('pointerdown', sliderPointerdown);
			input.addEventListener('input', sliderInput);
			number.input.addEventListener('input', numberInput);

			slider.write = (value: unknown) => {
				writeSlider.call(slider, value);
				sliderInput();
			};

			number.write = (value: unknown) => {
				writeNumber.call(number, value);
				numberInput();
			};
		}
	};

	const sliderInput = function (): void {
		box.updateFiller();
	};

	const inputWheel = function (this: SliderBoxApi, event: WheelEvent): void {
		if (event.deltaY === 0) return;
		const parent = this.parentNode as (HTMLElement & { activeWheel?: boolean }) | null;
		if (parent?.activeWheel) {
			event.preventDefault();
			const inputEl = this as unknown as HTMLInputElement;
			const last = inputEl.value;
			inputEl.value = String(
				roundTo(
					parseFloat(inputEl.value) +
						parseFloat(inputEl.step) * (event.deltaY > 0 ? -1 : 1),
					2
				)
			);
			if (inputEl.value !== last) {
				inputEl.dispatchEvent(
					new Event('input', {
						bubbles: true
					})
				);
			}
		}
	};

	const on = function (
		type: string,
		listener: (event: Event) => void,
		listenerOptions?: boolean | AddEventListenerOptions
	): void {
		box.addEventListener(type, listener as EventListener, listenerOptions);
		switch (type) {
			case 'focus':
				if (!box.focusEventEnabled) {
					box.focusEventEnabled = true;
					input.addEventListener('focus', () => {
						box.dispatchEvent(new FocusEvent('focus'));
					});
				}
				break;
			case 'blur':
				if (!box.blurEventEnabled) {
					box.blurEventEnabled = true;
					input.addEventListener('blur', () => {
						box.dispatchEvent(new FocusEvent('blur'));
					});
				}
				break;
		}
	};

	attachApi(box, {
		updateFiller,
		read: readValue,
		write,
		enable,
		disable,
		synchronize,
		sliderInput,
		inputWheel,
		on
	});

	box._initialized = true;
	// oxlint-disable-next-line unbound-method
	input.addEventListener('wheel', box.inputWheel, { passive: true });
	// oxlint-disable-next-line unbound-method
	box.addEventListener('input', box.sliderInput);

	if (options.modelValue !== undefined && options.modelValue !== null) {
		box.write(options.modelValue);
	}
	if (options.disabled) {
		box.disable();
	}

	return box;
}

export function createSliderBoxElement(options?: SliderBoxApiOptions): SliderBoxApi {
	const el = document.createElement('div');
	el.className = 'slider-box';
	return attachSliderBoxApi(el, options);
}
