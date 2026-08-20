import { defineStore } from 'pinia';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

export const useInspectorStore = defineStore('inspector', () => {
	const inspector = shallowRef<any>(Inspector ?? null);

	const fileActorTarget = shallowRef<any>(null);
	const fileActorMeta = shallowRef<any>(null);

	function getInspector() {
		return Inspector;
	}

	function getEditor(type: string) {
		return Inspector?.[type] ?? null;
	}

	function getMeta() {
		return Inspector?.meta ?? null;
	}

	function open(type: string, target: unknown, meta?: unknown) {
		Inspector?.open?.(type, target, meta);
	}

	function close(type?: string) {
		Inspector?.close?.(type);
	}

	function update(type: string, target: unknown, key: string, value: unknown) {
		Inspector?.[type]?.update?.(target, key, value);
	}

	function create(type: string, arg?: unknown) {
		return Inspector?.[type]?.create?.(arg);
	}

	function getKey(element: { key?: string; id: string }) {
		return Inspector?.getKey?.(element);
	}

	function play(type: string) {
		Inspector?.[type]?.play?.();
	}

	function openFileActor(target: unknown, meta: unknown) {
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
		getEditor,
		getMeta,
		open,
		close,
		update,
		create,
		getKey,
		play,
		openFileActor,
		closeFileActor,
		syncState: getInspector
	};
});

export function getInspectorStore() {
	return useInspectorStore(pinia);
}
