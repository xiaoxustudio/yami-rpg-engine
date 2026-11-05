/**
 * fileActor 页 → 四个工具窗口的小桥（模块级强类型）。
 *
 * `inspector/file-actor-page.ts` 在打开这些子窗口时要给它们灌候选项（精灵 id / 快捷键 /
 * 装备槽位），库存窗口还要按「类型」联动显隐几行。旧做法全是按 id 从 `inspectorEls` 取元素；
 * 现在各自窗口实现能力、经本模块交出，单例只按窗口取 api。
 */
import { createFormBridge } from './form-bridge';

export interface FileActorSpriteApi {
	/** 换动画后重灌精灵 id 候选项。 */
	loadIds(items: unknown[]): void;
}

export interface FileActorSkillApi {
	/** 重灌快捷键候选项。 */
	loadKeys(items: unknown[]): void;
}

export interface FileActorEquipmentApi {
	/** 重灌装备槽位候选项。 */
	loadSlots(items: unknown[]): void;
}

export interface FileActorInventoryApi {
	/** 库存窗口的类型候选项 + 「类型 → 显示哪几行」的联动。 */
	setupTypeRows(): void;
}

const spriteBridge = createFormBridge<FileActorSpriteApi>('fileActorSprite');
const skillBridge = createFormBridge<FileActorSkillApi>('fileActorSkill');
const equipmentBridge = createFormBridge<FileActorEquipmentApi>('fileActorEquipment');
const inventoryBridge = createFormBridge<FileActorInventoryApi>('fileActorInventory');

export const provideFileActorSprite = (api: FileActorSpriteApi): void => spriteBridge.provide(api);
export const resetFileActorSprite = (api: FileActorSpriteApi): void => spriteBridge.reset(api);
export const getFileActorSprite = (): FileActorSpriteApi | null => spriteBridge.get();

export const provideFileActorSkill = (api: FileActorSkillApi): void => skillBridge.provide(api);
export const resetFileActorSkill = (api: FileActorSkillApi): void => skillBridge.reset(api);
export const getFileActorSkill = (): FileActorSkillApi | null => skillBridge.get();

export const provideFileActorEquipment = (api: FileActorEquipmentApi): void =>
	equipmentBridge.provide(api);
export const resetFileActorEquipment = (api: FileActorEquipmentApi): void =>
	equipmentBridge.reset(api);
export const getFileActorEquipment = (): FileActorEquipmentApi | null => equipmentBridge.get();

export const provideFileActorInventory = (api: FileActorInventoryApi): void =>
	inventoryBridge.provide(api);
export const resetFileActorInventory = (api: FileActorInventoryApi): void =>
	inventoryBridge.reset(api);
export const getFileActorInventory = (): FileActorInventoryApi | null => inventoryBridge.get();
