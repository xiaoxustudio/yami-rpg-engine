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
import { SelectBox } from './select-box.ts';
import { CustomBox } from './custom-box.ts';

export class SelectVar extends HTMLElement {
	mode: string;
	selectBox: HTMLElement & { [k: string]: any };
	varBox: CustomBox;

	constructor() {
		super();

		this.mode = null;
		this.selectBox = new SelectBox();
		this.varBox = new CustomBox();
		this.varBox.type = 'variable';
		this.varBox.filter = 'all';

		on(this, 'keydown', this.keydown);
		on(this, 'pointerdown', this.pointerdown);
	}

	read() {
		switch (this.mode) {
			case 'constant':
				return read(this.selectBox);
			case 'variable':
				return this.varBox.read();
		}
	}

	write(value: any) {
		switch (typeof value) {
			case 'string':
				this.switch('constant');
				write(this.selectBox, value);
				this.varBox.write(SelectVar.defVar);
				break;
			case 'object':
				this.switch('variable');
				this.selectBox.writeDefault();
				this.varBox.write(value);
				break;
		}
	}

	switch(mode?) {
		const focus = !mode && !hasClass(this, 'disabled');
		if (mode === undefined) {
			switch (this.mode) {
				case 'constant':
					mode = 'variable';
					break;
				case 'variable':
					mode = 'constant';
					break;
			}
		}
		if (this.mode !== mode) {
			removeClass(this, this.mode);
			addClass(this, mode);
			this.mode = mode;
			switch (mode) {
				case 'constant':
					this.varBox.remove();
					this.appendChild(this.selectBox);
					if (focus) {
						this.selectBox.focus();
					}
					break;
				case 'variable':
					this.selectBox.remove();
					this.appendChild(this.varBox);
					if (focus) {
						this.varBox.focus();
					}
					break;
			}
			// this.dispatchChangeEvent()
		}
	}

	enable() {
		if (removeClass(this, 'disabled')) {
			enable(this.selectBox);
			enable(this.varBox);
		}
	}

	disable() {
		if (addClass(this, 'disabled')) {
			disable(this.selectBox);
			disable(this.varBox);
		}
	}

	loadItems(items: any) {
		this.selectBox.loadItems(items);
	}

	getFocus(mode: any) {
		switch (this.mode) {
			case 'constant':
				return getFocus(this.selectBox, mode);
			case 'variable':
				return getFocus(this.varBox, mode);
		}
	}

	clear() {
		clear(this.selectBox);
	}

	keydown(event: any) {
		switch (event.code) {
			case 'Slash':
				event.preventDefault();
				this.switch();
				break;
		}
	}

	pointerdown(event: any) {
		switch (event.button) {
			case 0:
				if (!hasClass(this, 'disabled') && event.target === this) {
					event.preventDefault();
					this.switch();
				}
				break;
			case 2:
				if (!hasClass(this, 'disabled')) {
					event.preventDefault();
					this.switch();
				}
				break;
		}
	}

	static defVar = { type: 'local', key: 'key' };
}

customElements.define('select-var', SelectVar);
