/**
 * 元素上的「DOM 型能力」：焦点、启用/禁用。
 *
 * 少数调用点拿到的是元素而不是组件实例 —— `v-focus` 指令由 Vue 传给元素的只有根节点，
 * `select-box-core` 的 `relate` 目标本身也是 DOM（要读写 `style.display` 与兄弟标签）。
 * 这些能力放进 WeakMap 按元素查，元素上不再挂方法属性；控件级能力一律走 `defineExpose`。
 */
export interface ElementCapabilities {
	getFocus?: (mode?: string) => unknown;
	enable?: () => void;
	disable?: () => void;
}

const capabilities = new WeakMap<HTMLElement, ElementCapabilities>();

export function setElementCapabilities(el: HTMLElement, caps: ElementCapabilities): void {
	const current = capabilities.get(el);
	capabilities.set(el, current ? { ...current, ...caps } : caps);
}

export function getElementCapabilities(el: HTMLElement): ElementCapabilities | undefined {
	return capabilities.get(el);
}

export function clearElementCapabilities(el: HTMLElement): void {
	capabilities.delete(el);
}

/**
 * 启用/禁用 relate 目标。
 *
 * 目标按 DOM 语义传入（行 / 控件根），能力从能力表查；没有登记就退化成切 `disabled` 类，
 * 保证「不是我们控件的纯 DOM 节点」也能按原来的显隐规则处理。
 */
export function enableElement(el: HTMLElement): void {
	const caps = capabilities.get(el);
	if (caps?.enable) {
		caps.enable();
		return;
	}
	const legacy = (el as HTMLElement & { enable?: () => void }).enable;
	if (typeof legacy === 'function') {
		legacy.call(el);
		return;
	}
	el.classList.remove('disabled');
}

export function disableElement(el: HTMLElement): void {
	const caps = capabilities.get(el);
	if (caps?.disable) {
		caps.disable();
		return;
	}
	const legacy = (el as HTMLElement & { disable?: () => void }).disable;
	if (typeof legacy === 'function') {
		legacy.call(el);
		return;
	}
	el.classList.add('disabled');
}
