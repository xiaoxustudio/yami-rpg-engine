import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const useLayoutStore = defineStore('layout', () => {
	const currentPage = shallowRef<string>('home');
	const layouts = shallowRef<any>(null);
	const items = shallowRef<any>(null);

	function syncState() {
		const Layout = (window as any).Layout;
		currentPage.value = Layout?.manager?.index ?? 'home';
		layouts.value = Layout?.layouts ?? null;
		items.value = Layout?.items ?? null;
	}

	function switchLayout(name: string) {
		(window as any).Layout?.switchLayout?.(name);
	}

	function loadLayoutScheme() {
		(window as any).Layout?.loadLayoutScheme?.();
	}

	function saveLayoutScheme() {
		(window as any).Layout?.saveLayoutScheme?.();
	}

	function updateGroups() {
		(window as any).Layout?.updateGroups?.();
	}

	function initialize() {
		(window as any).Layout?.initialize?.();
	}

	function createGroups(item: any, parent: any) {
		(window as any).Layout?.createGroups?.(item, parent);
	}

	function updateGroupTabs(group: any) {
		(window as any).Layout?.updateGroupTabs?.(group);
	}

	function updateGroupInfo() {
		(window as any).Layout?.updateGroupInfo?.();
	}

	function mergeGroups() {
		(window as any).Layout?.mergeGroups?.();
	}

	function setGroupSize(group: any, hint: any, direction: string) {
		(window as any).Layout?.setGroupSize?.(group, hint, direction);
	}

	function computeSizesBefore(group: any) {
		(window as any).Layout?.computeSizesBefore?.(group);
	}

	function computeSizesAfter(group: any) {
		(window as any).Layout?.computeSizesAfter?.(group);
	}

	function updateHint(location: any) {
		(window as any).Layout?.updateHint?.(location);
	}

	function getKeyGroups() {
		return (window as any).Layout?.getKeyGroups?.();
	}

	function getGroupOfElement(element: any) {
		return (window as any).Layout?.getGroupOfElement?.(element);
	}

	function readyToFocus(element: any) {
		(window as any).Layout?.readyToFocus?.(element);
	}

	function createGroupContent(group: any) {
		(window as any).Layout?.createGroupContent?.(group);
	}

	function createGroupBorder(group: any) {
		(window as any).Layout?.createGroupBorder?.(group);
	}

	function enableFocusableElements() {
		(window as any).Layout?.enableFocusableElements?.();
	}

	function disableFocusableElements() {
		(window as any).Layout?.disableFocusableElements?.();
	}

	function saveNavStates() {
		(window as any).Layout?.saveNavStates?.();
	}

	function saveToConfig(config: any) {
		(window as any).Layout?.saveToConfig?.(config);
	}

	function loadFromConfig(config: any) {
		(window as any).Layout?.loadFromConfig?.(config);
	}

	function windowResize(event: any) {
		(window as any).Layout?.windowResize?.(event);
	}

	function windowLocalize(event: any) {
		(window as any).Layout?.windowLocalize?.(event);
	}

	function pageSwitch(event: any) {
		(window as any).Layout?.pageSwitch?.(event);
	}

	function navWrite(event: any) {
		(window as any).Layout?.navWrite?.(event);
	}

	function navPointerdown(event: any) {
		(window as any).Layout?.navPointerdown?.(event);
	}

	function navDragstart(event: any) {
		(window as any).Layout?.navDragstart?.(event);
	}

	function navDragend(event: any) {
		(window as any).Layout?.navDragend?.(event);
	}

	function navDragenter(event: any) {
		(window as any).Layout?.navDragenter?.(event);
	}

	function navDragleave(event: any) {
		(window as any).Layout?.navDragleave?.(event);
	}

	function navDragover(event: any) {
		(window as any).Layout?.navDragover?.(event);
	}

	function navDrop(event: any) {
		(window as any).Layout?.navDrop?.(event);
	}

	function regionDragleave(event: any) {
		(window as any).Layout?.regionDragleave?.(event);
	}

	function regionDragover(event: any) {
		(window as any).Layout?.regionDragover?.(event);
	}

	function borderPointerdown(event: any) {
		(window as any).Layout?.borderPointerdown?.(event);
	}

	function pointerup(event: any) {
		(window as any).Layout?.pointerup?.(event);
	}

	function pointermove(event: any) {
		(window as any).Layout?.pointermove?.(event);
	}

	return {
		currentPage,
		layouts,
		items,
		syncState,
		switchLayout,
		loadLayoutScheme,
		saveLayoutScheme,
		updateGroups,
		initialize,
		createGroups,
		updateGroupTabs,
		updateGroupInfo,
		mergeGroups,
		setGroupSize,
		computeSizesBefore,
		computeSizesAfter,
		updateHint,
		getKeyGroups,
		getGroupOfElement,
		readyToFocus,
		createGroupContent,
		createGroupBorder,
		enableFocusableElements,
		disableFocusableElements,
		saveNavStates,
		saveToConfig,
		loadFromConfig,
		windowResize,
		windowLocalize,
		pageSwitch,
		navWrite,
		navPointerdown,
		navDragstart,
		navDragend,
		navDragenter,
		navDragleave,
		navDragover,
		navDrop,
		regionDragleave,
		regionDragover,
		borderPointerdown,
		pointerup,
		pointermove
	};
});
