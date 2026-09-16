import { attachApi } from '../../../utils/attach-api';
import { elementDataOf, isApiAttached, markApiAttached } from '../../../utils/element-data';
import { addClass, removeClass, hasClass, read, write } from '../../../utils/dom';
import type { CustomBoxApi } from '../../business/YMCustomBox/custom-box-api';
import { defVar } from '../YMNumberVar/number-var-api';

export interface FileVarApiOptions {
	customBoxFactory?: () => CustomBoxApi;
	filter?: string | null;
	modelValue?: unknown;
	disabled?: boolean;
}

export interface FileVarApi extends HTMLElement {
	mode: string | null;
	fileBox: CustomBoxApi;
	varBox?: CustomBoxApi | null;
	read(...args: unknown[]): unknown;
	write(...args: unknown[]): void;
	switch(...args: unknown[]): void;
	enable(...args: unknown[]): void;
	disable(...args: unknown[]): void;
	getFocus(mode?: string): void;
	keydown(event: KeyboardEvent): void;
	pointerdown(event: PointerEvent): void;
	on(...args: unknown[]): void;
}

export function attachFileVarApi(el: HTMLElement, options: FileVarApiOptions = {}): FileVarApi {
	const box = el as FileVarApi;
	if (isApiAttached(box)) return box;

	const factory = options.customBoxFactory ?? (() => null);
	// P4b：`fileBox` 从"原型访问器"改成显式元素数据（`fileBox` 这个字段已从 DATA_FIELDS 摘除）
	const data = elementDataOf<FileVarApi>(box);
	data.mode = null;
	data.fileBox = factory() as CustomBoxApi;
	data.varBox = factory() as CustomBoxApi;
	data.fileBox.type = 'file';
	data.fileBox.filter = options.filter ?? el.getAttribute('filter');
	data.varBox!.type = 'variable';
	data.varBox!.filter = 'string';

	const readValue = function (): unknown {
		switch (data.mode) {
			case 'constant':
				return read(data.fileBox);
			case 'variable':
				return data.varBox?.read();
		}
	};

	const writeValue = function (value: unknown): void {
		switch (typeof value) {
			case 'string':
				box.switch('constant');
				write(data.fileBox, value);
				data.varBox?.write(defVar);
				break;
			case 'object':
				box.switch('variable');
				write(data.fileBox, '');
				data.varBox?.write(value);
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
					box.appendChild(data.fileBox!);
					if (focus) {
						data.fileBox.focus();
					}
					break;
				case 'variable':
					data.fileBox.remove();
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
			data.fileBox.enable();
			data.varBox?.enable();
		}
	};

	const disable = function (): void {
		if (addClass(box, 'disabled')) {
			data.fileBox.disable();
			data.varBox?.disable();
		}
	};

	const getFocus = function (_mode?: string): void {
		switch (data.mode) {
			case 'constant':
				return data.fileBox.focus();
			case 'variable':
				return data.varBox?.focus();
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

export function createFileVarElement(options?: FileVarApiOptions): FileVarApi {
	const el = document.createElement('div');
	el.className = 'file-var';
	return attachFileVarApi(el, options);
}
