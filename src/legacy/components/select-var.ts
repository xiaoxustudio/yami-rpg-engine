import {
	on,
	addClass,
	removeClass,
	hasClass,
	getFocus,
	enable,
	disable,
	clear,
	read,
	write
} from '@/util/element-utils.ts';
import { createSelectBox } from './select-box.ts';
import { createCustomBox } from './custom-box.ts';

interface SelectVarElement extends HTMLElement {
	mode: string | null;
	selectBox: HTMLElement & { [k: string]: any };
	varBox: HTMLElement & { [k: string]: any };
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
}

export function attachSelectVarApi(el: HTMLElement): void {
	const box = el as SelectVarElement;

	box.mode = null;
	box.selectBox = createSelectBox();
	box.varBox = createCustomBox();
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
			enable(box.selectBox);
			enable(box.varBox);
		}
	};

	box.disable = function (): void {
		if (addClass(box, 'disabled')) {
			disable(box.selectBox);
			disable(box.varBox);
		}
	};

	box.loadItems = function (items: any): void {
		box.selectBox.loadItems(items);
	};

	box.getFocus = function (mode: any): void {
		switch (box.mode) {
			case 'constant':
				return getFocus(box.selectBox, mode);
			case 'variable':
				return getFocus(box.varBox, mode);
		}
	};

	box.clear = function (): void {
		clear(box.selectBox);
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

export function createSelectVar(): HTMLElement {
	const el = document.createElement('div');
	el.className = 'select-var';
	attachSelectVarApi(el);
	return el;
}

export const defVar = { type: 'local', key: 'key' };
