import { addClass, removeClass, hasClass, read, write } from '../../../utils/dom';
import type { CustomBoxApi } from '../../business/YMCustomBox/custom-box-api';
import { defVar } from '../YMNumberVar/number-var-api';

export interface FileVarApiOptions {
	customBoxFactory?: () => CustomBoxApi;
	filter?: string | null;
	modelValue?: any;
	disabled?: boolean;
}

export interface FileVarApi extends HTMLElement {
	mode: string;
	fileBox: CustomBoxApi;
	varBox?: CustomBoxApi | null;
	_initialized: boolean;
	read(...args: unknown[]): any;
	write(...args: unknown[]): any;
	switch(...args: unknown[]): any;
	enable(...args: unknown[]): any;
	disable(...args: unknown[]): any;
	getFocus(mode: any): void;
	keydown(event: any): void;
	pointerdown(event: any): void;
	on(...args: unknown[]): any;
}

export function attachFileVarApi(el: HTMLElement, options: FileVarApiOptions = {}): FileVarApi {
	const box = el as FileVarApi;
	if (box._initialized) return box;

	const factory = options.customBoxFactory ?? (() => null);
	box.mode = null as any;
	box.fileBox = factory() as CustomBoxApi;
	box.varBox = factory() as CustomBoxApi;
	box.fileBox.type = 'file';
	box.fileBox.filter = options.filter ?? el.getAttribute('filter');
	box.varBox!.type = 'variable';
	box.varBox!.filter = 'string';

	box.read = function (): any {
		switch (box.mode) {
			case 'constant':
				return read(box.fileBox);
			case 'variable':
				return box.varBox?.read();
		}
	};

	box.write = function (value: any): void {
		switch (typeof value) {
			case 'string':
				box.switch('constant');
				write(box.fileBox, value);
				box.varBox?.write(defVar);
				break;
			case 'object':
				box.switch('variable');
				write(box.fileBox, '');
				box.varBox?.write(value);
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
					box.varBox?.remove();
					box.appendChild(box.fileBox!);
					if (focus) {
						box.fileBox.focus();
					}
					break;
				case 'variable':
					box.fileBox.remove();
					box.appendChild(box.varBox!);
					if (focus) {
						box.varBox?.focus();
					}
					break;
			}
		}
	};

	box.enable = function (): void {
		if (removeClass(box, 'disabled')) {
			box.fileBox.enable();
			box.varBox?.enable();
		}
	};

	box.disable = function (): void {
		if (addClass(box, 'disabled')) {
			box.fileBox.disable();
			box.varBox?.disable();
		}
	};

	box.getFocus = function (mode: any): void {
		switch (box.mode) {
			case 'constant':
				return box.fileBox.focus();
			case 'variable':
				return box.varBox?.focus();
		}
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

export function createFileVarElement(options?: FileVarApiOptions): FileVarApi {
	const el = document.createElement('div');
	el.className = 'file-var';
	return attachFileVarApi(el, options);
}
