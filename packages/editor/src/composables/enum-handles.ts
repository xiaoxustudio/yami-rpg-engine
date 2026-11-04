/**
 * enum 窗口交给单例的**句柄表**（模块级强类型）。
 *
 * `enum-window.ts` 是长期持有 DOM 的单例：`Enum.list` / `Enum.panel` / `Enum.searcher` /
 * `Enum.inputs.*` 都存成字段，还会在 `Enum.list` 上挂 `saveScroll` / `cancelSearch` 等方法，
 * 所以它不是「每次调用取一次元素」的形状 —— 一次性把句柄交出来最合适。
 *
 * 与 `image-crop-handles.ts` 同一个模式（长期持有元素类单例的样板）。
 */
import { createFormBridge } from './form-bridge';
import type { YamiElement } from '@app/types/element-api';

export interface EnumWindowHandles {
	/** 窗口根元素（`close` / `closed` 事件来源）。 */
	root: YamiElement;
	/** 枚举列表（ui-kit TreeList，元素上带着 `saveScroll` 等方法）。 */
	list: YamiElement;
	/** 右侧属性面板容器。 */
	panel: YamiElement;
	/** 搜索框。 */
	searcher: YamiElement;
	/** 三张输入框（名称 / 值 / 备注）。 */
	name: YamiElement;
	value: YamiElement;
	note: YamiElement;
}

const bridge = createFormBridge<EnumWindowHandles>('enum');

/** 窗口挂载时登记。 */
export const provideEnumHandles = (handles: EnumWindowHandles): void => bridge.provide(handles);
/** 窗口卸载时注销（只清理自己登记的那一份）。 */
export const resetEnumHandles = (handles: EnumWindowHandles): void => bridge.reset(handles);
/** 单例侧读取；窗口未挂载时返回 null（等价于原来的「元素不存在就静默跳过」）。 */
export const getEnumHandles = (): EnumWindowHandles | null => bridge.get();
