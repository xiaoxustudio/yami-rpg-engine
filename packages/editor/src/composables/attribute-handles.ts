/**
 * attribute 窗口交给单例的**句柄表**（模块级强类型）。
 *
 * 与 `enum-handles.ts` 同一个模式：`attribute-window.ts` 长期持有 list / panel / searcher /
 * inputs.*，还会往 `list` 上挂 `saveScroll` / `cancelSearch` / `createFolder` 等方法，
 * 所以窗口挂载时一次性交出句柄、卸载时注销最合适。
 */
import { createFormBridge } from './form-bridge';
import type { YamiElement } from '@app/types/element-api';

export interface AttributeWindowHandles {
	/** 窗口根元素（`close` / `closed` 事件来源）。 */
	root: YamiElement;
	/** 属性列表（ui-kit TreeList）。 */
	list: YamiElement;
	/** 右侧属性面板容器。 */
	panel: YamiElement;
	/** 搜索框。 */
	searcher: YamiElement;
	/** 名称 / 键 / 备注三个输入框。 */
	name: YamiElement;
	key: YamiElement;
	note: YamiElement;
	/** 枚举下拉与它的容器。 */
	enum: YamiElement;
	enumBox: YamiElement;
}

const bridge = createFormBridge<AttributeWindowHandles>('attribute');

/** 窗口挂载时登记。 */
export const provideAttributeHandles = (handles: AttributeWindowHandles): void =>
	bridge.provide(handles);
/** 窗口卸载时注销（只清理自己登记的那一份）。 */
export const resetAttributeHandles = (handles: AttributeWindowHandles): void =>
	bridge.reset(handles);
/** 单例侧读取；窗口未挂载时返回 null（等价于原来的「元素不存在就静默跳过」）。 */
export const getAttributeHandles = (): AttributeWindowHandles | null => bridge.get();
