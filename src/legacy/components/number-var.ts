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
import { NumberBox } from './number-box.ts';

export class NumberVar extends HTMLElement {
	mode: string;
	numBox: HTMLElement & { [k: string]: any };
	varBox: CustomBox & { [k: string]: any };

	constructor() {
		super();

		this.mode = null;
		this.numBox = new NumberBox(this);
		this.varBox = new CustomBox();
		this.varBox.type = 'variable';
		this.varBox.filter = 'number';

		on(this, 'keydown', this.keydown);
		on(this, 'pointerdown', this.pointerdown);
	}

	read() {
		switch (this.mode) {
			case 'constant':
				return read(this.numBox);
			case 'variable':
				return this.varBox.read();
		}
	}

	write(value: any) {
		switch (typeof value) {
			case 'number':
				this.switch('constant');
				write(this.numBox, value);
				// 暂时这么写，不是很理想
				this.varBox.write(
					this.varBox.isPluginInput ? NumberVar.defVarForPlugin : NumberVar.defVar
				);
				break;
			case 'object':
				this.switch('variable');
				write(this.numBox, 0);
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
					this.appendChild(this.numBox);
					if (focus) {
						this.numBox.input.focus();
						this.numBox.input.select();
					}
					break;
				case 'variable':
					this.numBox.remove();
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
			enable(this.numBox);
			enable(this.varBox);
		}
	}

	disable() {
		if (addClass(this, 'disabled')) {
			disable(this.numBox);
			disable(this.varBox);
		}
	}

	getFocus(mode: any) {
		switch (this.mode) {
			case 'constant':
				return getFocus(this.numBox, mode);
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

	static defVarForPlugin = { getter: 'variable', type: 'local', key: 'key' };
}

customElements.define('number-var', NumberVar);
