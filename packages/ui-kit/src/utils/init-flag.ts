/**
 * 「只装配一次」标记：元素只作 key，状态在 WeakSet 里（不写元素数据、不占元素属性）。
 *
 * 用于 `initializeApi()` 这类可能被多次调用的初始化入口：`if (isInitialized(el)) return;`
 * 结束时 `markInitialized(el)`。
 */
const initialized = new WeakSet<Element>();

export const isInitialized = (el: unknown): boolean => el instanceof Element && initialized.has(el);

export const markInitialized = (el: unknown): void => {
	if (el instanceof Element) initialized.add(el);
};
