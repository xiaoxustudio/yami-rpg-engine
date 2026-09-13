import { attachApi } from '../../../utils/attach-api';
import { addClass, removeClass, hasClass, read, write } from '../../../utils/dom';
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
	_initialized: boolean;
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
	if (box._initialized) return box;

	box.mode = null;
	box.selectBox = (options.selectBoxFactory ?? (() => null))() as SelectBoxApi;
	box.varBox = (options.customBoxFactory ?? (() => null))() as CustomBoxApi;
	box.varBox!.type = 'variable';
	box.varBox!.filter = 'all';

	const readValue = function (): unknown {
		switch (box.mode) {
			case 'constant':
				return read(box.selectBox);
			case 'variable':
				return box.varBox?.read();
		}
	};

	const writeValue = function (value: unknown): void {
		switch (typeof value) {
			case 'string':
				box.switch('constant');
				write(box.selectBox, value);
				box.varBox?.write(defVar);
				break;
			case 'object':
				box.switch('variable');
				box.selectBox.writeDefault();
				box.varBox?.write(value);
				break;
		}
	};

	const switchMode = function (mode?: string): void {
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
					box.varBox?.remove();
					box.appendChild(box.selectBox!);
					if (focus) {
						box.selectBox.focus();
					}
					break;
				case 'variable':
					box.selectBox.remove();
					box.appendChild(box.varBox!);
					if (focus) {
						box.varBox?.focus();
					}
					break;
			}
		}
	};

	const enable = function (): void {
		if (removeClass(box, 'disabled')) {
			box.selectBox.enable();
			box.varBox?.enable();
		}
	};

	const disable = function (): void {
		if (addClass(box, 'disabled')) {
			box.selectBox.disable();
			box.varBox?.disable();
		}
	};

	const loadItems = function (items: unknown): void {
		box.selectBox.loadItems(items);
	};

	const getFocus = function (_mode: unknown): void {
		switch (box.mode) {
			case 'constant':
				return box.selectBox.focus();
			case 'variable':
				return box.varBox?.focus();
		}
	};

	const clear = function (): void {
		box.selectBox.clear();
	};

	const keydown = function (event: KeyboardEvent): void {
		switch (event.code) {
			case 'Slash':
				event.preventDefault();
				box.switch();
				break;
		}
	};

	const pointerdown = function (event: PointerEvent): void {
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

	const on = function (
		type: string,
		listener: (event: Event) => void,
		listenerOptions?: boolean | AddEventListenerOptions
	): void {
		box.addEventListener(type, listener as EventListener, listenerOptions);
	};

	attachApi(box, {
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

	box._initialized = true;
	// oxlint-disable-next-line unbound-method
	box.addEventListener('keydown', box.keydown as EventListener);
	// oxlint-disable-next-line unbound-method
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
