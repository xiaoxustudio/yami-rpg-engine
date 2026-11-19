/**
 * 命令式控件的「能力对象」表：元素只作 key，方法不再挂到元素上。
 *
 * 适用于没有 Vue 组件实例的工厂件（`createDetailBoxElement()` 这类）。消费方仍按元素
 * 寻址，但能力从这张表取 —— 与 `element-capabilities` 同一思路，只是承载任意 API。
 * 有组件实例的控件优先用实例（`controlApiOfElement` 会先查实例，再回退到这里）。
 */
export type ElementApi = Record<string, unknown>;

const apis = new WeakMap<Element, ElementApi>();

export const setElementApi = <T extends object>(el: Element, api: T): T => {
	apis.set(el, api as ElementApi);
	return api;
};

/**
 * 泛型不约束到 `ElementApi`：`*Api` 契约多是 `interface`/交叉类型，而 interface 没有隐式索引签名，
 * 无法赋给 `Record<string, unknown>`；传 type literal 与 interface 都应该能取。
 */
export const getElementApi = <T = ElementApi>(el: unknown): T | null => {
	if (!(el instanceof Element)) return null;
	return (apis.get(el) as unknown as T | undefined) ?? null;
};
