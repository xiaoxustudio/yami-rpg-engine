import { defineStore } from 'pinia';
import { UI } from '@/ui/ui-window.ts';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

export const uiStateKeys = ['state', 'target', 'zoom', 'width', 'height', 'mode'] as const;

interface UINodeShape {
	class: string;
	children: UINodeShape[];
	[key: string]: any;
}

interface UIContextShape {
	meta: { guid: string; path: string };
	ui?: { width: number; height: number; nodes: UINodeShape[] } & Record<string, unknown>;
	editor?: {
		target: UINodeShape | null;
		root: UINodeShape | null;
		history: History;
		centerX: number;
		centerY: number;
	} & Record<string, unknown>;
	fontChanged?: boolean;
	languageChanged?: boolean;
	scalingChanged?: boolean;
	[key: string]: unknown;
}

interface UIPrefabShape {
	name: string;
	presetId: string;
	transform: { x: number; y: number; [key: string]: unknown };
	[key: string]: unknown;
}

interface UIControlPoint {
	x: number;
	y: number;
	angle: number;
}

export const useUIStore = defineStore('ui', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<UINodeShape | null>(null);
	const zoom = shallowRef<number | null>(null);
	const width = shallowRef<number | null>(null);
	const height = shallowRef<number | null>(null);
	const mode = shallowRef<string | null>(null);

	function open(context: UIContextShape) {
		UI?.open?.(context);
	}

	function close() {
		UI?.close?.();
	}

	function planToSave() {
		UI?.planToSave?.();
	}

	function requestRendering() {
		UI?.requestRendering?.();
	}

	function load(context: UIContextShape) {
		UI?.load?.(context);
	}

	function save() {
		UI?.save?.();
	}

	function destroy(context: UIContextShape) {
		UI?.destroy?.(context);
	}

	function copy() {
		UI?.copy?.();
	}

	function paste(x?: number, y?: number) {
		UI?.paste?.(x, y);
	}

	function duplicate() {
		UI?.duplicate?.();
	}

	function create(kind: string, x: number, y: number) {
		UI?.create?.(kind, x, y);
	}

	function createPrefab(
		prefab: UIPrefabShape,
		parent: UINodeShape | null,
		x?: number,
		y?: number
	) {
		UI?.createPrefab?.(prefab, parent, x, y);
	}

	function createShortcut(item: UINodeShape) {
		UI?.createShortcut?.(item);
	}

	function delete_() {
		UI?.delete?.();
	}

	function toggle() {
		UI?.toggle?.();
	}

	function undo() {
		UI?.undo?.();
	}

	function redo() {
		UI?.redo?.();
	}

	function setZoom(zoomValue: number) {
		UI?.setZoom?.(zoomValue);
	}

	function setSize(w: number, h: number) {
		UI?.setSize?.(w, h);
	}

	function setHover(hover: UINodeShape | null) {
		UI?.setHover?.(hover);
	}

	function setTarget(targetValue: UINodeShape | null) {
		UI?.setTarget?.(targetValue);
	}

	function revealTarget() {
		UI?.revealTarget?.();
	}

	function shiftAnchor(anchorX: number, anchorY: number) {
		UI?.shiftAnchor?.(anchorX, anchorY);
	}

	function shiftTarget(x: number, y: number) {
		UI?.shiftTarget?.(x, y);
	}

	function resizeTarget(width?: number, height?: number) {
		UI?.resizeTarget?.(width, height);
	}

	function rotateTarget(rotation: number) {
		UI?.rotateTarget?.(rotation);
	}

	function setControlPoint(point: UIControlPoint | null) {
		UI?.setControlPoint?.(point);
	}

	function updateHover() {
		UI?.updateHover?.();
	}

	function updateTarget() {
		UI?.updateTarget?.();
	}

	function updateElementFont() {
		UI?.updateElementFont?.();
	}

	function updateElementLanguage() {
		UI?.updateElementLanguage?.();
	}

	function updateElementTextScaling() {
		UI?.updateElementTextScaling?.();
	}

	function updateIndexedColor(index: number) {
		UI?.updateIndexedColor?.(index);
	}

	function updateAllTexts() {
		UI?.updateAllTexts?.();
	}

	function updateAllPrinters() {
		UI?.updateAllPrinters?.();
	}

	function updateElement(targetValue: UINodeShape) {
		UI?.updateElement?.(targetValue);
	}

	function deleteElement(targetValue: UINodeShape) {
		UI?.deleteElement?.(targetValue);
	}

	function switchSettings() {
		UI?.switchSettings?.();
	}

	function registerPreset(node: UINodeShape) {
		UI?.registerPreset?.(node);
	}

	function unregisterPreset(node: UINodeShape) {
		UI?.unregisterPreset?.(node);
	}

	function hasPrefab(node: UINodeShape) {
		return UI?.hasPrefab?.(node);
	}

	function setAsPrefab(node: UINodeShape) {
		UI?.setAsPrefab?.(node);
	}

	function unsetAsPrefab(node: UINodeShape) {
		UI?.unsetAsPrefab?.(node);
	}

	function clearInvalidPrefabs(uiPrefabs: string[]) {
		UI?.clearInvalidPrefabs?.(uiPrefabs);
	}

	function saveToConfig(config: { colors: Record<string, unknown> }) {
		UI?.saveToConfig?.(config);
	}

	function loadFromConfig(config: { colors: Record<string, unknown> }) {
		UI?.loadFromConfig?.(config);
	}

	function saveToProject(project: { ui: { zoom?: number }; uiPrefabs?: string[] }) {
		UI?.saveToProject?.(project);
	}

	function loadFromProject(project: { ui: { zoom: number } }) {
		UI?.loadFromProject?.(project);
	}

	return {
		state,
		target,
		zoom,
		width,
		height,
		mode,
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
		createPrefab,
		createShortcut,
		delete: delete_,
		toggle,
		undo,
		redo,
		setZoom,
		setSize,
		setHover,
		setTarget,
		revealTarget,
		shiftAnchor,
		shiftTarget,
		resizeTarget,
		rotateTarget,
		setControlPoint,
		updateHover,
		updateTarget,
		updateElementFont,
		updateElementLanguage,
		updateElementTextScaling,
		updateIndexedColor,
		updateAllTexts,
		updateAllPrinters,
		updateElement,
		deleteElement,
		switchSettings,
		registerPreset,
		unregisterPreset,
		hasPrefab,
		setAsPrefab,
		unsetAsPrefab,
		clearInvalidPrefabs,
		saveToConfig,
		loadFromConfig,
		saveToProject,
		loadFromProject
	};
});

export function getUIStore() {
	return useUIStore(pinia);
}
