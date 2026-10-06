import { defineStore } from 'pinia';
import { getLazyWindow, loadWindow } from '@app/tools/window-registry';
import type { SceneContextShape } from '@app/scene/scene-window.ts';
import { shallowRef } from 'vue';
import { pinia } from './pinia';
import type { EditorConfigShape, EditorProjectShape } from './editor';

const loadScene = () =>
	import('@app/tools/window-cluster').then(async (m) => {
		await m.clusterReady;
		return m.Scene;
	});
const Scene = getLazyWindow('scene', loadScene);

export const sceneStateKeys = [
	'state',
	'target',
	'mode',
	'tilemap',
	'layer',
	'showGrid',
	'zoom',
	'scaleX',
	'scaleY',
	// 本批从单例升为 store 为源（分析文档 P1 #9）。都是 UI 标志/当前工具状态：
	// 无每帧读写（`activeTilemapId` 由 computeActiveTilemapId 在目标/动画切换时才写）
	'brush',
	'symbol',
	'showLight',
	'showAnimation',
	'activeTilemapId'
] as const;

export const useSceneStore = defineStore('scene', () => {
	const state = shallowRef<string>('closed');
	// oxlint-disable-next-line no-explicit-any
	const target = shallowRef<any>(null);
	const mode = shallowRef<string | null>(null);
	const tilemap = shallowRef<unknown>(null);
	const layer = shallowRef<string | null>(null);
	const showGrid = shallowRef<boolean>(false);
	const zoom = shallowRef<number | null>(null);
	const scaleX = shallowRef<number | null>(null);
	const scaleY = shallowRef<number | null>(null);
	/** 当前笔刷（`palette-engine.ts:634` 判 `=== 'eraser'`）/ 当前符号 / 显示灯光·动画开关 / 背景序号 */
	const brush = shallowRef<string | null>(null);
	const symbol = shallowRef<unknown>(null);
	const showLight = shallowRef<boolean>(false);
	const showAnimation = shallowRef<boolean>(false);
	const activeTilemapId = shallowRef<number | null>(null);

	const initialized = shallowRef(false);

	function initialize() {
		if (initialized.value) return;
		void loadWindow('scene', loadScene).then((s) => s?.initialize?.());
		initialized.value = true;
	}

	function open(target: SceneContextShape) {
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

	function load(context: SceneContextShape) {
		Scene?.load?.(context);
	}

	function save() {
		Scene?.save?.();
	}

	function destroy(context: SceneContextShape) {
		Scene?.destroy?.(context);
	}

	function copy() {
		Scene?.copy?.();
	}

	function paste(x?: number, y?: number) {
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

	function saveToConfig(config: EditorConfigShape) {
		Scene?.saveToConfig?.(config);
	}

	function loadFromConfig(config: EditorConfigShape) {
		Scene?.loadFromConfig?.(config);
	}

	function saveToProject(project: EditorProjectShape) {
		Scene?.saveToProject?.(project);
	}

	function loadFromProject(project: EditorProjectShape) {
		Scene?.loadFromProject?.(project);
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
		brush,
		symbol,
		showLight,
		showAnimation,
		activeTilemapId,
		initialized,
		initialize,
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
		redo,
		saveToConfig,
		loadFromConfig,
		saveToProject,
		loadFromProject
	};
});

export function getSceneStore() {
	return useSceneStore(pinia);
}
