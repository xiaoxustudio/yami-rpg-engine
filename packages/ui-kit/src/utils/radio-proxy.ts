import { addClass, removeClass, hasClass, dispatchChangeEvent } from './dom';

export type RadioRelationTarget = HTMLElement & {
	enable?(): void;
	disable?(): void;
};

export interface RadioRelationEntry {
	case: unknown;
	targets: RadioRelationTarget[];
}

export type RadioProxyElement = HTMLElement & {
	dataValue: unknown;
	relations: RadioRelationEntry[];
	cancelable: boolean;
	writeEventEnabled: boolean;
	inputEventEnabled: boolean;
	read(...args: unknown[]): unknown;
	write(...args: unknown[]): void;
	input(...args: unknown[]): void;
	reset(...args: unknown[]): void;
	enable(...args: unknown[]): void;
	disable(...args: unknown[]): void;
	relate(...args: unknown[]): void;
	toggleRelatedElements(): void;
	on(...args: unknown[]): void;
	/**
	 * P1b：组内成员（按 `name` 查询）。原先调用方各自 `document.getElementsByName('组名')`
	 * 反查 DOM，现在把这条查询收进 proxy 自身，编辑器侧改读 `proxy.group`。
	 */
	readonly group: RadioProxyElement[];
};

export const radioProxyMap: Record<string, HTMLElement> = {};

export const RadioProxy = { map: radioProxyMap };

const enable = (el: HTMLElement): void => {
	removeClass(el, 'disabled');
};
const disable = (el: HTMLElement): void => {
	addClass(el, 'disabled');
};

const subtract = <T>(a: T[], b: T[]): T[] => {
	const differences: T[] = [];
	const length = a.length;
	for (let i = 0; i < length; i++) {
		if (b.indexOf(a[i]) === -1) {
			differences.push(a[i]);
		}
	}
	return differences;
};

export function attachRadioProxyApi(el: HTMLElement): void {
	const proxy = el as RadioProxyElement;
	proxy.dataValue = null;
	proxy.relations = [];
	proxy.cancelable = false;
	proxy.writeEventEnabled = false;
	proxy.inputEventEnabled = false;

	proxy.read = function (): unknown {
		return proxy.dataValue;
	};

	// P1b：组内成员访问器——组名即 proxy.id（`write` 原本就是这么查的），
	// 把 `document.getElementsByName` 这条查询收敛到 ui-kit 一处。
	Object.defineProperty(proxy, 'group', {
		configurable: true,
		get: (): RadioProxyElement[] =>
			Array.from(document.getElementsByName(proxy.id)) as unknown as RadioProxyElement[]
	});

	proxy.write = function (value: unknown): void {
		const elements = document.getElementsByName(
			proxy.id
		) as unknown as NodeListOf<RadioProxyElement>;
		for (const element of elements) {
			if (element.dataValue === value) {
				addClass(element as HTMLElement, 'selected');
				// oxlint-disable-next-line no-explicit-any
				proxy.dataValue = value as string | number | boolean | Record<string, any> | null;
			} else {
				removeClass(element as HTMLElement, 'selected');
			}
		}
		if (!hasClass(proxy, 'disabled')) {
			proxy.toggleRelatedElements();
		}
		if (proxy.writeEventEnabled) {
			const write = new Event('write') as Event & {
				value: unknown;
			};
			write.value = proxy.dataValue;
			proxy.dispatchEvent(write);
		}
	};

	proxy.input = function (value: unknown): void {
		const lastValue = proxy.dataValue;
		if (lastValue !== value) {
			proxy.write(value);
			if (proxy.inputEventEnabled) {
				const input = new Event('input') as Event & {
					value: unknown;
					lastValue: unknown;
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
							? subtract(entry.targets, selection.targets)
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
		listener: (event: Event) => void,
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
