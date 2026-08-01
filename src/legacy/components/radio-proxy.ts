import {
	addClass,
	removeClass,
	hasClass,
	enable,
	disable,
	dispatchChangeEvent
} from '@/util/element-utils.ts';

interface RadioRelationEntry {
	case: any;
	targets: RadioProxy[];
}

// 单选项元素运行时挂载的扩展字段（与 RadioProxy 类同：dataValue/enable/disable）
interface RadioProxyElement extends HTMLElement {
	dataValue: any;
	enable(): void;
	disable(): void;
}

export class RadioProxy extends HTMLElement {
	dataValue: any;
	relations: RadioRelationEntry[];
	cancelable: boolean;
	writeEventEnabled: boolean;
	inputEventEnabled: boolean;

	constructor() {
		super();

		this.dataValue = null;
		this.relations = [];
		this.cancelable = false;
		this.writeEventEnabled = false;
		this.inputEventEnabled = false;
	}

	read(): any {
		return this.dataValue;
	}

	write(value: any): void {
		const elements = document.getElementsByName(
			this.id
		) as unknown as NodeListOf<RadioProxyElement>;
		for (const element of elements) {
			if (element.dataValue === value) {
				addClass(element as HTMLElement, 'selected');
				this.dataValue = value;
			} else {
				removeClass(element as HTMLElement, 'selected');
			}
		}
		if (!hasClass(this, 'disabled')) {
			this.toggleRelatedElements();
		}
		if (this.writeEventEnabled) {
			const write = new Event('write') as Event & {
				value: any;
			};
			write.value = this.dataValue;
			this.dispatchEvent(write);
		}
	}

	input(value: any): void {
		const lastValue = this.dataValue;
		if (lastValue !== value) {
			this.write(value);
			if (this.inputEventEnabled) {
				const input = new Event('input') as Event & {
					value: any;
					lastValue: any;
				};
				input.value = this.dataValue;
				input.lastValue = lastValue;
				this.dispatchEvent(input);
			}
			dispatchChangeEvent(this);
		}
	}

	reset(): void {
		if (this.dataValue !== null) {
			const elements = document.getElementsByName(
				this.id
			) as unknown as NodeListOf<RadioProxyElement>;
			for (const element of elements) {
				if (element.dataValue === this.dataValue) {
					removeClass(element as HTMLElement, 'selected');
					break;
				}
			}
			this.dataValue = null;
		}
	}

	enable(): void {
		if (removeClass(this, 'disabled')) {
			const elements = document.getElementsByName(this.id);
			for (const element of elements) {
				removeClass(element as HTMLElement, 'disabled');
			}
			this.toggleRelatedElements();
		}
	}

	disable(): void {
		if (addClass(this, 'disabled')) {
			const elements = document.getElementsByName(this.id);
			for (const element of elements) {
				addClass(element as HTMLElement, 'disabled');
			}
			this.toggleRelatedElements();
		}
	}

	relate(entries: RadioRelationEntry[]): void {
		this.relations = entries;
	}

	toggleRelatedElements(): void {
		if (this.relations.length !== 0) {
			if (!hasClass(this, 'disabled')) {
				const entries = this.relations;
				const selection = entries.find((entry) => entry.case === this.dataValue);
				for (const entry of entries) {
					if (entry.case === this.dataValue) {
						for (const element of entry.targets) {
							if (typeof element.enable === 'function') {
								element.enable();
							} else {
								enable(element);
							}
						}
					} else {
						for (const element of selection
							? Array.subtract(entry.targets, selection.targets)
							: entry.targets) {
							if (typeof element.disable === 'function') {
								element.disable();
							} else {
								disable(element);
							}
						}
					}
				}
			} else {
				const entries = this.relations;
				for (const entry of entries) {
					for (const element of entry.targets) {
						if (typeof element.disable === 'function') {
							element.disable();
						} else {
							disable(element);
						}
					}
				}
			}
		}
	}

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
			case 'input':
				this.inputEventEnabled = true;
				break;
		}
	}

	static map: Record<string, RadioProxy> = {};
}

customElements.define('radio-proxy', RadioProxy);
