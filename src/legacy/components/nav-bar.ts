import { on, addClass, removeClass, hasClass } from '@/util/element-utils.ts';

export class NavBar extends HTMLElement {
	writeEventEnabled: boolean;
	selectEventEnabled: boolean;

	constructor() {
		super();

		const elements = this.childNodes;
		if (elements.length > 0) {
			let i = elements.length;
			while (--i >= 0) {
				const element = elements[i] as HTMLElement & { dataValue: any };
				if (element.tagName === 'NAV-ITEM') {
					const string = element.getAttribute('value') ?? '';
					const isNumber = RegExp.number.test(string);
					element.dataValue = isNumber ? parseFloat(string) : string;
				} else {
					this.removeChild(element);
				}
			}
		}

		this.writeEventEnabled = false;
		this.selectEventEnabled = false;

		on(this, 'pointerdown', this.pointerdown);
	}

	read(): any {
		const item = this.querySelector('.selected') as (HTMLElement & { dataValue: any }) | null;
		if (item && item.dataValue === undefined && item.tagName === 'NAV-ITEM') {
			const string = item.getAttribute('value') ?? '';
			const isNumber = RegExp.number.test(string);
			item.dataValue = isNumber ? parseFloat(string) : string;
		}
		return item ? item.dataValue : undefined;
	}

	write(value: any): void {
		const items = this.childNodes;
		const length = items.length;
		if (length !== 0) {
			this.unselect();
			let target: HTMLElement | undefined;
			for (let i = 0; i < length; i++) {
				const item = items[i] as HTMLElement & { dataValue: any };
				if (item.tagName === 'NAV-ITEM' && item.dataValue === undefined) {
					const string = item.getAttribute('value') ?? '';
					const isNumber = RegExp.number.test(string);
					item.dataValue = isNumber ? parseFloat(string) : string;
				}
				if (item.dataValue === value) {
					target = item;
					break;
				}
			}
			if (target !== undefined) {
				addClass(target, 'selected');
			}
			if (this.writeEventEnabled) {
				const write: any = new Event('write');
				write.value = target ? value : undefined;
				this.dispatchEvent(write);
			}
		}
	}

	unselect(): void {
		const item = this.querySelector('.selected');
		if (item) {
			removeClass(item as HTMLElement, 'selected');
		}
	}

	// for (const item of items) { const li = document.createElement('nav-item') li.textContent = item.name

	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void {
		super.on(type, listener, options);
		switch (type) {
			case 'write':
				this.writeEventEnabled = true;
				break;
			case 'select':
				this.selectEventEnabled = true;
				break;
		}
	}

	pointerdown(event: PointerEvent): void {
		switch (event.button) {
			case 0: {
				const element = event.target as HTMLElement & { dataValue: any };
				if (element.tagName === 'NAV-ITEM' && !hasClass(element, 'selected')) {
					if (element.dataValue === undefined) {
						const string = element.getAttribute('value') ?? '';
						const isNumber = RegExp.number.test(string);
						element.dataValue = isNumber ? parseFloat(string) : string;
					}
					this.write(element.dataValue);
					if (this.selectEventEnabled) {
						const select = new Event('select');
						select.value = element.dataValue;
						this.dispatchEvent(select);
					}
				}
				break;
			}
		}
	}
}

customElements.define('nav-bar', NavBar);
