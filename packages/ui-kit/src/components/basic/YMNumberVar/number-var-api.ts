import { attachApi } from '../../../utils/attach-api';
import { elementDataOf, isApiAttached, markApiAttached } from '../../../utils/element-data';
import {
	addClass,
	removeClass,
	hasClass,
	read,
	write,
	dispatchChangeEvent
} from '../../../utils/dom';
import type { CustomBoxApi } from '../../business/YMCustomBox/custom-box-api';
import type { NumberBoxApi } from '../YMNumberBox/number-box-api';

export interface NumberVarApiOptions {
	customBoxFactory?: () => CustomBoxApi;
	numberBoxFactory?: (dom?: HTMLElement | null) => NumberBoxApi;
	modelValue?: unknown;
	disabled?: boolean;
}

export interface NumberVarApi extends HTMLElement {
	mode: string | null;
	numBox: NumberBoxApi;
	varBox?: CustomBoxApi | null;
	read(...args: unknown[]): unknown;
	write(...args: unknown[]): void;
	switch(...args: unknown[]): void;
	enable(...args: unknown[]): void;
	disable(...args: unknown[]): void;
	getFocus(mode?: string): unknown;
	on(...args: unknown[]): void;
	keydown(event: KeyboardEvent): void;
	pointerdown(event: PointerEvent): void;
}

export const defVar = { type: 'local', key: 'key' };
export const defVarForPlugin = { getter: 'variable', type: 'local', key: 'key' };

export function attachNumberVarApi(
	el: HTMLElement,
	options: NumberVarApiOptions = {}
): NumberVarApi {
	const box = el as NumberVarApi;
	if (isApiAttached(box)) return box;

	let currentMode: string | null = null;

	const numBox = (options.numberBoxFactory ?? (() => null))(el) as NumberBoxApi;
	const varBox = (options.customBoxFactory ?? (() => null))() as CustomBoxApi;
	varBox.type = 'variable';
	varBox.filter = 'number';

	elementDataOf<NumberVarApi>(box).mode = currentMode;
	// P4b: numBox now lives in element data (field removed from DATA_FIELDS)
	elementDataOf<NumberVarApi>(box).numBox = numBox;
	elementDataOf<NumberVarApi>(box).varBox = varBox;

	const readValue = function (): unknown {
		switch (currentMode) {
			case 'constant':
				return read(numBox);
			case 'variable':
				return varBox.read();
		}
	};

	const writeValue = function (value: unknown): void {
		switch (typeof value) {
			case 'number':
				box.switch('constant');
				write(numBox, value);
				varBox.write(varBox.isPluginInput ? defVarForPlugin : defVar);
				break;
			case 'string': {
				const n = Number(value);
				if (!isNaN(n)) {
					box.switch('constant');
					write(numBox, n);
					varBox.write(varBox.isPluginInput ? defVarForPlugin : defVar);
				}
				break;
			}
			case 'object':
				box.switch('variable');
				write(numBox, 0);
				varBox.write(value);
				break;
		}
	};

	const switchMode = function (target?: string): void {
		const focus = !target && !hasClass(box, 'disabled');
		if (target === undefined) {
			switch (currentMode) {
				case 'constant':
					target = 'variable';
					break;
				case 'variable':
					target = 'constant';
					break;
			}
		}
		if (currentMode !== target) {
			removeClass(box, currentMode as string);
			addClass(box, target as string);
			currentMode = target as string;
			elementDataOf<NumberVarApi>(box).mode = currentMode;
			switch (target) {
				case 'constant':
					varBox.remove();
					box.appendChild(numBox);
					if (focus && numBox.input) {
						numBox.input.focus();
						numBox.input.select();
					}
					break;
				case 'variable':
					numBox.remove();
					box.appendChild(varBox);
					if (focus) {
						varBox.focus();
					}
					break;
			}
			dispatchChangeEvent(box);
		}
	};

	const enable = function (): void {
		if (removeClass(box, 'disabled')) {
			numBox.enable();
			varBox.enable();
		}
	};

	const disable = function (): void {
		if (addClass(box, 'disabled')) {
			numBox.disable();
			varBox.disable();
		}
	};

	const getFocus = function (mode?: string): unknown {
		switch (currentMode) {
			case 'constant':
				return numBox.getFocus(mode);
			case 'variable':
				return varBox.focus();
		}
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
		getFocus,
		keydown,
		pointerdown,
		on
	});

	markApiAttached(box);
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

export function createNumberVarElement(options?: NumberVarApiOptions): NumberVarApi {
	const el = document.createElement('div');
	el.className = 'number-var';
	return attachNumberVarApi(el, options);
}
