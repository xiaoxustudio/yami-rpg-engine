import { elementDataOf } from '../../../utils/element-data';
import { getElementApi, setElementApi } from '../../../utils/element-apis';
import { addClass, parseNumberOrString, removeClass, hasClass } from '../../../utils/dom';
import { createPayloadEvent } from '../../../utils/payload-event';

/**
 * 导航条能力对象（命令式工厂件：方法不挂元素，元素只作 key）。
 *
 * 状态字段（`writeEventEnabled` / `selectEventEnabled`）也在这里，读方一律走
 * `getElementApi(el)`；元素上不再有同名属性。
 */
export interface NavBarApi {
	writeEventEnabled: boolean;
	selectEventEnabled: boolean;
	read(): unknown;
	write(value: unknown): void;
	unselect(): void;
	pointerdown(event: PointerEvent): void;
	on(
		type: string,
		listener: (event: Event) => void,
		listenerOptions?: boolean | AddEventListenerOptions
	): void;
}

interface NavItemData {
	dataValue?: unknown;
}

const navItemData = (el: unknown): NavItemData => elementDataOf<NavItemData>(el);

const parseValue = (element: HTMLElement & { dataValue?: unknown }): unknown => {
	const data = navItemData(element);
	if (data.dataValue === undefined) {
		const string = element.getAttribute('value') ?? '';
		data.dataValue = parseNumberOrString(string);
	}
	return data.dataValue;
};

export function attachNavBarApi(el: HTMLElement): NavBarApi {
	const existing = getElementApi<NavBarApi>(el);
	if (existing) return existing;

	const api: NavBarApi = {
		writeEventEnabled: false,
		selectEventEnabled: false,
		on(type, listener, listenerOptions): void {
			el.addEventListener(type, listener, listenerOptions);
			switch (type) {
				case 'write':
					api.writeEventEnabled = true;
					break;
				case 'select':
					api.selectEventEnabled = true;
					break;
			}
		},
		read(): unknown {
			const item = el.querySelector('.selected') as
				| (HTMLElement & {
						dataValue: unknown;
				  })
				| null;
			if (item) {
				const data = navItemData(item);
				if (data.dataValue === undefined && hasClass(item, 'nav-item')) {
					parseValue(item);
				}
				return data.dataValue;
			}
			return undefined;
		},
		write(value: unknown): void {
			current = value;
			const items = el.childNodes;
			const length = items.length;
			if (length !== 0) {
				api.unselect();
				let target: HTMLElement | undefined;
				for (let i = 0; i < length; i++) {
					const item = items[i] as HTMLElement & { dataValue: unknown };
					const data = navItemData(item);
					if (hasClass(item, 'nav-item') && data.dataValue === undefined) {
						parseValue(item);
					}
					if (data.dataValue === value) {
						target = item;
						break;
					}
				}
				if (target !== undefined) {
					addClass(target, 'selected');
				}
				if (api.writeEventEnabled) {
					emitValueEvent('write', target ? value : undefined);
				}
			}
		},
		unselect(): void {
			for (const item of Array.from(el.querySelectorAll('.selected'))) {
				removeClass(item, 'selected');
			}
		},
		pointerdown(event: PointerEvent): void {
			switch (event.button) {
				case 0: {
					const element = event.target as HTMLElement & { dataValue: unknown };
					if (hasClass(element, 'nav-item') && !hasClass(element, 'selected')) {
						const data = navItemData(element);
						api.write(parseValue(element));
						if (api.selectEventEnabled) {
							emitValueEvent('select', data.dataValue);
						}
					}
					break;
				}
			}
		}
	};

	let current: unknown;

	const emitValueEvent = (type: string, value: unknown): void => {
		const event = createPayloadEvent(type, {} as { value: unknown });
		event.value = value;
		el.dispatchEvent(event);
	};

	el.addEventListener('pointerdown', (event) => api.pointerdown(event as PointerEvent));

	const elements = el.childNodes;
	if (elements.length > 0) {
		let i = elements.length;
		while (--i >= 0) {
			const element = elements[i] as HTMLElement & { dataValue: unknown };
			if (hasClass(element, 'nav-item')) {
				parseValue(element);
			} else {
				el.removeChild(element);
			}
		}
	}

	new MutationObserver(() => {
		if (current !== undefined) api.write(current);
	}).observe(el, { childList: true });

	setElementApi(el, api);
	return api;
}

export function createNavBarElement(): HTMLElement {
	const el = document.createElement('div');
	el.className = 'nav-bar';
	attachNavBarApi(el);
	return el;
}
