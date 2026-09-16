import { addClass, removeClass, hasClass, dispatchChangeEvent } from './dom';
import { elementDataOf, elementDataValueOf } from './element-data';

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

/**
 * P4b：组内成员（`document.getElementsByName`）可能是两种宿主——
 * ① radio-box 元素：`YMRadioBox`/`RadioBox.vue` 在元素上自建 own `dataValue` 访问器（组件自持状态，遮蔽原型）；
 * ② radio-proxy 自身：`dataValue` 是元素数据。
 * 原来的 `element.dataValue` 属性读正好覆盖两者，访问器退役后必须显式二选一——统一走
 * `elementDataValueOf`（own 属性优先，否则元素数据；口径同 `utils/dom.ts` 的 `read`）。
 */
const memberDataValue = (el: RadioProxyElement): unknown => elementDataValueOf(el);

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
	// P4b: relations now lives in element data (field removed from DATA_FIELDS)
	const data = elementDataOf<RadioProxyElement>(proxy);
	data.dataValue = null;
	data.relations = [];
	proxy.cancelable = false;
	proxy.writeEventEnabled = false;
	proxy.inputEventEnabled = false;

	proxy.read = function (): unknown {
		return data.dataValue;
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
			if (memberDataValue(element) === value) {
				addClass(element as HTMLElement, 'selected');
				// oxlint-disable-next-line no-explicit-any
				data.dataValue = value as string | number | boolean | Record<string, any> | null;
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
			write.value = data.dataValue;
			proxy.dispatchEvent(write);
		}
	};

	proxy.input = function (value: unknown): void {
		const lastValue = data.dataValue;
		if (lastValue !== value) {
			proxy.write(value);
			if (proxy.inputEventEnabled) {
				const input = new Event('input') as Event & {
					value: unknown;
					lastValue: unknown;
				};
				input.value = data.dataValue;
				input.lastValue = lastValue;
				proxy.dispatchEvent(input);
			}
			dispatchChangeEvent(proxy);
		}
	};

	proxy.reset = function (): void {
		if (data.dataValue !== null) {
			const elements = document.getElementsByName(
				proxy.id
			) as unknown as NodeListOf<RadioProxyElement>;
			for (const element of elements) {
				if (memberDataValue(element) === data.dataValue) {
					removeClass(element as HTMLElement, 'selected');
					break;
				}
			}
			data.dataValue = null;
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
		data.relations = entries;
	};

	proxy.toggleRelatedElements = function (): void {
		if (data.relations.length !== 0) {
			if (!hasClass(proxy, 'disabled')) {
				const entries = data.relations;
				const selection = entries.find((entry) => entry.case === data.dataValue);
				for (const entry of entries) {
					if (entry.case === data.dataValue) {
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
				const entries = data.relations;
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
