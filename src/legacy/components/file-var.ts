import {
	on,
	addClass,
	removeClass,
	hasClass,
	getFocus,
	enable,
	disable,
	read,
	write
} from '@/util/element-utils.ts';
import { createCustomBox } from './custom-box.ts';

interface FileVarElement extends HTMLElement {
	mode: string | null;
	fileBox: HTMLElement & { [k: string]: any };
	varBox: HTMLElement & { [k: string]: any };
	read(): any;
	write(value: any): void;
	switch(mode?: string): void;
	enable(): void;
	disable(): void;
	getFocus(mode: any): void;
	keydown(event: any): void;
	pointerdown(event: any): void;
}

export function attachFileVarApi(el: HTMLElement): void {
	const box = el as FileVarElement;

	box.mode = null;
	box.fileBox = createCustomBox();
	box.varBox = createCustomBox();
	box.fileBox.type = 'file';
	box.fileBox.filter = el.getAttribute('filter');
	box.varBox.type = 'variable';
	box.varBox.filter = 'string';

	box.read = function (): any {
		switch (box.mode) {
			case 'constant':
				return read(box.fileBox);
			case 'variable':
				return box.varBox.read();
		}
	};

	box.write = function (value: any): void {
		switch (typeof value) {
			case 'string':
				box.switch('constant');
				write(box.fileBox, value);
				box.varBox.write(defVar);
				break;
			case 'object':
				box.switch('variable');
				write(box.fileBox, '');
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
					box.appendChild(box.fileBox);
					if (focus) {
						box.fileBox.focus();
					}
					break;
				case 'variable':
					box.fileBox.remove();
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
			enable(box.fileBox);
			enable(box.varBox);
		}
	};

	box.disable = function (): void {
		if (addClass(box, 'disabled')) {
			disable(box.fileBox);
			disable(box.varBox);
		}
	};

	box.getFocus = function (mode: any): void {
		switch (box.mode) {
			case 'constant':
				return getFocus(box.fileBox, mode);
			case 'variable':
				return getFocus(box.varBox, mode);
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

	on(box, 'keydown', box.keydown);
	on(box, 'pointerdown', box.pointerdown);
}

export function createFileVar(): HTMLElement {
	const el = document.createElement('div');
	el.className = 'file-var';
	attachFileVarApi(el);
	return el;
}

export const defVar = { type: 'local', key: 'key' };
