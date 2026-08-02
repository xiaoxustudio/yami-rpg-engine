import {
	addClass,
	removeClass,
	hasClass,
	enable,
	disable,
	dispatchChangeEvent
} from '@/util/element-utils.ts';

interface RadioRelationTarget extends HTMLElement {
	enable?(): void;
	disable?(): void;
}

export interface RadioRelationEntry {
	case: any;
	targets: RadioRelationTarget[];
}

export interface RadioProxyElement extends HTMLElement {
	dataValue: any;
	relations: RadioRelationEntry[];
	cancelable: boolean;
	writeEventEnabled: boolean;
	inputEventEnabled: boolean;
	read(): any;
	write(value: any): void;
	input(value: any): void;
	reset(): void;
	enable(): void;
	disable(): void;
	relate(entries: RadioRelationEntry[]): void;
	toggleRelatedElements(): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

export const radioProxyMap: Record<string, HTMLElement> = {};

export const RadioProxy = { map: radioProxyMap };

export function attachRadioProxyApi(el: HTMLElement): void {
	const proxy = el as RadioProxyElement;
	proxy.dataValue = null;
	proxy.relations = [];
	proxy.cancelable = false;
	proxy.writeEventEnabled = false;
	proxy.inputEventEnabled = false;

	proxy.read = function (): any {
		return proxy.dataValue;
	};

	proxy.write = function (value: any): void {
		const elements = document.getElementsByName(
			proxy.id
		) as unknown as NodeListOf<RadioProxyElement>;
		for (const element of elements) {
			if (element.dataValue === value) {
				addClass(element as HTMLElement, 'selected');
				proxy.dataValue = value;
			} else {
				removeClass(element as HTMLElement, 'selected');
			}
		}
		if (!hasClass(proxy, 'disabled')) {
			proxy.toggleRelatedElements();
		}
		if (proxy.writeEventEnabled) {
			const write = new Event('write') as Event & {
				value: any;
			};
			write.value = proxy.dataValue;
			proxy.dispatchEvent(write);
		}
	};

	proxy.input = function (value: any): void {
		const lastValue = proxy.dataValue;
		if (lastValue !== value) {
			proxy.write(value);
			if (proxy.inputEventEnabled) {
				const input = new Event('input') as Event & {
					value: any;
					lastValue: any;
				};
				input.value = proxy.dataValue;
				input.lastValue = lastValue;
				proxy.dispatchEvent(input);
			}
			dispatchChangeEvent(proxy);
		}
	};

	proxy.reset = function (): void {
		if (proxy.dataValue !== null) {
			const elements = document.getElementsByName(
				proxy.id
			) as unknown as NodeListOf<RadioProxyElement>;
			for (const element of elements) {
				if (element.dataValue === proxy.dataValue) {
					removeClass(element as HTMLElement, 'selected');
					break;
				}
			}
			proxy.dataValue = null;
		}
	};

	proxy.enable = function (): void {
		if (removeClass(proxy, 'disabled')) {
			const elements = document.getElementsByName(proxy.id);
			for (const element of elements) {
				removeClass(element as HTMLElement, 'disabled');
			}
			proxy.toggleRelatedElements();
		}
	};

	proxy.disable = function (): void {
		if (addClass(proxy, 'disabled')) {
			const elements = document.getElementsByName(proxy.id);
			for (const element of elements) {
				addClass(element as HTMLElement, 'disabled');
			}
			proxy.toggleRelatedElements();
		}
	};

	proxy.relate = function (entries: RadioRelationEntry[]): void {
		proxy.relations = entries;
	};

	proxy.toggleRelatedElements = function (): void {
		if (proxy.relations.length !== 0) {
			if (!hasClass(proxy, 'disabled')) {
				const entries = proxy.relations;
				const selection = entries.find((entry) => entry.case === proxy.dataValue);
				for (const entry of entries) {
					if (entry.case === proxy.dataValue) {
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
				const entries = proxy.relations;
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
	};

	proxy.on = function (
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void {
		proxy.addEventListener(type, listener as EventListener, options);
		switch (type) {
			case 'write':
				proxy.writeEventEnabled = true;
				break;
			case 'input':
				proxy.inputEventEnabled = true;
				break;
		}
	};
}

export function createRadioProxy(): HTMLElement {
	const el = document.createElement('div');
	el.className = 'radio-proxy';
	el.style.display = 'none';
	attachRadioProxyApi(el);
	return el;
}
