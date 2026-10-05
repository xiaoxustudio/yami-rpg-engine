import { elementDataOf, isApiAttached, markApiAttached } from '../../../utils/element-data';
import { addClass, parseNumberOrString, removeClass, hasClass } from '../../../utils/dom';
import { createPayloadEvent } from '../../../utils/payload-event';

export interface NavBarApi extends HTMLElement {
	writeEventEnabled: boolean;
	selectEventEnabled: boolean;
	read(...args: unknown[]): unknown;
	write(...args: unknown[]): void;
	unselect(...args: unknown[]): void;
	pointerdown(event: PointerEvent): void;
	on(...args: unknown[]): void;
}

// nav-item 的 `dataValue`（按 `value` 属性解析出的选中值）走显式元素数据
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
	const nav = el as NavBarApi;
	if (isApiAttached(nav)) return nav;

	nav.writeEventEnabled = false;
	nav.selectEventEnabled = false;

	// 最近一次写入的值：页签是**整壳 Teleport**搬进 nav 的，搬运会连 `selected` 残留一起带过来
	// （每个面板的壳在自己的组里都是选中态）。子节点一变就按这个值重放一次选中（幂等）。
	let current: unknown;

	const emitValueEvent = (type: string, value: unknown): void => {
		const event = createPayloadEvent(type, {} as { value: unknown });
		event.value = value;
		el.dispatchEvent(event);
	};

	nav.on = function (
		type: string,
		listener: (event: Event) => void,
		listenerOptions?: boolean | AddEventListenerOptions
	): void {
		el.addEventListener(type, listener, listenerOptions);
		switch (type) {
			case 'write':
				nav.writeEventEnabled = true;
				break;
			case 'select':
				nav.selectEventEnabled = true;
				break;
		}
	};

	nav.read = function (): unknown {
		const item = el.querySelector('.selected') as (HTMLElement & { dataValue: unknown }) | null;
		if (item) {
			const data = navItemData(item);
			if (data.dataValue === undefined && hasClass(item, 'nav-item')) {
				parseValue(item);
			}
			return data.dataValue;
		}
		return undefined;
	};

	nav.write = function (value: unknown): void {
		current = value;
		const items = el.childNodes;
		const length = items.length;
		if (length !== 0) {
			nav.unselect();
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
			if (nav.writeEventEnabled) {
				emitValueEvent('write', target ? value : undefined);
			}
		}
	};

	/**
	 * 清掉**全部** `selected`，而不是只清第一个。
	 *
	 * 页签由整壳 Teleport 在分组间搬运，搬进来的页签带着它原来那个组的 `selected`：
	 * 旧实现用 `querySelector('.selected')` 只清一个 ⇒ 残留 + 新选中同时亮
	 * （实机「点哪个页签都同时显示 active」），且点击时 `pointerdown` 还会因为
	 * `hasClass(element,'selected')` 为真而**跳过写入**（点活动页签什么都不发生）。
	 */
	nav.unselect = function (): void {
		for (const item of Array.from(el.querySelectorAll('.selected'))) {
			removeClass(item, 'selected');
		}
	};

	nav.pointerdown = function (event: PointerEvent): void {
		switch (event.button) {
			case 0: {
				const element = event.target as HTMLElement & { dataValue: unknown };
				if (hasClass(element, 'nav-item') && !hasClass(element, 'selected')) {
					const data = navItemData(element);
					nav.write(parseValue(element));
					if (nav.selectEventEnabled) {
						emitValueEvent('select', data.dataValue);
					}
				}
				break;
			}
		}
	};

	// 显式箭头包装——`nav.pointerdown` 是方法引用，直接当监听器传会丢 `this`
	// （unbound-method 的成因）。这里把接收者写死成 `nav`，与派发时 `this === nav` 等价。
	el.addEventListener('pointerdown', (event) => nav.pointerdown(event as PointerEvent));

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

	// Teleport 把页签搬进来的**那一刻**带着旧组的 `selected`，而调用方的 `write()` 早就发生了
	// （搬入通常晚于激活写入）—— 只靠 write 时清残留会漏掉这一批。子节点一变就重放当前值。
	new MutationObserver(() => {
		if (current !== undefined) nav.write(current);
	}).observe(el, { childList: true });

	markApiAttached(nav);
	return nav;
}

export function createNavBarElement(): NavBarApi {
	const el = document.createElement('div');
	el.className = 'nav-bar';
	return attachNavBarApi(el);
}
