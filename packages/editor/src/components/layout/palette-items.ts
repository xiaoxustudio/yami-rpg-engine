import type { RegisteredLayoutItem } from '@app/engine/layout/layout.ts';

/**
 * 取模板 ref 对应的真实元素：
 * - `ref` 打在普通元素上 → 直接就是 HTMLElement；
 * - `ref` 打在组件上（palette 用 `<NavBar>`/`<PageManager>` 组件包裹）→ 拿到的是组件实例，
 *   其根元素在 `$el`。
 */
export const elementOfRef = (ref: unknown): HTMLElement | null => {
	if (ref instanceof HTMLElement) return ref;
	const el = (ref as { $el?: unknown } | null | undefined)?.$el;
	if (el instanceof HTMLElement) return el;
	return null;
};

/** 收集 palette 容器内的 items 登记项（子节点遍历，不依赖 document.querySelector*） */
export const collectPaletteItems = (
	navRef: unknown,
	managerRef: unknown
): RegisteredLayoutItem[] => {
	const entries: RegisteredLayoutItem[] = [];
	const collect = (root: HTMLElement | null, className: 'nav-item' | 'page-frame'): void => {
		if (root === null) return;
		for (const node of Array.from(root.children ?? [])) {
			if (!(node instanceof HTMLElement) || !node.classList.contains(className)) continue;
			const value = node.getAttribute('value') ?? '';
			if (value === '') continue;
			entries.push(className === 'nav-item' ? { value, nav: node } : { value, page: node });
		}
	};
	collect(elementOfRef(navRef), 'nav-item');
	collect(elementOfRef(managerRef), 'page-frame');
	return entries;
};
