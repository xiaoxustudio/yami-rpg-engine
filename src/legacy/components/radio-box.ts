import { RadioProxy } from './radio-proxy.ts';
import { on, hasClass } from '@/util/element-utils.ts';

export class RadioBox extends HTMLElement {
	proxy: RadioProxy;
	dataValue: number | string | boolean = '';
	_mark: HTMLElement | null;
	_isNewProxy: boolean;
	_initialized: boolean;
	_listenersAttached: boolean;

	constructor() {
		super();

		let proxy = RadioProxy.map[this.name];
		this._isNewProxy = false;
		if (proxy === undefined) {
			proxy = document.createElement('radio-proxy') as RadioProxy;
			proxy.id = this.name;
			proxy.style.display = 'none';
			RadioProxy.map[proxy.id] = proxy;
			this._isNewProxy = true;
		}

		this.proxy = proxy;
		this.dataValue = '';
		this._mark = null;
		this._initialized = false;
		this._listenersAttached = false;

		on(this, 'keydown', this.keydown);
	}

	connectedCallback() {
		if (this._initialized) return;
		this._initialized = true;

		const string = this.getAttribute('value') ?? '';
		const isNumber = RegExp.number.test(string);
		const value = isNumber
			? parseFloat(string)
			: string === 'false'
				? false
				: string === 'true'
					? true
					: string;
		this.dataValue = value;

		if (this.name && this.proxy.id !== this.name) {
			const existing = RadioProxy.map[this.name];
			if (existing) {
				this.proxy = existing;
				this._isNewProxy = false;
			} else if (this.proxy.id === '') {
				delete RadioProxy.map[''];
				this.proxy.id = this.name;
				RadioProxy.map[this.name] = this.proxy;
				this._isNewProxy = true;
			} else {
				this.proxy = document.createElement('radio-proxy') as RadioProxy;
				this.proxy.id = this.name;
				this.proxy.style.display = 'none';
				RadioProxy.map[this.name] = this.proxy;
				this._isNewProxy = true;
			}
		}
		if (this._isNewProxy) {
			this.appendChild(this.proxy);
		}

		if (!this._listenersAttached) {
			this._listenersAttached = true;
			switch (hasClass(this, 'standard')) {
				case true: {
					this._mark = document.createElement('radio-mark');
					on(this, 'click', this.mouseclick);
					break;
				}
				case false:
					on(this, 'pointerdown', this.pointerdown);
					break;
			}
		}

		if (this._mark) {
			this.tabIndex = 0;
			this.insertBefore(this._mark, this.childNodes[0]);
		}
	}

	keydown(event: KeyboardEvent): void {
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
				if (!hasClass(this, 'selected')) {
					if (document.activeElement !== document.body) {
						document.activeElement.blur();
					}
					this.proxy.input(this.dataValue);
				} else if (this.proxy.cancelable) {
					if (document.activeElement !== document.body) {
						document.activeElement.blur();
					}
					this.proxy.reset();
				}
				break;
		}
	}

	mouseclick(event: Event): void {
		if (!hasClass(this, 'selected')) {
			this.proxy.input(this.dataValue);
		} else if (this.proxy.cancelable) {
			this.proxy.reset();
		}
	}
}

customElements.define('radio-box', RadioBox);
