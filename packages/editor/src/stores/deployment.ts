import { defineStore } from 'pinia';
import { reactive, shallowRef } from 'vue';
import { pinia } from './pinia';

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
	const confirmDisabled = shallowRef(false);

	return { form, confirmDisabled };
});

export function getDeploymentStore() {
	return useDeploymentStore(pinia);
}
