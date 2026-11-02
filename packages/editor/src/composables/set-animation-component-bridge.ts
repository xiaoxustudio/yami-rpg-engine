/**
 * setAnimationComponent 窗口的**控件级能力桥**（模块级强类型）。
 *
 * schema 载入表单时要按动画 id 给三个下拉（motion / playMotion / spriteId）灌候选项。
 * 旧做法是按 id 从 `composableEls` 取元素再调 `loadItems`；窗口迁成模板 ref 后控件不再进
 * 注册表，而 `loadItems` 是控件级能力 —— 由窗口实现、经这条模块桥交给 schema，
 * schema 不再知道任何控件 id。
 *
 * 三份候选项一起传：调用方本来就是同一次 `Animation.*ListItems(animationId)` 的三个结果，
 * 分成三个 `loadItems` 会让 schema 又要记住「哪个下拉对应哪个 list」。
 */
import { createFormBridge } from './form-bridge';

export interface SetAnimationComponentBridge {
	/** 按动画 id 灌入 motion / playMotion / spriteId 三个下拉的候选项。 */
	loadItems(motion: unknown[], playMotion: unknown[], sprite: unknown[]): void;
}

const bridge = createFormBridge<SetAnimationComponentBridge>('setAnimationComponent');

/** 组件挂载时登记。 */
export const provideSetAnimationComponentBridge = (api: SetAnimationComponentBridge): void =>
	bridge.provide(api);
/** 组件卸载时注销（只清理自己登记的那一份）。 */
export const resetSetAnimationComponentBridge = (api: SetAnimationComponentBridge): void =>
	bridge.reset(api);
/** schema 侧读取；窗口未挂载时返回 null（等价于原来的 `composableEls.get(...)` 空守卫）。 */
export const getSetAnimationComponentBridge = (): SetAnimationComponentBridge | null =>
	bridge.get();
