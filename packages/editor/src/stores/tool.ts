import { defineStore } from 'pinia';
import { Zoom } from '@/tools/zoom-window.ts';
import { PresetElement } from '@/tools/preset-element-window.ts';
import { PresetObject } from '@/tools/scene-preset-window.ts';
import { Color } from '@/tools/color-picker-window.ts';
import { Selection } from '@/tools/text-capture.ts';
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
		return Color?.getRGBAFromHex?.(...args);
	}

	function colorGetHexFromRGBA(...args: any[]) {
		return Color?.getHexFromRGBA?.(...args);
	}

	function colorGetCSSColorFromRGBA(...args: any[]) {
		return Color?.getCSSColorFromRGBA?.(...args);
	}

	function colorSimplifyHexColor(...args: any[]) {
		return Color?.simplifyHexColor?.(...args);
	}

	function zoomGetFactor() {
		return Zoom?.getFactor?.();
	}

	function presetObjectGetDefaultPresetId(...args: any[]) {
		return PresetObject?.getDefaultPresetId?.(...args);
	}

	function presetObjectBuildNodes(...args: any[]) {
		return PresetObject?.buildNodes?.(...args);
	}

	function presetElementGetDefaultPresetId(...args: any[]) {
		return PresetElement?.getDefaultPresetId?.(...args);
	}

	function presetElementBuildNodes(...args: any[]) {
		return PresetElement?.buildNodes?.(...args);
	}

	function selectionSaveContext() {
		Selection?.saveContext?.();
	}

	function selectionRestoreContext() {
		Selection?.restoreContext?.();
	}

	function selectionMatch() {
		return Selection?.match?.();
	}

	function selectionInsert(...args: any[]) {
		Selection?.insert?.(...args);
	}

	function selectionEdit() {
		Selection?.edit?.();
	}

	function selectionWrap(...args: any[]) {
		Selection?.wrap?.(...args);
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
