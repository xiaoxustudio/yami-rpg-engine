/**
 * 窗口表单桥的通用工厂：把「懒挂载窗口 ↔ 命令 schema」之间的交接从 DOM 属性搬到模块。
 *
 * 背景（见 CONTRIBUTING「元素 API 挂载怎么安全拆掉」）：窗口是懒挂载的，schema 拿不到组件
 * 实例，旧做法把 `setForm` / `getForm` 挂到窗口根元素上（`attachElementApi`），于是元素 API
 * 变成业务契约的一部分。每个窗口各写一份 40 行的桥模块又太啰嗦，这里收成一个工厂，
 * 每个窗口只需要三行。
 *
 * 用法（每个窗口一个薄模块）：
 *   export const lightGetterBridge = createFormBridge<LightGetterForm>('lightGetter');
 * 组件 `onMounted` 里 `bridge.provide({ setForm, getForm })`、`onUnmounted` 里 `bridge.reset(api)`；
 * schema 里 `bridge.get()?.setForm(...)`。
 */
import { exposeDebugBridge } from '@app/utils/debug-bridges';

export interface FormBridgeApi<T> {
	setForm(data: Partial<T>): void;
	getForm(): T;
}

export interface FormBridge<T> {
	/** 组件挂载时登记（重复挂载以最后一次为准）。 */
	provide(api: FormBridgeApi<T>): void;
	/** 组件卸载时注销；只清理自己登记的那一份，避免误删后挂载的实例。 */
	reset(api: FormBridgeApi<T>): void;
	/** schema 侧读取；窗口未挂载时返回 null（与原 `?.setForm` 语义一致）。 */
	get(): FormBridgeApi<T> | null;
}

export function createFormBridge<T>(id: string): FormBridge<T> {
	let current: FormBridgeApi<T> | null = null;
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
