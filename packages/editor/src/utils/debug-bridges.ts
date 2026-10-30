/**
 * debug 模式下的窗口契约出口 —— **只给真机 E2E 用**。
 *
 * 背景：元素契约收尾要把「窗口表单桥」从 DOM 属性（`attachElementApi(el, { setForm })`）
 * 换成模块级强类型桥。但真机 E2E 的 `setForm → getForm` 往返断言正是靠这条 DOM 桥驱动窗口的，
 * 直接换掉会让门禁失去表单级验证（见 CONTRIBUTING「为什么元素 API 挂载还没动」）。
 *
 * 折中：桥本身走模块（生产代码只认模块），另外**仅在 `--debug-mode` 下**把同一份对象挂到
 * `window.__YAMI_BRIDGES__` 供 CDP 取用。生产构建里 `enabled === false`，连属性都不会创建，
 * 所以不存在「线上多一个可调用入口」的问题。
 */
export type DebugBridgeApi = object;

const enabled =
	typeof process !== 'undefined' &&
	Array.isArray(process.argv) &&
	process.argv.includes('--debug-mode');

const registry: Record<string, DebugBridgeApi> = {};

type WindowWithBridges = Window & { __YAMI_BRIDGES__?: Record<string, DebugBridgeApi> };

/** 登记/注销一份窗口契约（`null` 表示卸载）。非 debug 模式下是空操作。 */
export function exposeDebugBridge(id: string, api: DebugBridgeApi | null): void {
	if (!enabled) return;
	if (api) registry[id] = api;
	else delete registry[id];
	(window as WindowWithBridges).__YAMI_BRIDGES__ = registry;
}

/** 自证与排查用：当前进程是否运行在 debug 模式。 */
export function isDebugBridgeEnabled(): boolean {
	return enabled;
}
