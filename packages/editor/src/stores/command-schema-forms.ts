import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { pinia } from './pinia';
import type { ForEachForm } from '@app/composables/commands/useForEachCommandSchema';
import type { IfForm } from '@app/composables/commands/useIfCommandSchema';
import type { RegisterEventData } from '@app/composables/commands/useRegisterEventCommandSchema';
import type { ShowChoicesForm } from '@app/composables/commands/useShowChoicesCommandSchema';
import type { SwitchForm } from '@app/composables/commands/useSwitchCommandSchema';

/**
 * **命令 schema 窗口**里带具名类型的表单状态真源（`composables/commands/use*CommandSchema.ts`）。
 *
 * 与 `stores/command-forms.ts` 的分工：那边是「命令工具弹窗」的表单（index/keyValue/switch/objectProperty），
 * 这里是命令 schema 自带窗口的表单（for-each / if / register-event / show-choices / switch）。
 * 两者都属于命令域、体量都小，后续如要合并成一个 store 随时可并（这里先按来源分开，避免一次改动过大）。
 *
 * 各表单原先都是所在 schema 文件的模块级 `reactive`，只被该窗口模板的 v-model 与同文件
 * `customLoad`（`Object.assign(form, …)`）/`customSave`（`const data = form`）读写。
 *
 * ⚠️ 刻意**不含** `reactive<Record<string, unknown>>` 那类动态表单（cast-skill / change-actor-equipment /
 * get-actor / get-target / set-boolean / set-inventory / transition）：它们的键是动态的，逐字段访问器
 * 覆盖不全，必须保留对象语义，迁移方式要单独定。
 */
export const useCommandSchemaFormsStore = defineStore('commandSchemaForms', () => {
	const forEachForm = reactive<ForEachForm>({
		data: 'list',
		list: { type: 'local', key: '' },
		actor: { type: 'trigger' },
		element: { type: 'trigger' },
		attributeGroupId: '',
		enumGroupId: '',
		variable: { type: 'local', key: '' },
		saveIndex: { type: 'local', key: '' },
		touchId: { type: 'local', key: '' }
	});

	const ifForm = reactive<IfForm>({
		else: false
	});

	const registerEventData = reactive<RegisterEventData>({
		target: 'global',
		actor: { type: 'trigger' },
		element: { type: 'trigger' },
		operation: 'register',
		type: 'autorun',
		priority: false,
		tag: '',
		namespace: false
	});

	const showChoicesForm = reactive<ShowChoicesForm>({
		parameters: ''
	});

	const switchForm = reactive<SwitchForm>({
		variable: { type: 'local', key: '' },
		default: false
	});

	return {
		forEachForm,
		ifForm,
		registerEventData,
		showChoicesForm,
		switchForm
	};
});

export function getCommandSchemaFormsStore() {
	return useCommandSchemaFormsStore(pinia);
}
