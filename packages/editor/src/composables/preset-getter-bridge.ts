/**
 * lightGetter / objectGetter 两个属性取值窗口的表单桥（模块级强类型）。
 *
 * 这两个窗口由同一个共享助手 `usePresetGetterWindow` 驱动（按 `domKey` 区分），
 * 所以桥也按 `domKey` 建一张表：窗口组件 `provide`，助手按同一把 key `get`。
 * 实现收口在 `composables/form-bridge.ts`。
 */
import type { PresetGetterForm } from './usePresetGetterWindow';
import { createFormBridge } from './form-bridge';

export interface PresetGetterBridge {
	setForm(data: Partial<PresetGetterForm>): void;
	getForm(): PresetGetterForm;
}

const bridges = {
	lightGetter: createFormBridge<PresetGetterForm>('lightGetter'),
	objectGetter: createFormBridge<PresetGetterForm>('objectGetter')
};

export type PresetGetterDomKey = keyof typeof bridges;

/** 按窗口 id 取桥；未登记的 id 返回 undefined（调用方按"窗口未挂载"处理）。 */
export function presetGetterBridge(key: string) {
	return bridges[key as PresetGetterDomKey] as (typeof bridges)[PresetGetterDomKey] | undefined;
}
