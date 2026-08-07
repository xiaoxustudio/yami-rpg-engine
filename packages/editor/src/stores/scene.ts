import { defineStore } from 'pinia';
import { Scene } from '@/scene/scene-window.ts';
import { shallowRef } from 'vue';

export const useSceneStore = defineStore('scene', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<any>(null);

	function syncState() {
		state.value = Scene?.state ?? 'closed';
		target.value = Scene?.target ?? null;
	}

	function open(target: any) {
		Scene?.open?.(target);
	}

	function close() {
		Scene?.close?.();
	}

	function planToSave() {
		Scene?.planToSave?.();
	}

	function requestRendering() {
		Scene?.requestRendering?.();
	}

	function load(context: any) {
		Scene?.load?.(context);
	}

	function save() {
		Scene?.save?.();
	}

	function destroy(context: any) {
		Scene?.destroy?.(context);
	}

	function copy() {
		Scene?.copy?.();
	}

	function paste(x: number, y: number) {
		Scene?.paste?.(x, y);
	}

	function duplicate() {
		Scene?.duplicate?.();
	}

	function create(kind: string, x: number, y: number) {
		Scene?.create?.(kind, x, y);
	}

	function delete_() {
		Scene?.delete?.();
	}

	function toggle() {
		Scene?.toggle?.();
	}

	function undo() {
		Scene?.undo?.();
	}

	function redo() {
		Scene?.redo?.();
	}

	return {
		state,
		target,
		syncState,
		open,
		close,
		planToSave,
		requestRendering,
		load,
		save,
		destroy,
		copy,
		paste,
		duplicate,
		create,
		delete: delete_,
		toggle,
		undo,
		redo
	};
});
