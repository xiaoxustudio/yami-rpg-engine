/**
 * 项目设置窗口的控件表（页持有型）。
 *
 * 设置项分散在 5 个 section 组件里（display / scene / text / engine / other），单例
 * `useProjectSettingsWindow` 又要按 id 驱动它们。于是 root 不建表，各 section 挂载时把
 * 自己那一半登记进来、卸载时撤回；单例只认「表里有这个 id」。
 *
 * 为什么用模块表而不是 `provide/inject`：消费方是**非 Vue 单例**（模块级对象），拿不到组件树。
 * 与 `image-crop-handles` / `enum-handles` 同一形态：登记的是当前挂载实例的控件，卸载即失效。
 */
import { controlRoot, type ControlApi } from './control-refs';

export type ProjectSettingsControlTable = Partial<Record<string, ControlApi | null>>;

const tables = new Set<ProjectSettingsControlTable>();

/** section 挂载时登记自己那一半。 */
export const registerProjectSettingsControls = (part: ProjectSettingsControlTable): void => {
	tables.add(part);
};

/** section 卸载时撤回（只删自己那一份）。 */
export const resetProjectSettingsControls = (part: ProjectSettingsControlTable): void => {
	tables.delete(part);
};

/** 按 id 取控件实例；窗口未挂载时返回 null。 */
export const getProjectSettingsControl = (id: string): ControlApi | null => {
	// 倒序遍历：最后挂载的窗口优先（重开窗口时旧表可能还没卸载）
	const list = Array.from(tables);
	for (let i = list.length - 1; i >= 0; i--) {
		const control = list[i][id];
		if (control) return control;
	}
	return null;
};

/** 按 id 取控件根元素（`on` / `write` / `enableHiddenMode().relate(...)` 仍是元素语义）。 */
export const getProjectSettingsElement = (id: string): HTMLElement | null =>
	controlRoot(getProjectSettingsControl(id));

// ---- 窗口帧：单例要往帧上挂 close / closed / change 监听 ----

let frame: HTMLElement | null = null;

export const setProjectSettingsFrame = (el: HTMLElement | null): void => {
	frame = el;
};

export const getProjectSettingsFrame = (): HTMLElement | null => frame;
