/**
 * fileEvent 页的能力桥（模块级强类型）。
 *
 * `inspector/file-event-page.ts` 这个单例需要：给类型下拉灌候选项、让页面重渲染、清空参数列表、
 * 按事件类型开关「启用 / 优先级」两行的显隐。旧做法都是按 id 从 `inspectorEls` 取元素（还要摸
 * `previousElementSibling` 找标签）；现在这些事由页面自己实现，经本桥交出。
 *
 * 实现收口在 `composables/form-bridge.ts`（同一把 id 只留一份当前实例，卸载即注销）。
 */
import { createFormBridge } from './form-bridge';

export interface FileEventPageBridge {
	/** 类型下拉的候选项。 */
	loadTypeItems(items: unknown[]): void;
	/** 让页面按最新数据重渲染。 */
	sync(): void;
	/** 清空参数列表（页面关闭时）。 */
	clearParameters(): void;
	/** 按事件类型开关「启用」这一行（含左侧标签）。 */
	setEnabledVisible(visible: boolean): void;
	/** 按事件类型开关「优先级」这一行（含左侧标签）。 */
	setPriorityVisible(visible: boolean): void;
}

const bridge = createFormBridge<FileEventPageBridge>('fileEventPage');

/** 页面挂载时登记。 */
export const provideFileEventPageBridge = (api: FileEventPageBridge): void => bridge.provide(api);
/** 页面卸载时注销（只清理自己登记的那一份）。 */
export const resetFileEventPageBridge = (api: FileEventPageBridge): void => bridge.reset(api);
/** 单例侧读取；页面未挂载时返回 null（等价于原来的「元素不存在就静默跳过」）。 */
export const getFileEventPageBridge = (): FileEventPageBridge | null => bridge.get();
