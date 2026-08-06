import { addClass, removeClass, hasClass, read, write } from '../../../utils/dom';
import type { CustomBoxApi } from '../../business/YMCustomBox/custom-box-api';
import type { SelectBoxApi } from '../YMSelectBox/select-box-api';
import { defVar } from '../YMNumberVar/number-var-api';

export interface SelectVarApiOptions {
	customBoxFactory?: () => CustomBoxApi;
	selectBoxFactory?: () => SelectBoxApi;
	modelValue?: any;
	disabled?: boolean;
}

export interface SelectVarApi extends HTMLElement {
	mode: string;
	selectBox: SelectBoxApi;
	varBox: CustomBoxApi;
	_initialized: boolean;
	read(): any;
	write(value: any): void;
	switch(mode?: string): void;
	enable(): void;
	disable(): void;
	loadItems(items: any): void;
	getFocus(mode: any): void;
	clear(): void;
	keydown(event: any): void;
	pointerdown(event: any): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

export function attachSelectVarApi(
	el: HTMLElement,
	options: SelectVarApiOptions = {}
): SelectVarApi {
	const box = el as SelectVarApi;
	if (box._initialized) return box;

	box.mode = null as any;
	box.selectBox = (options.selectBoxFactory ?? (() => null))() as SelectBoxApi;
	box.varBox = (options.customBoxFactory ?? (() => null))() as CustomBoxApi;
	box.varBox.type = 'variable';
	box.varBox.filter = 'all';

	box.read = function (): any {
		switch (box.mode) {
			case 'constant':
				return read(box.selectBox);
			case 'variable':
				return box.varBox.read();
		}
	};

	box.write = function (value: any): void {
		switch (typeof value) {
			case 'string':
				box.switch('constant');
				write(box.selectBox, value);
				box.varBox.write(defVar);
				break;
			case 'object':
				box.switch('variable');
				box.selectBox.writeDefault();
				box.varBox.write(value);
				break;
		}
	};

	box.switch = function (mode?: string): void {
		const focus = !mode && !hasClass(box, 'disabled');
		if (mode === undefined) {
			switch (box.mode) {
				case 'constant':
					mode = 'variable';
					break;
				case 'variable':
					mode = 'constant';
					break;
			}
		}
		if (box.mode !== mode) {
			removeClass(box, box.mode as string);
			addClass(box, mode as string);
			box.mode = mode as string;
			switch (mode) {
				case 'constant':
					box.varBox.remove();
					box.appendChild(box.selectBox);
					if (focus) {
						box.selectBox.focus();
					}
					break;
				case 'variable':
					box.selectBox.remove();
					box.appendChild(box.varBox);
					if (focus) {
						box.varBox.focus();
					}
					break;
			}
		}
	};

	box.enable = function (): void {
		if (removeClass(box, 'disabled')) {
			box.selectBox.enable();
			box.varBox.enable();
		}
	};

	box.disable = function (): void {
		if (addClass(box, 'disabled')) {
			box.selectBox.disable();
			box.varBox.disable();
		}
	};

	box.loadItems = function (items: any): void {
		box.selectBox.loadItems(items);
	};

	box.getFocus = function (mode: any): void {
		switch (box.mode) {
			case 'constant':
				return box.selectBox.focus();
			case 'variable':
				return box.varBox.focus();
		}
	};

	box.clear = function (): void {
		box.selectBox.clear();
	};

	box.keydown = function (event: any): void {
		switch (event.code) {
			case 'Slash':
				event.preventDefault();
				box.switch();
				break;
		}
	};

	box.pointerdown = function (event: any): void {
		switch (event.button) {
			case 0:
				if (!hasClass(box, 'disabled') && event.target === box) {
					event.preventDefault();
					box.switch();
				}
				break;
			case 2:
				if (!hasClass(box, 'disabled')) {
					event.preventDefault();
					box.switch();
				}
				break;
		}
	};

	box.on = function (
		type: string,
		listener: (event: any) => void,
		listenerOptions?: boolean | AddEventListenerOptions
	): void {
		box.addEventListener(type, listener as EventListener, listenerOptions);
	};

	box._initialized = true;
	box.addEventListener('keydown', box.keydown as EventListener);
	box.addEventListener('pointerdown', box.pointerdown as EventListener);

	if (options.modelValue !== undefined && options.modelValue !== null) {
		box.write(options.modelValue);
	}
	if (options.disabled) {
		box.disable();
	}

	return box;
}

export function createSelectVarElement(options?: SelectVarApiOptions): SelectVarApi {
	const el = document.createElement('div');
	el.className = 'select-var';
	return attachSelectVarApi(el, options);
}
