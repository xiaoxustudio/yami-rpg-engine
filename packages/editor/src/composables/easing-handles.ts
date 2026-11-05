/**
 * easing 窗口族交给单例的**句柄表**（模块级强类型）。
 *
 * `data/transition-window.ts` 长期持有列表 / 画布 / 模式下拉，并给 16 个控制点输入挂监听。
 * 这些节点分布在两个组件里（`Easing.vue` 与 `easing/EasingPointsSection.vue`），所以用两份桥：
 * 谁挂载谁登记自己那一半，单例按需读。
 */
import { createFormBridge } from './form-bridge';
import type { YamiElement } from '@app/types/element-api';

/** `Easing.vue` 提供：窗口根、列表、两条画布、预览反向开关。 */
export interface EasingWindowHandles {
	root: YamiElement;
	list: YamiElement;
	curve: YamiElement;
	preview: YamiElement;
	previewReverse: YamiElement;
}

/** `EasingPointsSection.vue` 提供：网格、模式下拉、16 个控制点输入。 */
export interface EasingPointsHandles {
	grid: YamiElement;
	mode: YamiElement;
	/** 键形如 `easing-points-0-x`。 */
	points: Record<string, HTMLElement>;
}

const windowBridge = createFormBridge<EasingWindowHandles>('easingWindow');
const pointsBridge = createFormBridge<EasingPointsHandles>('easingPoints');

/** `Easing.vue` 挂载时登记。 */
export const provideEasingWindowHandles = (handles: EasingWindowHandles): void =>
	windowBridge.provide(handles);
/** `Easing.vue` 卸载时注销。 */
export const resetEasingWindowHandles = (handles: EasingWindowHandles): void =>
	windowBridge.reset(handles);
/** 单例侧读取。 */
export const getEasingWindowHandles = (): EasingWindowHandles | null => windowBridge.get();

/** `EasingPointsSection.vue` 挂载时登记。 */
export const provideEasingPointsHandles = (handles: EasingPointsHandles): void =>
	pointsBridge.provide(handles);
/** `EasingPointsSection.vue` 卸载时注销。 */
export const resetEasingPointsHandles = (handles: EasingPointsHandles): void =>
	pointsBridge.reset(handles);
/** 单例侧读取。 */
export const getEasingPointsHandles = (): EasingPointsHandles | null => pointsBridge.get();
