/**
 * 三个小组件的接缝（模块级强类型）：SetTileTag / SwitchBranch / Reference。
 *
 * 它们的消费方都只做「读一个值 / 写一个值 / 清空列表 / 监听窗口关闭」这几件事，
 * 所以由窗口自己实现并交出，不再把控件登记进注册表。
 */
import { createFormBridge } from './form-bridge';

export interface SetTileTagApi {
	/** 打开时把当前标签写进输入框。 */
	setTag(tag: unknown): void;
	/** 确认时读回输入框的值。 */
	getTag(): unknown;
}

export interface SwitchBranchApi {
	/** 打开时把条件列表写进控件。 */
	setConditions(conditions: unknown[]): void;
	/** 确认时读回条件列表。 */
	getConditions(): unknown[];
	/** 关闭时清空。 */
	clearConditions(): void;
}

export interface ReferenceApi {
	/** 关闭时清空引用列表。 */
	clearList(): void;
}

const setTileTagBridge = createFormBridge<SetTileTagApi>('setTileTag');
const switchBranchBridge = createFormBridge<SwitchBranchApi>('switchBranch');
const referenceBridge = createFormBridge<ReferenceApi>('reference');

export const provideSetTileTag = (api: SetTileTagApi): void => setTileTagBridge.provide(api);
export const resetSetTileTag = (api: SetTileTagApi): void => setTileTagBridge.reset(api);
export const getSetTileTag = (): SetTileTagApi | null => setTileTagBridge.get();

export const provideSwitchBranch = (api: SwitchBranchApi): void => switchBranchBridge.provide(api);
export const resetSwitchBranch = (api: SwitchBranchApi): void => switchBranchBridge.reset(api);
export const getSwitchBranch = (): SwitchBranchApi | null => switchBranchBridge.get();

export const provideReference = (api: ReferenceApi): void => referenceBridge.provide(api);
export const resetReference = (api: ReferenceApi): void => referenceBridge.reset(api);
export const getReference = (): ReferenceApi | null => referenceBridge.get();
