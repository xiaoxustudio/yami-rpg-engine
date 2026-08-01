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
import { CustomBox } from './custom-box.ts';

export class FileVar extends HTMLElement {
	mode: string;
	strBox: HTMLElement & { [k: string]: any };
	varBox: CustomBox;
	_initialized: boolean;

	constructor() {
		super();

		this.mode = null;
		this.fileBox = new CustomBox();
		this.varBox = new CustomBox();
		this.fileBox.type = 'file';
		this.varBox.type = 'variable';
		this.varBox.filter = 'string';
		this._initialized = false;

		on(this, 'keydown', this.keydown);
		on(this, 'pointerdown', this.pointerdown);
	}

	connectedCallback() {
		if (this._initialized) return;
		this._initialized = true;
		this.fileBox.filter = this.getAttribute('filter');
	}

	read() {
		switch (this.mode) {
			case 'constant':
				return read(this.fileBox);
			case 'variable':
				return this.varBox.read();
		}
	}

	write(value: any) {
		switch (typeof value) {
			case 'string':
				this.switch('constant');
				write(this.fileBox, value);
				this.varBox.write(FileVar.defVar);
				break;
			case 'object':
				this.switch('variable');
				write(this.fileBox, '');
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
					this.appendChild(this.fileBox);
					if (focus) {
						this.fileBox.focus();
					}
					break;
				case 'variable':
					this.fileBox.remove();
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
			enable(this.fileBox);
			enable(this.varBox);
		}
	}

	disable() {
		if (addClass(this, 'disabled')) {
			disable(this.fileBox);
			disable(this.varBox);
		}
	}

	getFocus(mode: any) {
		switch (this.mode) {
			case 'constant':
				return getFocus(this.fileBox, mode);
			case 'variable':
				return getFocus(this.varBox, mode);
		}
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

customElements.define('file-var', FileVar);
