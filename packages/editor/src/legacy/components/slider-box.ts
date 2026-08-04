import {
	on,
	addClass,
	removeClass,
	hideChildNodes,
	showChildNodes,
	read
} from '@/util/element-utils.ts';

interface SliderBoxElement extends HTMLElement {
	filler: HTMLElement;
	input: HTMLInputElement;
	synchronizer: HTMLElement & { value: any; [k: string]: any };
	bar: HTMLElement & { [k: string]: any };
	step: number;
	activeWheel: boolean;
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;
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

export function attachSliderBoxApi(el: HTMLElement): void {
	const box = el as SliderBoxElement;

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

	input.min = box.getAttribute('min') ?? '0';
	input.max = box.getAttribute('max') ?? '0';
	input.step = box.getAttribute('step') ?? '1';
	box.activeWheel = box.hasAttribute('active-wheel');

	box.appendChild(bar);
	box.appendChild(input);

	box.updateFiller = function (): void {
		const value = read(box);
		if (filler.value !== value) {
			filler.value = value;
			const min = parseFloat(input.min);
			const max = parseFloat(input.max);
			if (min !== max) {
				const p = Math.roundTo(((value - min) * 100) / (max - min), 6);
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

			on(slider.input, 'pointerdown', sliderPointerdown);
			on(slider.input, 'input', sliderInput);
			on(number.input, 'input', numberInput);

			slider.write = (value) => {
				writeSlider.call(slider, value);
				sliderInput();
			};

			number.write = (value) => {
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
		const parent = this.parentNode;
		if (parent.activeWheel) {
			event.preventDefault();
			const input = this;
			const last = input.value;
			input.value = String(
				Math.roundTo(
					parseFloat(input.value) + parseFloat(input.step) * (event.deltaY > 0 ? -1 : 1),
					2
				)
			);
			if (input.value !== last) {
				input.dispatchEvent(
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
		options?: boolean | AddEventListenerOptions
	): void {
		box.addEventListener(type, listener as EventListener, options);
		switch (type) {
			case 'focus':
				if (!box.focusEventEnabled) {
					box.focusEventEnabled = true;
					on(input, 'focus', () => {
						box.dispatchEvent(new FocusEvent('focus'));
					});
				}
				break;
			case 'blur':
				if (!box.blurEventEnabled) {
					box.blurEventEnabled = true;
					on(input, 'blur', () => {
						box.dispatchEvent(new FocusEvent('blur'));
					});
				}
				break;
		}
	};

	on(input, 'wheel', box.inputWheel);
	on(box, 'input', box.sliderInput);
}

export function createSliderBox(): HTMLElement {
	const el = document.createElement('div');
	el.className = 'slider-box';
	attachSliderBoxApi(el);
	return el;
}
