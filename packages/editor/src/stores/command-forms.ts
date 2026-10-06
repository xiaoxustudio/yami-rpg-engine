import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { pinia } from './pinia';

/**
 * 小型「命令工具弹窗」的表单状态。
 *
 * 这三份表单原先各自是本模块内的模块级 `reactive`（`useGetObjectPropertyCommandSchema:16`、
 * `useRequestURLCommandSchema:19`、`useSwitchConditionSchema:61`），并被对应 SFC 直接 import
 * 做 `v-model` 绑定。升进 store 后：进 DevTools、可按 pinia 实例隔离，且不再靠模块导入顺序共享。
 *
 * 之所以合成一个文件而不是三个 store：三者都是「一个窗口 → 一份小表单」，状态量各自 ≤ 8 个字段，
 * 拆三个文件只会增加样板（`pinia`/`getXStore` 三份）。域边界仍由切片名表达。
 */

export type RequestKeyValueForm = {
	key: string | { key: string };
	value: string | { key: string };
};

export type SwitchConditionType =
	| 'none'
	| 'boolean'
	| 'number'
	| 'string'
	| 'attribute'
	| 'enum'
	| 'keyboard'
	| 'gamepad'
	| 'mouse'
	| 'variable';

export interface SwitchConditionForm {
	type: SwitchConditionType;
	booleanValue: boolean;
	numberValue: number;
	stringValue: string;
	attributeId: string;
	stringId: string;
	mouseButton: number;
	variable: { type: string; key: string };
}

/** `set-object-property` 窗口的表单（原 `useGetObjectPropertyCommandSchema.ts:97` 的 `setForm`） */
export interface SetObjectPropertyForm {
	variable: { type: string; key: string };
	valueVariable: { type: string; key: string };
	list?: Array<{ text: string }>;
}

export const useCommandFormsStore = defineStore('commandForms', () => {
	/** `ObjectPropertyIndex.vue` 的索引名（`get-object-index` 指令） */
	const indexForm = reactive<{ name: string }>({ name: '' });

	/** `RequestKeyValue.vue` 的 key/value（`request-url` 指令） */
	const requestKeyValueForm = reactive<RequestKeyValueForm>({ key: '', value: '' });

	/** `SwitchCondition.vue` 的条件表单（`switch` 分支/条件） */
	const switchConditionForm = reactive<SwitchConditionForm>({
		type: 'number',
		booleanValue: false,
		numberValue: 0,
		stringValue: '',
		attributeId: '',
		stringId: '',
		mouseButton: 0,
		variable: { type: 'local', key: '' }
	});

	/** `set-object-property` 窗口表单（原 `useGetObjectPropertyCommandSchema.ts:97` 的 `setForm`） */
	const objectPropertyForm = reactive<SetObjectPropertyForm>({
		variable: { type: 'local', key: '' },
		valueVariable: { type: 'local', key: '' }
	});

	return { indexForm, requestKeyValueForm, switchConditionForm, objectPropertyForm };
});

export function getCommandFormsStore() {
	return useCommandFormsStore(pinia);
}
