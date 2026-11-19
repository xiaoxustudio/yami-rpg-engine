import { getElementApi, setElementApi } from '../../../utils/element-apis';
import { elementDataOf } from '../../../utils/element-data';
import { addClass, removeClass, hasClass } from '../../../utils/dom';
import type { CustomBoxApi } from '../../business/YMCustomBox/custom-box-api';
import type { SelectBoxApi } from '../YMSelectBox/select-box-api';
import { defVar } from '../YMNumberVar/number-var-api';

export interface SelectVarApiOptions {
	customBoxFactory?: () => CustomBoxApi;
	selectBoxFactory?: () => SelectBoxApi;
	modelValue?: unknown;
	disabled?: boolean;
}

export interface SelectVarApi extends HTMLElement {
	mode: string | null;
	selectBox: SelectBoxApi;
	varBox: CustomBoxApi;
	read(...args: unknown[]): unknown;
	write(...args: unknown[]): void;
	switch(mode?: string): void;
	enable(...args: unknown[]): void;
	disable(...args: unknown[]): void;
	loadItems(...args: unknown[]): void;
	getFocus(mode?: unknown): void;
	clear(...args: unknown[]): void;
	keydown(event: KeyboardEvent): void;
	pointerdown(event: PointerEvent): void;
	on(...args: unknown[]): void;
}

export function attachSelectVarApi(
	el: HTMLElement,
	options: SelectVarApiOptions = {}
): SelectVarApi {
	const box = el as SelectVarApi;
	if (getElementApi(box)) return box;

	elementDataOf<SelectVarApi>(box).mode = null;
	box.selectBox = (options.selectBoxFactory ?? (() => null))() as SelectBoxApi;
	const data = elementDataOf<SelectVarApi>(box);
	data.varBox = (options.customBoxFactory ?? (() => null))() as CustomBoxApi;
	data.varBox!.type = 'variable';
	data.varBox!.filter = 'all';

	const readValue = function (): unknown {
		switch (data.mode) {
			case 'constant':
				return getElementApi<SelectBoxApi>(box.selectBox)?.read();
			case 'variable':
				return getElementApi<CustomBoxApi>(data.varBox)?.read();
		}
	};

	const writeValue = function (value: unknown): void {
		switch (typeof value) {
			case 'string':
				switchMode('constant');
				getElementApi<SelectBoxApi>(box.selectBox)?.write(value);
				getElementApi<CustomBoxApi>(data.varBox)?.write(defVar);
				break;
			case 'object':
				switchMode('variable');
				getElementApi<SelectBoxApi>(box.selectBox)?.writeDefault();
				getElementApi<CustomBoxApi>(data.varBox)?.write(value);
				break;
		}
	};

	const switchMode = function (mode?: string): void {
		const focus = !mode && !hasClass(box, 'disabled');
		if (mode === undefined) {
			switch (data.mode) {
				case 'constant':
					mode = 'variable';
					break;
				case 'variable':
					mode = 'constant';
					break;
			}
		}
		if (data.mode !== mode) {
			removeClass(box, data.mode as string);
			addClass(box, mode as string);
			data.mode = mode as string;
			switch (mode) {
				case 'constant':
					data.varBox?.remove();
					box.appendChild(box.selectBox!);
					if (focus) {
						box.selectBox.focus();
					}
					break;
				case 'variable':
					box.selectBox.remove();
					box.appendChild(data.varBox!);
					if (focus) {
						data.varBox?.focus();
					}
					break;
			}
		}
	};

	const enable = function (): void {
		if (removeClass(box, 'disabled')) {
			getElementApi<SelectBoxApi>(box.selectBox)?.enable();
			getElementApi<CustomBoxApi>(data.varBox)?.enable();
		}
	};

	const disable = function (): void {
		if (addClass(box, 'disabled')) {
			getElementApi<SelectBoxApi>(box.selectBox)?.disable();
			getElementApi<CustomBoxApi>(data.varBox)?.disable();
		}
	};

	const loadItems = function (items: unknown): void {
		getElementApi<SelectBoxApi>(box.selectBox)?.loadItems(items);
	};

	const getFocus = function (_mode: unknown): void {
		switch (data.mode) {
			case 'constant':
				return box.selectBox.focus();
			case 'variable':
				return data.varBox?.focus();
		}
	};

	const clear = function (): void {
		getElementApi<SelectBoxApi>(box.selectBox)?.clear();
	};

	const keydown = function (event: KeyboardEvent): void {
		switch (event.code) {
			case 'Slash':
				event.preventDefault();
				switchMode();
				break;
		}
	};

	const pointerdown = function (event: PointerEvent): void {
		switch (event.button) {
			case 0:
				if (!hasClass(box, 'disabled') && event.target === box) {
					event.preventDefault();
					switchMode();
				}
				break;
			case 2:
				if (!hasClass(box, 'disabled')) {
					event.preventDefault();
					switchMode();
				}
				break;
		}
	};

	const on = function (
		type: string,
		listener: (event: Event) => void,
		listenerOptions?: boolean | AddEventListenerOptions
	): void {
		box.addEventListener(type, listener as EventListener, listenerOptions);
	};

	setElementApi(box, {
		read: readValue,
		write: writeValue,
		switch: switchMode,
		enable,
		disable,
		loadItems,
		getFocus,
		clear,
		keydown,
		pointerdown,
		on
	});
	box.addEventListener('keydown', keydown as EventListener);
	box.addEventListener('pointerdown', pointerdown as EventListener);

	if (options.modelValue !== undefined && options.modelValue !== null) {
		writeValue(options.modelValue);
	}
	if (options.disabled) {
		disable();
	}

	return box;
}

export function createSelectVarElement(options?: SelectVarApiOptions): SelectVarApi {
	const el = document.createElement('div');
	el.className = 'select-var';
	return attachSelectVarApi(el, options);
}
