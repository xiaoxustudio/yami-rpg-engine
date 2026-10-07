import { defineStore } from 'pinia';
import { reactive, shallowRef } from 'vue';
import { pinia } from './pinia';

export interface NewProjectForm {
	template: string;
	folder: string;
	location: string;
}

export const useNewProjectStore = defineStore('newProject', () => {
	const form = reactive<NewProjectForm>({ template: '', folder: '', location: '' });
	const confirmDisabled = shallowRef(false);

	return { form, confirmDisabled };
});

export function getNewProjectStore() {
	return useNewProjectStore(pinia);
}
