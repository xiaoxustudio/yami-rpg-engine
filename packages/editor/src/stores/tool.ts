import { defineStore } from 'pinia';
import { Zoom } from '@app/legacy/tools/zoom-window.ts';
import { PresetElement } from '@app/legacy/tools/preset-element-window.ts';
import { PresetObject } from '@app/legacy/tools/scene-preset-window.ts';
import { Color } from '@app/legacy/tools/color-picker-window.ts';
import { Selection } from '@app/legacy/tools/text-capture.ts';
import type { ToolInstance } from '@app/legacy/tools/tool-registry';
import { bindToolRegistry } from '@app/legacy/tools/tool-registry';
import { bindShortcutStore } from '@app/legacy/tools/shortcut-registry';
import { pinia } from './pinia';
import { shallowRef } from 'vue';

const toolRegistry = new Map<string, ToolInstance>();
const shortcuts: Record<string, (...args: unknown[]) => boolean> = {};

function registerTool(name: string, instance: ToolInstance): void {
	toolRegistry.set(name, instance);
}

function getToolInstance(name: string): ToolInstance | undefined {
	return toolRegistry.get(name);
}

function registerShortcut(id: string, handler: (...args: unknown[]) => boolean): void {
	shortcuts[id] = handler;
}

function getShortcut(id: string): ((...args: unknown[]) => boolean) | undefined {
	return shortcuts[id];
}

bindToolRegistry({ registerTool, getToolInstance });
bindShortcutStore({ registerShortcut, getShortcut });

export const useToolStore = defineStore('tool', () => {
	const activeTool = shallowRef<string | null>(null);

	function getTool(name: string) {
		return getToolInstance(name);
	}

	function openTool(name: string, ...args: unknown[]) {
		getToolInstance(name)?.open?.(...args);
		activeTool.value = name;
	}

	function closeTool(name: string) {
		getToolInstance(name)?.close?.();
		if (activeTool.value === name) {
			activeTool.value = null;
		}
	}

	function initializeTool(name: string) {
		getToolInstance(name)?.initialize?.();
	}

	function openColor(...args: unknown[]) {
		openTool('Color', ...args);
	}

	function openImageClip(...args: unknown[]) {
		openTool('ImageClip', ...args);
	}

	function openRename(...args: unknown[]) {
		openTool('Rename', ...args);
	}

	function openSetKey(...args: unknown[]) {
		openTool('SetKey', ...args);
	}

	function openSetQuantity(...args: unknown[]) {
		openTool('SetQuantity', ...args);
	}

	function openZoom(...args: unknown[]) {
		openTool('Zoom', ...args);
	}

	function openPresetObject(...args: unknown[]) {
		openTool('PresetObject', ...args);
	}

	function openPresetElement(...args: unknown[]) {
		openTool('PresetElement', ...args);
	}

	function openArrayList(...args: unknown[]) {
		openTool('ArrayList', ...args);
	}

	function openSelection(...args: unknown[]) {
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

	function colorGetRGBAFromHex(...args: unknown[]) {
		return Color?.getRGBAFromHex?.(...args);
	}

	function colorGetHexFromRGBA(...args: unknown[]) {
		return Color?.getHexFromRGBA?.(...args);
	}

	function colorGetCSSColorFromRGBA(...args: unknown[]) {
		return Color?.getCSSColorFromRGBA?.(...args);
	}

	function colorSimplifyHexColor(...args: unknown[]) {
		return Color?.simplifyHexColor?.(...args);
	}

	function zoomGetFactor() {
		return Zoom?.getFactor?.();
	}

	function presetObjectGetDefaultPresetId(className?: string) {
		return PresetObject?.getDefaultPresetId?.(className);
	}

	function presetObjectBuildNodes(
		nodes: Parameters<typeof PresetObject.buildNodes>[0],
		className: Parameters<typeof PresetObject.buildNodes>[1]
	) {
		return PresetObject?.buildNodes?.(nodes, className);
	}

	function presetElementGetDefaultPresetId() {
		return PresetElement?.getDefaultPresetId?.();
	}

	function presetElementBuildNodes(
		nodes: Parameters<NonNullable<typeof PresetElement.buildNodes>>[0]
	) {
		return PresetElement?.buildNodes?.(nodes);
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

	function selectionInsert(tag: Parameters<typeof Selection.insert>[0]) {
		Selection?.insert?.(tag);
	}

	function selectionEdit() {
		Selection?.edit?.();
	}

	function selectionWrap(params: Parameters<typeof Selection.wrap>[0]) {
		Selection?.wrap?.(params);
	}

	return {
		activeTool,
		registerTool,
		getToolInstance,
		registerShortcut,
		getShortcut,
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

export function getToolStore() {
	return useToolStore(pinia);
}
