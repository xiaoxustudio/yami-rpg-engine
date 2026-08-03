import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const useEnumStore = defineStore('enum', () => {
	const state = shallowRef<string>('closed');
	const enums = shallowRef<any[]>([]);

	function syncState() {
		const Enum = (window as any).Enum;
		state.value = Enum?.state ?? 'closed';
		enums.value = Enum?.enums ?? [];
	}

	function initialize() {
		(window as any).Enum?.initialize?.();
	}

	function open(target?: any, mode?: string) {
		(window as any).Enum?.open?.(target, mode);
	}

	function close() {
		(window as any).Enum?.close?.();
	}

	function undo() {
		(window as any).Enum?.undo?.();
	}

	function redo() {
		(window as any).Enum?.redo?.();
	}

	function createId() {
		return (window as any).Enum?.createId?.();
	}

	function register(item: any) {
		(window as any).Enum?.register?.(item);
	}

	function unregister(item: any) {
		(window as any).Enum?.unregister?.(item);
	}

	function setFolderGroup(folder: any, newGroup: any) {
		(window as any).Enum?.setFolderGroup?.(folder, newGroup);
	}

	function getGroup(groupKey: any) {
		return (window as any).Enum?.getGroup?.(groupKey);
	}

	function getString(stringId: any) {
		return (window as any).Enum?.getString?.(stringId);
	}

	function getGroupString(groupKey: any, stringId: any) {
		return (window as any).Enum?.getGroupString?.(groupKey, stringId);
	}

	function getDefStringId(groupKey: any) {
		return (window as any).Enum?.getDefStringId?.(groupKey);
	}

	function getStringItems(groupKey: any, allowNone?: any) {
		return (window as any).Enum?.getStringItems?.(groupKey, allowNone);
	}

	function getMergedItems(headItems: any, groupKey: any, mergedKey: any) {
		return (window as any).Enum?.getMergedItems?.(headItems, groupKey, mergedKey);
	}

	function openPropertyPanel(enumString: any) {
		(window as any).Enum?.openPropertyPanel?.(enumString);
	}

	function closePropertyPanel() {
		(window as any).Enum?.closePropertyPanel?.();
	}

	function saveHistory(item: any, key: any, value: any) {
		(window as any).Enum?.saveHistory?.(item, key, value);
	}

	function confirm(event?: any) {
		(window as any).Enum?.confirm?.(event);
	}

	function apply(event?: any) {
		(window as any).Enum?.apply?.(event);
	}

	function saveToProject(project: any) {
		(window as any).Enum?.saveToProject?.(project);
	}

	function loadFromProject(project: any) {
		(window as any).Enum?.loadFromProject?.(project);
	}

	return {
		state,
		enums,
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
		getString,
		getGroupString,
		getDefStringId,
		getStringItems,
		getMergedItems,
		openPropertyPanel,
		closePropertyPanel,
		saveHistory,
		confirm,
		apply,
		saveToProject,
		loadFromProject
	};
});
