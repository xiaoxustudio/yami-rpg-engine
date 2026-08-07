import { defineStore } from 'pinia';
import { UI } from '@/ui/ui-window.ts';
import { shallowRef } from 'vue';

export const useUIStore = defineStore('ui', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<any>(null);
	const zoom = shallowRef<number | null>(null);
	const width = shallowRef<number | null>(null);
	const height = shallowRef<number | null>(null);

	function syncState() {
		state.value = UI?.state ?? 'closed';
		target.value = UI?.target ?? null;
		zoom.value = UI?.zoom ?? null;
		width.value = UI?.width ?? null;
		height.value = UI?.height ?? null;
	}

	function open(context: any) {
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

	function load(context: any) {
		UI?.load?.(context);
	}

	function save() {
		UI?.save?.();
	}

	function destroy(context: any) {
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

	function createPrefab(prefab: any, parent: any, x?: number, y?: number) {
		UI?.createPrefab?.(prefab, parent, x, y);
	}

	function createShortcut(item: any) {
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

	function setHover(hover: any) {
		UI?.setHover?.(hover);
	}

	function setTarget(targetValue: any) {
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

	function setControlPoint(point: any) {
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

	function updateElement(targetValue: any) {
		UI?.updateElement?.(targetValue);
	}

	function deleteElement(targetValue: any) {
		UI?.deleteElement?.(targetValue);
	}

	function switchSettings() {
		UI?.switchSettings?.();
	}

	function registerPreset(node: any) {
		UI?.registerPreset?.(node);
	}

	function unregisterPreset(node: any) {
		UI?.unregisterPreset?.(node);
	}

	function hasPrefab(node: any) {
		return UI?.hasPrefab?.(node);
	}

	function setAsPrefab(node: any) {
		UI?.setAsPrefab?.(node);
	}

	function unsetAsPrefab(node: any) {
		UI?.unsetAsPrefab?.(node);
	}

	function clearInvalidPrefabs(uiPrefabs: any[]) {
		UI?.clearInvalidPrefabs?.(uiPrefabs);
	}

	function saveToConfig(config: any) {
		UI?.saveToConfig?.(config);
	}

	function loadFromConfig(config: any) {
		UI?.loadFromConfig?.(config);
	}

	function saveToProject(project: any) {
		UI?.saveToProject?.(project);
	}

	function loadFromProject(project: any) {
		UI?.loadFromProject?.(project);
	}

	return {
		state,
		target,
		zoom,
		width,
		height,
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
