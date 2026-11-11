/**
 * 控件本地化的 DOM 事件契约（ui-kit 侧唯一真源）。
 *
 * 旧做法是 `setLocalElement(el, item)` 直接调元素上挂的方法（`setTitle` /
 * `setPlaceholder` / `setItemNames`）—— 那条契约依赖元素 API。现在改成在控件根元素上
 * 派发事件，控件自己监听并应用；元素只承担 textContent / tip / label 这类纯 DOM 写入。
 *
 * 元素不是 Vue 渲染的（命令式工厂 `attachXxxApi`）时，事件由工厂在创建元素时自己监听，
 * 不再把方法挂到元素上。
 */
export const LOCALIZE_EVENT = 'yami-localize';

export interface LocalizeDetail {
	kind: 'title' | 'placeholder' | 'options';
	text?: string;
	options?: unknown;
}

export function requestLocalize(element: Element, detail: LocalizeDetail): void {
	element.dispatchEvent(new CustomEvent<LocalizeDetail>(LOCALIZE_EVENT, { detail }));
}

export function onLocalize(element: Element, listener: (detail: LocalizeDetail) => void): void {
	element.addEventListener(LOCALIZE_EVENT, (event) => {
		listener((event as CustomEvent<LocalizeDetail>).detail);
	});
}
