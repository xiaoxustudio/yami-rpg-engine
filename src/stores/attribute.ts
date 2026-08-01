import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const useAttributeStore = defineStore('attribute', () => {
	const state = shallowRef<string>('closed');
	const attributes = shallowRef<any[]>([]);

	function syncState() {
		const Attribute = (window as any).Attribute;
		state.value = Attribute?.state ?? 'closed';
		attributes.value = Attribute?.attributes ?? [];
	}

	function initialize() {
		(window as any).Attribute?.initialize?.();
	}

	function open(target?: any, mode?: string) {
		(window as any).Attribute?.open?.(target, mode);
	}

	function close() {
		(window as any).Attribute?.close?.();
	}

	function undo() {
		(window as any).Attribute?.undo?.();
	}

	function redo() {
		(window as any).Attribute?.redo?.();
	}

	function createId() {
		return (window as any).Attribute?.createId?.();
	}

	function register(item: any) {
		(window as any).Attribute?.register?.(item);
	}

	function unregister(item: any) {
		(window as any).Attribute?.unregister?.(item);
	}

	function setFolderGroup(folder: any, newGroup: any) {
		(window as any).Attribute?.setFolderGroup?.(folder, newGroup);
	}

	function getGroup(groupKey: any) {
		return (window as any).Attribute?.getGroup?.(groupKey);
	}

	function getAttribute(attrId: any) {
		return (window as any).Attribute?.getAttribute?.(attrId);
	}

	function getGroupAttribute(groupKey: any, attrId: any) {
		return (window as any).Attribute?.getGroupAttribute?.(groupKey, attrId);
	}

	function getDefAttributeId(groupKey: any, type: any) {
		return (window as any).Attribute?.getDefAttributeId?.(groupKey, type);
	}

	function getAttributeItems(groupKey: any, attrType: any, allowNone?: any) {
		return (window as any).Attribute?.getAttributeItems?.(groupKey, attrType, allowNone);
	}

	function openPropertyPanel(attribute: any) {
		(window as any).Attribute?.openPropertyPanel?.(attribute);
	}

	function closePropertyPanel() {
		(window as any).Attribute?.closePropertyPanel?.();
	}

	function saveHistory(item: any, key: any, value: any) {
		(window as any).Attribute?.saveHistory?.(item, key, value);
	}

	function saveToProject(project: any) {
		(window as any).Attribute?.saveToProject?.(project);
	}

	function loadFromProject(project: any) {
		(window as any).Attribute?.loadFromProject?.(project);
	}

	return {
		state,
		attributes,
		syncState,
		initialize,
		open,
		close,
		undo,
		redo,
		createId,
		register,
		unregister,
		setFolderGroup,
		getGroup,
		getAttribute,
		getGroupAttribute,
		getDefAttributeId,
		getAttributeItems,
		openPropertyPanel,
		closePropertyPanel,
		saveHistory,
		saveToProject,
		loadFromProject
	};
});
