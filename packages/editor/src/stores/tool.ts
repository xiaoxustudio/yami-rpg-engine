import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const useToolStore = defineStore('tool', () => {
	const activeTool = shallowRef<string | null>(null);

	function getTool(name: string) {
		return (window as any)[name];
	}

	function openTool(name: string, ...args: any[]) {
		const tool = (window as any)[name];
		tool?.open?.(...args);
		activeTool.value = name;
	}

	function closeTool(name: string) {
		const tool = (window as any)[name];
		tool?.close?.();
		if (activeTool.value === name) {
			activeTool.value = null;
		}
	}

	function initializeTool(name: string) {
		(window as any)[name]?.initialize?.();
	}

	function openColor(...args: any[]) {
		openTool('Color', ...args);
	}

	function openImageClip(...args: any[]) {
		openTool('ImageClip', ...args);
	}

	function openRename(...args: any[]) {
		openTool('Rename', ...args);
	}

	function openSetKey(...args: any[]) {
		openTool('SetKey', ...args);
	}

	function openSetQuantity(...args: any[]) {
		openTool('SetQuantity', ...args);
	}

	function openZoom(...args: any[]) {
		openTool('Zoom', ...args);
	}

	function openPresetObject(...args: any[]) {
		openTool('PresetObject', ...args);
	}

	function openPresetElement(...args: any[]) {
		openTool('PresetElement', ...args);
	}

	function openArrayList(...args: any[]) {
		openTool('ArrayList', ...args);
	}

	function openSelection(...args: any[]) {
		openTool('Selection', ...args);
	}

	function initializeColor() {
		initializeTool('Color');
	}

	function initializeImageClip() {
		initializeTool('ImageClip');
	}

	function initializeRename() {
		initializeTool('Rename');
	}

	function initializeSetKey() {
		initializeTool('SetKey');
	}

	function initializeSetQuantity() {
		initializeTool('SetQuantity');
	}

	function initializeZoom() {
		initializeTool('Zoom');
	}

	function initializePresetObject() {
		initializeTool('PresetObject');
	}

	function initializePresetElement() {
		initializeTool('PresetElement');
	}

	function initializeArrayList() {
		initializeTool('ArrayList');
	}

	function initializeSelection() {
		initializeTool('Selection');
	}

	function colorGetRGBAFromHex(...args: any[]) {
		return (window as any).Color?.getRGBAFromHex?.(...args);
	}

	function colorGetHexFromRGBA(...args: any[]) {
		return (window as any).Color?.getHexFromRGBA?.(...args);
	}

	function colorGetCSSColorFromRGBA(...args: any[]) {
		return (window as any).Color?.getCSSColorFromRGBA?.(...args);
	}

	function colorSimplifyHexColor(...args: any[]) {
		return (window as any).Color?.simplifyHexColor?.(...args);
	}

	function zoomGetFactor() {
		return (window as any).Zoom?.getFactor?.();
	}

	function presetObjectGetDefaultPresetId(...args: any[]) {
		return (window as any).PresetObject?.getDefaultPresetId?.(...args);
	}

	function presetObjectBuildNodes(...args: any[]) {
		return (window as any).PresetObject?.buildNodes?.(...args);
	}

	function presetElementGetDefaultPresetId(...args: any[]) {
		return (window as any).PresetElement?.getDefaultPresetId?.(...args);
	}

	function presetElementBuildNodes(...args: any[]) {
		return (window as any).PresetElement?.buildNodes?.(...args);
	}

	function selectionSaveContext() {
		(window as any).Selection?.saveContext?.();
	}

	function selectionRestoreContext() {
		(window as any).Selection?.restoreContext?.();
	}

	function selectionMatch() {
		return (window as any).Selection?.match?.();
	}

	function selectionInsert(...args: any[]) {
		(window as any).Selection?.insert?.(...args);
	}

	function selectionEdit() {
		(window as any).Selection?.edit?.();
	}

	function selectionWrap(...args: any[]) {
		(window as any).Selection?.wrap?.(...args);
	}

	return {
		activeTool,
		getTool,
		openTool,
		closeTool,
		initializeTool,
		openColor,
		openImageClip,
		openRename,
		openSetKey,
		openSetQuantity,
		openZoom,
		openPresetObject,
		openPresetElement,
		openArrayList,
		openSelection,
		initializeColor,
		initializeImageClip,
		initializeRename,
		initializeSetKey,
		initializeSetQuantity,
		initializeZoom,
		initializePresetObject,
		initializePresetElement,
		initializeArrayList,
		initializeSelection,
		colorGetRGBAFromHex,
		colorGetHexFromRGBA,
		colorGetCSSColorFromRGBA,
		colorSimplifyHexColor,
		zoomGetFactor,
		presetObjectGetDefaultPresetId,
		presetObjectBuildNodes,
		presetElementGetDefaultPresetId,
		presetElementBuildNodes,
		selectionSaveContext,
		selectionRestoreContext,
		selectionMatch,
		selectionInsert,
		selectionEdit,
		selectionWrap
	};
});
