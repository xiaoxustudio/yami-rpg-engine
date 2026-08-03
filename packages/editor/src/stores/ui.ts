import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const useUIStore = defineStore('ui', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<any>(null);
	const zoom = shallowRef<number | null>(null);
	const width = shallowRef<number | null>(null);
	const height = shallowRef<number | null>(null);

	function syncState() {
		const UI = (window as any).UI;
		state.value = UI?.state ?? 'closed';
		target.value = UI?.target ?? null;
		zoom.value = UI?.zoom ?? null;
		width.value = UI?.width ?? null;
		height.value = UI?.height ?? null;
	}

	function open(context: any) {
		(window as any).UI?.open?.(context);
	}

	function close() {
		(window as any).UI?.close?.();
	}

	function planToSave() {
		(window as any).UI?.planToSave?.();
	}

	function requestRendering() {
		(window as any).UI?.requestRendering?.();
	}

	function load(context: any) {
		(window as any).UI?.load?.(context);
	}

	function save() {
		(window as any).UI?.save?.();
	}

	function destroy(context: any) {
		(window as any).UI?.destroy?.(context);
	}

	function copy() {
		(window as any).UI?.copy?.();
	}

	function paste(x?: number, y?: number) {
		(window as any).UI?.paste?.(x, y);
	}

	function duplicate() {
		(window as any).UI?.duplicate?.();
	}

	function create(kind: string, x: number, y: number) {
		(window as any).UI?.create?.(kind, x, y);
	}

	function createPrefab(prefab: any, parent: any, x?: number, y?: number) {
		(window as any).UI?.createPrefab?.(prefab, parent, x, y);
	}

	function createShortcut(item: any) {
		(window as any).UI?.createShortcut?.(item);
	}

	function delete_() {
		(window as any).UI?.delete?.();
	}

	function toggle() {
		(window as any).UI?.toggle?.();
	}

	function undo() {
		(window as any).UI?.undo?.();
	}

	function redo() {
		(window as any).UI?.redo?.();
	}

	function setZoom(zoomValue: number) {
		(window as any).UI?.setZoom?.(zoomValue);
	}

	function setSize(w: number, h: number) {
		(window as any).UI?.setSize?.(w, h);
	}

	function setHover(hover: any) {
		(window as any).UI?.setHover?.(hover);
	}

	function setTarget(targetValue: any) {
		(window as any).UI?.setTarget?.(targetValue);
	}

	function revealTarget() {
		(window as any).UI?.revealTarget?.();
	}

	function shiftAnchor(anchorX: number, anchorY: number) {
		(window as any).UI?.shiftAnchor?.(anchorX, anchorY);
	}

	function shiftTarget(x: number, y: number) {
		(window as any).UI?.shiftTarget?.(x, y);
	}

	function resizeTarget(width?: number, height?: number) {
		(window as any).UI?.resizeTarget?.(width, height);
	}

	function rotateTarget(rotation: number) {
		(window as any).UI?.rotateTarget?.(rotation);
	}

	function setControlPoint(point: any) {
		(window as any).UI?.setControlPoint?.(point);
	}

	function updateHover() {
		(window as any).UI?.updateHover?.();
	}

	function updateTarget() {
		(window as any).UI?.updateTarget?.();
	}

	function updateElementFont() {
		(window as any).UI?.updateElementFont?.();
	}

	function updateElementLanguage() {
		(window as any).UI?.updateElementLanguage?.();
	}

	function updateElementTextScaling() {
		(window as any).UI?.updateElementTextScaling?.();
	}

	function updateIndexedColor(index: number) {
		(window as any).UI?.updateIndexedColor?.(index);
	}

	function updateAllTexts() {
		(window as any).UI?.updateAllTexts?.();
	}

	function updateAllPrinters() {
		(window as any).UI?.updateAllPrinters?.();
	}

	function updateElement(targetValue: any) {
		(window as any).UI?.updateElement?.(targetValue);
	}

	function deleteElement(targetValue: any) {
		(window as any).UI?.deleteElement?.(targetValue);
	}

	function switchSettings() {
		(window as any).UI?.switchSettings?.();
	}

	function registerPreset(node: any) {
		(window as any).UI?.registerPreset?.(node);
	}

	function unregisterPreset(node: any) {
		(window as any).UI?.unregisterPreset?.(node);
	}

	function hasPrefab(node: any) {
		return (window as any).UI?.hasPrefab?.(node);
	}

	function setAsPrefab(node: any) {
		(window as any).UI?.setAsPrefab?.(node);
	}

	function unsetAsPrefab(node: any) {
		(window as any).UI?.unsetAsPrefab?.(node);
	}

	function clearInvalidPrefabs(uiPrefabs: any[]) {
		(window as any).UI?.clearInvalidPrefabs?.(uiPrefabs);
	}

	function saveToConfig(config: any) {
		(window as any).UI?.saveToConfig?.(config);
	}

	function loadFromConfig(config: any) {
		(window as any).UI?.loadFromConfig?.(config);
	}

	function saveToProject(project: any) {
		(window as any).UI?.saveToProject?.(project);
	}

	function loadFromProject(project: any) {
		(window as any).UI?.loadFromProject?.(project);
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
