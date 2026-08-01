import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const useInspectorStore = defineStore('inspector', () => {
	const inspector = shallowRef<any>((window as any).Inspector ?? null);

	const fileActorTarget = shallowRef<any>(null);
	const fileActorMeta = shallowRef<any>(null);

	function getInspector() {
		return (window as any).Inspector;
	}

	function openFileActor(target: any, meta: any) {
		fileActorTarget.value = target;
		fileActorMeta.value = meta;
		(window as any).Inspector?.fileActor?.open(target, meta);
	}

	function closeFileActor() {
		(window as any).Inspector?.fileActor?.close();
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
