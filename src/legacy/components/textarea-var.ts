import {
	on,
	addClass,
	removeClass,
	hasClass,
	getFocus,
	dispatchChangeEvent,
	enable,
	disable,
	read,
	write
} from '@/util/element-utils.ts';
import { CustomBox } from './custom-box.ts';
import { TextArea } from './text-area.ts';

export class TextAreaVar extends HTMLElement {
	mode: string;
	strBox: HTMLElement & { [k: string]: any };
	varBox: CustomBox;
	_initialized: boolean;

	constructor() {
		super();

		this.mode = null;
		this.strBox = new TextArea();
		this.varBox = new CustomBox();
		this.varBox.type = 'variable';
		this.varBox.filter = 'string';
		this._initialized = false;

		on(this, 'keydown', this.keydown);
		on(this, 'pointerdown', this.pointerdown);
	}

	connectedCallback() {
		if (this._initialized) return;
		this._initialized = true;
		const menu = this.getAttribute('menu');
		if (menu) {
			this.strBox.setAttribute('menu', menu);
		}
	}

	read() {
		switch (this.mode) {
			case 'constant':
				return read(this.strBox);
			case 'variable':
				return this.varBox.read();
		}
	}

	write(value: any) {
		switch (typeof value) {
			case 'string':
				this.switch('constant');
				write(this.strBox, value);
				this.varBox.write(TextAreaVar.defVar);
				break;
			case 'object':
				this.switch('variable');
				write(this.strBox, '');
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
					this.appendChild(this.strBox);
					if (focus) {
						this.strBox.input.focus();
						this.strBox.input.select();
					}
					break;
				case 'variable':
					this.strBox.remove();
					this.appendChild(this.varBox);
					if (focus) {
						this.varBox.focus();
					}
					break;
			}
			dispatchChangeEvent(this);
		}
	}

	enable() {
		if (removeClass(this, 'disabled')) {
			enable(this.strBox);
			enable(this.varBox);
		}
	}

	disable() {
		if (addClass(this, 'disabled')) {
			disable(this.strBox);
			disable(this.varBox);
		}
	}

	getFocus(mode: any) {
		switch (this.mode) {
			case 'constant':
				return getFocus(this.strBox, mode);
			case 'variable':
				return getFocus(this.varBox, mode);
		}
	}

	keydown(event: any) {
		if (event.cmdOrCtrlKey || event.altKey) {
			switch (event.code) {
				case 'Slash':
					event.preventDefault();
					this.switch();
					break;
			}
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
		}
	}

	static defVar = { type: 'local', key: 'key' };
}

customElements.define('text-area-var', TextAreaVar);
