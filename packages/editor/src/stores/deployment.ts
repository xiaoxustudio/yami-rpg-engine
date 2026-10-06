import { defineStore } from 'pinia';
import { reactive, shallowRef } from 'vue';
import { pinia } from './pinia';

/**
 * 「部署项目」窗口的表单状态（`title/deploy-project-window.ts` 的 `form` / `DeploymentForm`）。
 *
 * 原先是该模块内的模块级 `reactive` + 模块级 `ref`；除本窗口自身外，
 * `components/tools/Deployment.vue`、`services/ipc/webserver.ts:83`（`DeploymentForm.platform = 'web'`）
 * 与 `components/__tests__/window-confirm-disabled.spec.ts` 都在就地改它 ⇒ 升进 store。
 */
export interface DeploymentForm {
	platform: string;
	folder: string;
	location: string;
}

export const useDeploymentStore = defineStore('deployment', () => {
	const form = reactive<DeploymentForm>({
		platform: 'windows-x64',
		folder: '',
		location: ''
	});
	/** 确认按钮启用态（同上：`WindowFrame` 的 `confirm-disabled` 透传） */
	const confirmDisabled = shallowRef(false);

	return { form, confirmDisabled };
});

export function getDeploymentStore() {
	return useDeploymentStore(pinia);
}
