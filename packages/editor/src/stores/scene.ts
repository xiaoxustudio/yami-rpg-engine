import { defineStore } from 'pinia';
import { Scene } from '@/scene/scene-window.ts';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

export const sceneStateKeys = [
	'state',
	'target',
	'mode',
	'tilemap',
	'layer',
	'showGrid',
	'zoom',
	'scaleX',
	'scaleY'
] as const;

export const useSceneStore = defineStore('scene', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<any>(null);
	const mode = shallowRef<string | null>(null);
	const tilemap = shallowRef<unknown>(null);
	const layer = shallowRef<string | null>(null);
	const showGrid = shallowRef<boolean>(false);
	const zoom = shallowRef<number | null>(null);
	const scaleX = shallowRef<number | null>(null);
	const scaleY = shallowRef<number | null>(null);

	function open(target: unknown) {
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

	function load(context: unknown) {
		Scene?.load?.(context);
	}

	function save() {
		Scene?.save?.();
	}

	function destroy(context: unknown) {
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
		mode,
		tilemap,
		layer,
		showGrid,
		zoom,
		scaleX,
		scaleY,
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

export function getSceneStore() {
	return useSceneStore(pinia);
}
