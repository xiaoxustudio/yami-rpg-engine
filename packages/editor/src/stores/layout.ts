import { defineStore } from 'pinia';
import { Layout } from '@/layout/layout.ts';
import { shallowRef } from 'vue';

export const useLayoutStore = defineStore('layout', () => {
	const currentPage = shallowRef<string>('home');
	const layouts = shallowRef<any>(null);
	const items = shallowRef<any>(null);

	function syncState() {
		currentPage.value = Layout?.manager?.index ?? 'home';
		layouts.value = Layout?.layouts ?? null;
		items.value = Layout?.items ?? null;
	}

	function switchLayout(name: string) {
		Layout?.switchLayout?.(name);
	}

	function loadLayoutScheme() {
		Layout?.loadLayoutScheme?.();
	}

	function saveLayoutScheme() {
		Layout?.saveLayoutScheme?.();
	}

	function updateGroups() {
		Layout?.updateGroups?.();
	}

	function initialize() {
		Layout?.initialize?.();
	}

	function createGroups(item: any, parent: any) {
		Layout?.createGroups?.(item, parent);
	}

	function updateGroupTabs(group: any) {
		Layout?.updateGroupTabs?.(group);
	}

	function updateGroupInfo() {
		Layout?.updateGroupInfo?.();
	}

	function mergeGroups() {
		Layout?.mergeGroups?.();
	}

	function setGroupSize(group: any, hint: any, direction: string) {
		Layout?.setGroupSize?.(group, hint, direction);
	}

	function computeSizesBefore(group: any) {
		Layout?.computeSizesBefore?.(group);
	}

	function computeSizesAfter(group: any) {
		Layout?.computeSizesAfter?.(group);
	}

	function updateHint(location: any) {
		Layout?.updateHint?.(location);
	}

	function getKeyGroups() {
		return Layout?.getKeyGroups?.();
	}

	function getGroupOfElement(element: any) {
		return Layout?.getGroupOfElement?.(element);
	}

	function readyToFocus(element: any) {
		Layout?.readyToFocus?.(element);
	}

	function createGroupContent(group: any) {
		Layout?.createGroupContent?.(group);
	}

	function createGroupBorder(group: any) {
		Layout?.createGroupBorder?.(group);
	}

	function enableFocusableElements() {
		Layout?.enableFocusableElements?.();
	}

	function disableFocusableElements() {
		Layout?.disableFocusableElements?.();
	}

	function saveNavStates() {
		Layout?.saveNavStates?.();
	}

	function saveToConfig(config: any) {
		Layout?.saveToConfig?.(config);
	}

	function loadFromConfig(config: any) {
		Layout?.loadFromConfig?.(config);
	}

	function windowResize(event: any) {
		Layout?.windowResize?.(event);
	}

	function windowLocalize(event: any) {
		Layout?.windowLocalize?.(event);
	}

	function pageSwitch(event: any) {
		Layout?.pageSwitch?.(event);
	}

	function navWrite(event: any) {
		Layout?.navWrite?.(event);
	}

	function navPointerdown(event: any) {
		Layout?.navPointerdown?.(event);
	}

	function navDragstart(event: any) {
		Layout?.navDragstart?.(event);
	}

	function navDragend(event: any) {
		Layout?.navDragend?.(event);
	}

	function navDragenter(event: any) {
		Layout?.navDragenter?.(event);
	}

	function navDragleave(event: any) {
		Layout?.navDragleave?.(event);
	}

	function navDragover(event: any) {
		Layout?.navDragover?.(event);
	}

	function navDrop(event: any) {
		Layout?.navDrop?.(event);
	}

	function regionDragleave(event: any) {
		Layout?.regionDragleave?.(event);
	}

	function regionDragover(event: any) {
		Layout?.regionDragover?.(event);
	}

	function borderPointerdown(event: any) {
		Layout?.borderPointerdown?.(event);
	}

	function pointerup(event: any) {
		Layout?.pointerup?.(event);
	}

	function pointermove(event: any) {
		Layout?.pointermove?.(event);
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
