/**
 * changeActorEquipment 窗口的**控件级能力桥**（模块级强类型）。
 *
 * schema 载入表单时要给 `slot` 下拉灌候选项。旧做法是按 id 从 `composableEls` 取元素再调
 * `loadItems`；窗口迁成模板 ref 后控件不再进注册表，而 `loadItems` 是控件级能力，
 * 所以由窗口实现、经这条模块桥交给 schema —— schema 不再知道任何控件 id。
 *
 * 实现收口在 `composables/form-bridge.ts`（同一把 id 只留一份当前实例，卸载即注销）。
 */
import { createFormBridge } from './form-bridge';

export interface ChangeActorEquipmentBridge {
	/** 灌入装备槽候选项。 */
	loadItems(slotItems: unknown[]): void;
}

const bridge = createFormBridge<ChangeActorEquipmentBridge>('changeActorEquipment');

/** 组件挂载时登记。 */
export const provideChangeActorEquipmentBridge = (api: ChangeActorEquipmentBridge): void =>
	bridge.provide(api);
/** 组件卸载时注销（只清理自己登记的那一份）。 */
export const resetChangeActorEquipmentBridge = (api: ChangeActorEquipmentBridge): void =>
	bridge.reset(api);
/** schema 侧读取；窗口未挂载时返回 null（等价于原来的 `composableEls.get(...)` 空守卫）。 */
export const getChangeActorEquipmentBridge = (): ChangeActorEquipmentBridge | null => bridge.get();
