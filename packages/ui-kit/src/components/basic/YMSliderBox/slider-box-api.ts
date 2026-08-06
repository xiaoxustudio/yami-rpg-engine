import { addClass, removeClass, read } from '../../../utils/dom';

export interface SliderBoxApiOptions {
	min?: string;
	max?: string;
	step?: string;
	activeWheel?: boolean;
	modelValue?: any;
	disabled?: boolean;
}

export interface SliderBoxApi extends HTMLElement {
	bar: HTMLElement;
	filler: HTMLElement;
	input: HTMLInputElement;
	synchronizer: HTMLElement & { value: any; [k: string]: any };
	step: number;
	activeWheel: boolean;
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;
	_initialized: boolean;
	read(): number;
	write(value: any): void;
	enable(): void;
	disable(): void;
	updateFiller(): void;
	synchronize(target: any): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
	sliderInput(event?: any): void;
	inputWheel(event: any): void;
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
	const box = el as SliderBoxApi;
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
	box.synchronizer = null as any;
	box.focusEventEnabled = false;
	box.blurEventEnabled = false;

	input.min = options.min ?? el.getAttribute('min') ?? '0';
	input.max = options.max ?? el.getAttribute('max') ?? '0';
	input.step = options.step ?? el.getAttribute('step') ?? '1';
	box.activeWheel = options.activeWheel ?? el.hasAttribute('active-wheel');

	el.appendChild(bar);
	el.appendChild(input);

	box.updateFiller = function (): void {
		const value = read(box);
		if ((filler as any).value !== value) {
			(filler as any).value = value;
			const min = parseFloat(input.min);
			const max = parseFloat(input.max);
			if (min !== max) {
				const p = roundTo(((value - min) * 100) / (max - min), 6);
				filler.style.width = `${p}%`;
			}
		}
	};

	box.read = function (): number {
		return parseFloat(input.value);
	};

	box.write = function (value: any): void {
		input.value = value;
		box.updateFiller();
	};

	box.enable = function (): void {
		if (removeClass(box, 'disabled')) {
			showChildNodes(box);
		}
	};

	box.disable = function (): void {
		if (addClass(box, 'disabled')) {
			hideChildNodes(box);
		}
	};

	box.synchronize = function (target: any): void {
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
			const writeSlider = slider.write;
			const writeNumber = number.write;

			const sliderPointerdown = () => {
				slider.input.focus();
			};

			const sliderInput = (event?: any) => {
				writeNumber.call(number, read(slider));
				event && number.dispatchEvent(new Event('input'));
			};

			const numberInput = (event?: any) => {
				writeSlider.call(slider, read(number));
				event && slider.dispatchEvent(new Event('input'));
			};

			slider.synchronizer = target;

			input.addEventListener('pointerdown', sliderPointerdown);
			input.addEventListener('input', sliderInput);
			number.input.addEventListener('input', numberInput);

			slider.write = (value: any) => {
				writeSlider.call(slider, value);
				sliderInput();
			};

			number.write = (value: any) => {
				writeNumber.call(number, value);
				numberInput();
			};
		}
	};

	box.sliderInput = function (): void {
		box.updateFiller();
	};

	box.inputWheel = function (event: any): void {
		if (event.deltaY === 0) return;
		const parent = this.parentNode as any;
		if (parent?.activeWheel) {
			event.preventDefault();
			const inputEl: any = this;
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

	box.on = function (
		type: string,
		listener: (event: any) => void,
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

	box._initialized = true;
	input.addEventListener('wheel', box.inputWheel);
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
