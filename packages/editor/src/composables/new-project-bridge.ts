/**
 * newProject 窗口的**控件级能力桥**（模块级强类型）。
 *
 * 单例（`title/new-project-window.ts`）在建工程前要读「用户选的模板」、并把校验提示写回窗口。
 * 旧做法是按 id 从 `titleEls` 取元素再 `read()` / 改 `textContent`；窗口迁成模板 ref 后元素不再进
 * 注册表，于是这两件事由窗口实现、经模块桥交出 —— 单例不再知道控件 id。
 *
 * 实现收口在 `composables/form-bridge.ts`（同一把 id 只留一份当前实例，卸载即注销）。
 */
import { createFormBridge } from './form-bridge';

export interface NewProjectBridge {
	/** 写窗口底部的校验提示（空串表示清空）。 */
	setWarning(text: string): void;
	/** 当前选中的模板 id；窗口未挂载时返回 null。 */
	getTemplate(): string | null;
}

const bridge = createFormBridge<NewProjectBridge>('newProject');

/** 组件挂载时登记。 */
export const provideNewProjectBridge = (api: NewProjectBridge): void => bridge.provide(api);
/** 组件卸载时注销（只清理自己登记的那一份）。 */
export const resetNewProjectBridge = (api: NewProjectBridge): void => bridge.reset(api);
/** 单例侧读取；窗口未挂载时返回 null（等价于原来的 `titleEls.get(...)` 空守卫）。 */
export const getNewProjectBridge = (): NewProjectBridge | null => bridge.get();
