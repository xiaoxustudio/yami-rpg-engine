/**
 * 从元素反查**控件实例**（`defineExpose` 成员），供 `element-utils` 的
 * `read` / `write` / `clear` 这类「既收元素又收控件」的老 shim 使用。
 *
 * 背景：旧式窗口模块长期持有控件**根元素**，再经 shim 调 `read()` / `write()`；元素 API
 * 退场后元素上不再有这些方法。这里沿 Vue 的内部 `__vueParentComponent` 往上找：
 * ui-kit 组件（`YM*`）只暴露 `{ root }` 之类，跳过；editor 包装层才有 read/write。
 *
 * 只在前两层里找，找不到就返回 null，由 shim 回退到元素数据（保持旧行为）。
 */
interface ComponentType {
	name?: string;
	__name?: string;
}

interface ComponentInstance {
	exposed?: Record<string, unknown> | null;
	parent?: ComponentInstance | null;
	type?: ComponentType;
}

export type ControlInstanceApi = Record<string, unknown> & {
	read?: () => unknown;
	write?: (value: unknown) => void;
	clear?: () => unknown;
};

export const controlApiOfElement = (target: unknown): ControlInstanceApi | null => {
	if (!(target instanceof Element)) return null;
	let instance = (target as Element & { __vueParentComponent?: ComponentInstance | null })
		.__vueParentComponent;
	let depth = 0;
	while (instance && depth < 6) {
		const exposed = instance.exposed;
		if (exposed) {
			const name = instance.type?.__name ?? instance.type?.name ?? '';
			const hasApi = Object.keys(exposed).some((key) => key !== 'root');
			if (hasApi && !name.startsWith('YM')) return exposed as ControlInstanceApi;
		}
		instance = instance.parent ?? null;
		depth += 1;
	}
	return null;
};
