import { addClass, removeClass, hasClass, dispatchChangeEvent } from '../../../utils/dom';

export interface CheckBoxApiOptions {
	standard?: boolean;
	modelValue?: boolean;
	disabled?: boolean;
}

export interface CheckBoxApi extends HTMLElement {
	dataValue: boolean;
	relations: HTMLElement[];
	_initialized: boolean;
	read(): boolean;
	write(value: boolean): void;
	input(value: boolean): void;
	enable(): void;
	disable(): void;
	relate(elements: HTMLElement[]): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
	keydown: (event: KeyboardEvent & { cmdOrCtrlKey?: boolean }) => void;
	pointerdown: (event: PointerEvent) => void;
	mouseclick: (event: Event) => void;
}

const enableElement = (element: any): void => {
	if (typeof element.enable === 'function') {
		element.enable();
	} else {
		element.classList?.remove('disabled');
	}
};

const disableElement = (element: any): void => {
	if (typeof element.disable === 'function') {
		element.disable();
	} else {
		element.classList?.add('disabled');
	}
};

export function attachCheckBoxApi(el: HTMLElement, options: CheckBoxApiOptions = {}): CheckBoxApi {
	const box = el as CheckBoxApi;
	if (box._initialized) return box;

	const standard = options.standard ?? hasClass(box, 'standard');
	let dataValue = false;
	let relations: HTMLElement[] = [];
	let writeEventEnabled = false;
	let inputEventEnabled = false;

	const toggleRelatedElements = (): void => {
		if (!hasClass(box, 'disabled') && dataValue) {
			for (const element of relations) {
				enableElement(element);
			}
		} else {
			for (const element of relations) {
				disableElement(element);
			}
		}
	};

	box.dataValue = dataValue;
	box.relations = relations;

	box.write = function (value: boolean): void {
		dataValue = !!value;
		box.dataValue = dataValue;
		dataValue ? addClass(box, 'selected') : removeClass(box, 'selected');
		if (!hasClass(box, 'disabled')) {
			toggleRelatedElements();
		}
		if (writeEventEnabled) {
			const writeEvent = new Event('write') as Event & { value: boolean };
			writeEvent.value = dataValue;
			box.dispatchEvent(writeEvent);
		}
	};

	box.read = function (): boolean {
		return dataValue;
	};

	box.input = function (value: boolean): void {
		if (dataValue !== value) {
			box.write(value);
			if (inputEventEnabled) {
				const inputEvent = new Event('input', {
					bubbles: true
				}) as Event & { value: boolean };
				inputEvent.value = dataValue;
				box.dispatchEvent(inputEvent);
			}
			dispatchChangeEvent(box);
		}
	};

	box.enable = function (): void {
		if (removeClass(box, 'disabled')) {
			toggleRelatedElements();
		}
	};

	box.disable = function (): void {
		if (addClass(box, 'disabled')) {
			toggleRelatedElements();
		}
	};

	box.relate = function (elements: HTMLElement[]): void {
		relations = elements;
		box.relations = relations;
	};

	box.on = function (
		type: string,
		listener: (event: any) => void,
		listenerOptions?: boolean | AddEventListenerOptions
	): void {
		box.addEventListener(type, listener as EventListener, listenerOptions);
		switch (type) {
			case 'write':
				writeEventEnabled = true;
				break;
			case 'input':
				inputEventEnabled = true;
				break;
		}
	};

	box.keydown = function (event: KeyboardEvent & { cmdOrCtrlKey?: boolean }): void {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				if (!event.cmdOrCtrlKey && !hasClass(box, 'disabled')) {
					event.stopPropagation();
					box.mouseclick(event);
				}
				break;
		}
	};

	box.pointerdown = function (event: PointerEvent): void {
		switch (event.button) {
			case 0:
				if (document.activeElement !== document.body) {
					(document.activeElement as HTMLElement).blur();
				}
				box.input(!box.read());
				break;
		}
	};

	box.mouseclick = function (event: Event): void {
		box.input(!box.read());
	};

	box.addEventListener('keydown', box.keydown as EventListener);
	if (standard) {
		const standardMark = document.createElement('span');
		addClass(standardMark, 'check-mark');
		box.tabIndex = 0;
		box.insertBefore(standardMark, box.childNodes[0] || null);
		box.addEventListener('click', box.mouseclick);
	} else {
		box.addEventListener('pointerdown', box.pointerdown as EventListener);
	}

	box._initialized = true;

	if (options.modelValue) {
		box.write(options.modelValue);
	}
	if (options.disabled) {
		box.disable();
	}

	return box;
}

export function createCheckBoxElement(options?: CheckBoxApiOptions): CheckBoxApi {
	const el = document.createElement('div');
	el.className = 'check-box';
	return attachCheckBoxApi(el, options);
}
