import {
	on,
	addClass,
	removeClass,
	hasClass,
	read,
	enable,
	disable,
	dispatchChangeEvent
} from '@/util/element-utils.ts';

interface CheckBoxElement extends HTMLElement {
	dataValue: boolean;
	relations: HTMLElement[];
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

export function attachCheckBoxApi(el: HTMLElement, standard?: boolean): void {
	const box = el as CheckBoxElement;
	let dataValue = false;
	let relations: HTMLElement[] = [];
	let writeEventEnabled = false;
	let inputEventEnabled = false;

	const toggleRelatedElements = (): void => {
		if (!hasClass(box, 'disabled') && dataValue) {
			for (const element of relations) {
				if (typeof (element as any).enable === 'function') {
					(element as any).enable();
				} else {
					enable(element);
				}
			}
		} else {
			for (const element of relations) {
				if (typeof (element as any).disable === 'function') {
					(element as any).disable();
				} else {
					disable(element);
				}
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
			const writeEvent = new Event('write');
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
				});
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
		options?: boolean | AddEventListenerOptions
	): void {
		box.addEventListener(type, listener as EventListener, options);
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
					document.activeElement.blur();
				}
				box.input(!read(box));
				break;
		}
	};

	box.mouseclick = function (event: Event): void {
		box.input(!read(box));
	};

	on(box, 'keydown', box.keydown);
	if (standard ?? hasClass(box, 'standard')) {
		const standardMark = document.createElement('span');
		addClass(standardMark, 'check-mark');
		box.tabIndex = 0;
		box.insertBefore(standardMark, box.childNodes[0] || null);
		on(box, 'click', box.mouseclick);
	} else {
		on(box, 'pointerdown', box.pointerdown);
	}
}

export function createCheckBox(standard?: boolean): HTMLElement {
	const el = document.createElement('div');
	el.className = 'check-box';
	attachCheckBoxApi(el, standard);
	return el;
}
