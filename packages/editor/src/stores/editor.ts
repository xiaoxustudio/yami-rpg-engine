import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

type EditorState = 'closed' | 'open';

export const useEditorStore = defineStore('editor', () => {
	const config = shallowRef<any>(null);
	const project = shallowRef<any>(null);
	const state = shallowRef<EditorState>('closed');

	function setConfig(value: any) {
		config.value = value;
		if (value?.project !== undefined) {
			project.value = value.project;
		}
	}

	function setProject(value: any) {
		project.value = value;
	}

	function setState(value: EditorState) {
		state.value = value;
	}

	return { config, project, state, setConfig, setProject, setState };
});

export function getEditorStore() {
	return useEditorStore(pinia);
}
