/**
 * 对象属性窗口（ObjectAttribute）交给 `tools/property-list.ts` 的桥。
 *
 * 单例要：给 key 灌候选、给 enum 灌候选、给 boolean 灌候选，并按「类型」联动显隐四行。
 * 以前全按 id 从 `objectAttributeEls` 取；现在窗口按**逻辑名**交出。
 */
import { createFormBridge } from './form-bridge';
import type { ControlApi } from './control-refs';

export type ObjectAttributeKey = 'key' | 'boolean' | 'number' | 'string' | 'enum';

export interface ObjectAttributeApi {
	/** 取控件（未挂载时 null）。 */
	control(name: ObjectAttributeKey): ControlApi | null;
	/** 取若干行的根元素（单例自己的 typeBox 用 `relate` 时需要 DOM）。 */
	elementsOf(names: ObjectAttributeKey[]): HTMLElement[];
}

const bridge = createFormBridge<ObjectAttributeApi>('objectAttribute');

export const provideObjectAttribute = (api: ObjectAttributeApi): void => bridge.provide(api);
export const resetObjectAttribute = (api: ObjectAttributeApi): void => bridge.reset(api);
export const getObjectAttribute = (): ObjectAttributeApi | null => bridge.get();
