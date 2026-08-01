import {
	on,
	addClass,
	removeClass,
	hasClass,
	read,
	enable,
	disable,
	dispatchChangeEvent
} from '@/util/element-utils.ts';

export class CheckBox extends HTMLElement {
	dataValue = false;
	relations: HTMLElement[] = [];
	writeEventEnabled = false;
	inputEventEnabled = false;
	_initialized: boolean;
	_standardMark: HTMLElement;
	_isStandard: boolean;
	_listenersAttached: boolean;

	constructor(standard?: boolean) {
		super();

		this.dataValue = false;
		this.relations = [];
		this.writeEventEnabled = false;
		this.inputEventEnabled = false;
		this._initialized = false;
		this._listenersAttached = false;
		this._isStandard = standard ?? false;

		on(this, 'keydown', this.keydown);

		if (standard !== undefined) {
			this._setupListeners(standard);
		}
	}

	_setupListeners(standard: boolean): void {
		if (this._listenersAttached) return;
		this._listenersAttached = true;
		switch (standard) {
			case true: {
				this._standardMark = document.createElement('check-mark');
				on(this, 'click', this.mouseclick);
				this._isStandard = true;
				break;
			}
			case false:
				on(this, 'pointerdown', this.pointerdown);
				this._isStandard = false;
				break;
		}
	}

	connectedCallback() {
		if (this._initialized) return;
		this._initialized = true;
		if (!this._listenersAttached) {
			this._setupListeners(hasClass(this, 'standard'));
		}
		if (this._isStandard) {
			this.tabIndex = 0;
			this.insertBefore(this._standardMark, this.childNodes[0]);
		}
	}

	read(): boolean {
		return this.dataValue;
	}

	write(value: boolean): void {
		this.dataValue = !!value;
		this.dataValue ? addClass(this, 'selected') : removeClass(this, 'selected');
		if (!hasClass(this, 'disabled')) {
			this.toggleRelatedElements();
		}
		if (this.writeEventEnabled) {
			const write = new Event('write');
			write.value = this.dataValue;
			this.dispatchEvent(write);
		}
	}

	input(value: boolean): void {
		if (this.dataValue !== value) {
			this.write(value);
			if (this.inputEventEnabled) {
				const input = new Event('input', {
					bubbles: true
				});
				input.value = this.dataValue;
				this.dispatchEvent(input);
			}
			dispatchChangeEvent(this);
		}
	}

	enable(): void {
		if (removeClass(this, 'disabled')) {
			this.toggleRelatedElements();
		}
	}

	disable(): void {
		if (addClass(this, 'disabled')) {
			this.toggleRelatedElements();
		}
	}

	relate(elements: HTMLElement[]): void {
		this.relations = elements;
	}

	toggleRelatedElements(): void {
		if (!hasClass(this, 'disabled') && this.dataValue) {
			for (const element of this.relations) {
				if (typeof element.enable === 'function') {
					element.enable();
				} else {
					enable(element);
				}
			}
		} else {
			for (const element of this.relations) {
				if (typeof element.disable === 'function') {
					element.disable();
				} else {
					disable(element);
				}
			}
		}
	}

	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void {
		HTMLElement.prototype.on.call(this as any, type, listener, options);
		switch (type) {
			case 'write':
				this.writeEventEnabled = true;
				break;
			case 'input':
				this.inputEventEnabled = true;
				break;
		}
	}

	keydown(event: KeyboardEvent & { cmdOrCtrlKey?: boolean }): void {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				if (!event.cmdOrCtrlKey && !hasClass(this, 'disabled')) {
					event.stopPropagation();
					this.mouseclick(event);
				}
				break;
		}
	}

	pointerdown(event: PointerEvent): void {
		switch (event.button) {
			case 0:
				if (document.activeElement !== document.body) {
					document.activeElement.blur();
				}
				this.input(!read(this));
				break;
		}
	}

	mouseclick(event: Event): void {
		this.input(!read(this));
	}
}

customElements.define('check-box', CheckBox as any);
