import { defineStore } from 'pinia';
import { reactive, shallowRef } from 'vue';
import { pinia } from './pinia';

/**
 * 「新建项目」窗口的表单状态（`title/new-project-window.ts` 的 `form`）。
 *
 * 原先是该模块内的模块级 `reactive`（表单）与模块级 `ref`（确认按钮启用态），只被
 * `components/tools/NewProject.vue` 与本窗口自身读写 ⇒ 升进 store 后可进 DevTools、可按 pinia 隔离。
 */
export interface NewProjectForm {
	template: string;
	folder: string;
	location: string;
}

export const useNewProjectStore = defineStore('newProject', () => {
	const form = reactive<NewProjectForm>({ template: '', folder: '', location: '' });
	/** 确认按钮启用态（`WindowFrame` 的 `confirm-disabled` 透传到 `button[name=confirm]`） */
	const confirmDisabled = shallowRef(false);

	return { form, confirmDisabled };
});

export function getNewProjectStore() {
	return useNewProjectStore(pinia);
}
