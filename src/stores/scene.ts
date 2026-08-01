import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const useSceneStore = defineStore('scene', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<any>(null);

	function syncState() {
		const Scene = (window as any).Scene;
		state.value = Scene?.state ?? 'closed';
		target.value = Scene?.target ?? null;
	}

	function open(target: any) {
		(window as any).Scene?.open?.(target);
	}

	function close() {
		(window as any).Scene?.close?.();
	}

	function planToSave() {
		(window as any).Scene?.planToSave?.();
	}

	function requestRendering() {
		(window as any).Scene?.requestRendering?.();
	}

	function load(context: any) {
		(window as any).Scene?.load?.(context);
	}

	function save() {
		(window as any).Scene?.save?.();
	}

	function destroy(context: any) {
		(window as any).Scene?.destroy?.(context);
	}

	function copy() {
		(window as any).Scene?.copy?.();
	}

	function paste(x: number, y: number) {
		(window as any).Scene?.paste?.(x, y);
	}

	function duplicate() {
		(window as any).Scene?.duplicate?.();
	}

	function create(kind: string, x: number, y: number) {
		(window as any).Scene?.create?.(kind, x, y);
	}

	function delete_() {
		(window as any).Scene?.delete?.();
	}

	function toggle() {
		(window as any).Scene?.toggle?.();
	}

	function undo() {
		(window as any).Scene?.undo?.();
	}

	function redo() {
		(window as any).Scene?.redo?.();
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
