/**
 * 窗口「表单 + 控件」桥的通用工厂：把「懒挂载窗口 ↔ 命令 schema / 老单例」之间的交接
 * 从 DOM 属性搬到模块。
 *
 * 背景（见 CONTRIBUTING「元素 API 挂载怎么安全拆掉」）：窗口是懒挂载的，schema 拿不到组件
 * 实例，旧做法把 `setForm` / `getForm` 挂到窗口根元素上（`attachElementApi`），于是元素 API
 * 变成业务契约的一部分。
 *
 * 泛型参数是**对外 API 的形状**而不是表单类型：有的窗口只暴露 `setForm` / `getForm`，
 * 有的还要暴露控件级能力（例如 `loadItems`）。工厂不关心具体成员，只保证「同一把 id 上
 * 只存在一份当前实例，卸载时只清理自己那份」。
 *
 * 用法（每个窗口一个薄模块）：
 *   const bridge = createFormBridge<MyWindowBridge>('myWindow');
 *   export const provideMyWindowBridge = (api: MyWindowBridge): void => bridge.provide(api);
 *   export const getMyWindowBridge = (): MyWindowBridge | null => bridge.get();
 */
import { exposeDebugBridge } from '@app/utils/debug-bridges';

export interface FormBridge<Api extends object> {
	/** 组件挂载时登记（重复挂载以最后一次为准）。 */
	provide(api: Api): void;
	/** 组件卸载时注销；只清理自己登记的那一份，避免误删后挂载的实例。 */
	reset(api: Api): void;
	/** 消费方读取；窗口未挂载时返回 null（与原 `?.setForm` / `?.get` 语义一致）。 */
	get(): Api | null;
}

export function createFormBridge<Api extends object>(id: string): FormBridge<Api> {
	let current: Api | null = null;
	return {
		provide(api) {
			current = api;
			exposeDebugBridge(id, api);
		},
		reset(api) {
			if (current !== api) return;
			current = null;
			exposeDebugBridge(id, null);
		},
		get() {
			return current;
		}
	};
}
