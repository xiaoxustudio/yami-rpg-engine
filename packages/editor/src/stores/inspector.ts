import { defineStore } from 'pinia';
import { Inspector } from '@/inspector/inspector.ts';
import { shallowRef } from 'vue';

export const useInspectorStore = defineStore('inspector', () => {
	const inspector = shallowRef<any>(Inspector ?? null);

	const fileActorTarget = shallowRef<any>(null);
	const fileActorMeta = shallowRef<any>(null);

	function getInspector() {
		return Inspector;
	}

	function openFileActor(target: any, meta: any) {
		fileActorTarget.value = target;
		fileActorMeta.value = meta;
		Inspector?.fileActor?.open(target, meta);
	}

	function closeFileActor() {
		Inspector?.fileActor?.close();
		fileActorTarget.value = null;
		fileActorMeta.value = null;
	}

	return {
		inspector,
		fileActorTarget,
		fileActorMeta,
		getInspector,
		openFileActor,
		closeFileActor,
		syncState: getInspector
	};
});
