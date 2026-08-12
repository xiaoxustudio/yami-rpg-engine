import { defineStore } from 'pinia';
import { Layout } from '@/layout/layout.ts';
import { pinia } from './pinia';
import type { EditorEvent } from '@/types/editor-event.ts';
import { shallowRef } from 'vue';

type LayoutSchemeShape = {
	end: number;
	split?: string;
	children?: LayoutSchemeShape[];
	tabs?: string[];
	[key: string]: unknown;
};

type LayoutItemShape = HTMLElement & { page?: HTMLElement };

type LayoutItemsShape = Record<string, LayoutItemShape> & { list: LayoutItemShape[] };

type LayoutGroupShape = HTMLElement & {
	end: number;
	split?: string;
	tabs?: string[];
	nav: HTMLElement;
	border?: HTMLElement;
	[key: string]: unknown;
};

type LayoutDragLocationShape = {
	trigger: HTMLElement;
	target: HTMLElement;
	direction: string;
};

export const useLayoutStore = defineStore('layout', () => {
	const currentPage = shallowRef<string>('home');
	const layouts = shallowRef<Record<string, LayoutSchemeShape> | null>(null);
	const items = shallowRef<LayoutItemsShape | null>(null);

	function syncState() {
		currentPage.value = Layout?.manager?.index ?? 'home';
		layouts.value = Layout?.layouts ?? null;
		items.value = Layout?.items ?? null;
	}

	function getCurrentPage() {
		return Layout?.manager?.index ?? 'home';
	}

	function switchLayout(name: string) {
		Layout?.switchLayout?.(name);
	}

	function loadLayoutScheme(key?: string) {
		Layout?.loadLayoutScheme?.(key);
	}

	function saveLayoutScheme() {
		Layout?.saveLayoutScheme?.();
	}

	function updateGroups(force?: boolean) {
		Layout?.updateGroups?.(force);
	}

	function initialize() {
		Layout?.initialize?.();
	}

	function createGroups(item: LayoutSchemeShape, parent: HTMLElement) {
		Layout?.createGroups?.(item, parent);
	}

	function updateGroupTabs(group: LayoutGroupShape) {
		Layout?.updateGroupTabs?.(group);
	}

	function updateGroupInfo() {
		Layout?.updateGroupInfo?.();
	}

	function mergeGroups() {
		Layout?.mergeGroups?.();
	}

	function setGroupSize(
		group: LayoutGroupShape,
		hint: { width: number; height: number },
		direction: 'forward' | 'backward'
	) {
		Layout?.setGroupSize?.(group, hint, direction);
	}

	function computeSizesBefore(group: LayoutGroupShape) {
		Layout?.computeSizesBefore?.(group);
	}

	function computeSizesAfter(group: LayoutGroupShape) {
		Layout?.computeSizesAfter?.(group);
	}

	function updateHint(location: LayoutDragLocationShape | null) {
		Layout?.updateHint?.(location);
	}

	function getKeyGroups() {
		return Layout?.getKeyGroups?.();
	}

	function getGroupOfElement(element: HTMLElement) {
		return Layout?.getGroupOfElement?.(element) ?? null;
	}

	function readyToFocus(element: HTMLElement) {
		Layout?.readyToFocus?.(element);
	}

	function createGroupContent(group: LayoutGroupShape) {
		Layout?.createGroupContent?.(group);
	}

	function createGroupBorder(group: LayoutGroupShape) {
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

	function saveToConfig(config: { layout?: Record<string, LayoutSchemeShape> | null }) {
		Layout?.saveToConfig?.(config);
	}

	function loadFromConfig(config: { layout?: Record<string, LayoutSchemeShape> | null }) {
		Layout?.loadFromConfig?.(config);
	}

	function windowResize(event: EditorEvent) {
		Layout?.windowResize?.(event);
	}

	function windowLocalize(event: EditorEvent) {
		Layout?.windowLocalize?.(event);
	}

	function pageSwitch(event: EditorEvent) {
		Layout?.pageSwitch?.(event);
	}

	function navWrite(event: EditorEvent) {
		Layout?.navWrite?.(event);
	}

	function navPointerdown(event: EditorEvent) {
		Layout?.navPointerdown?.(event);
	}

	function navDragstart(event: EditorEvent) {
		Layout?.navDragstart?.(event);
	}

	function navDragend(event: EditorEvent) {
		Layout?.navDragend?.(event);
	}

	function navDragenter(event: EditorEvent) {
		Layout?.navDragenter?.(event);
	}

	function navDragleave(event: EditorEvent) {
		Layout?.navDragleave?.(event);
	}

	function navDragover(event: EditorEvent) {
		Layout?.navDragover?.(event);
	}

	function navDrop(event: EditorEvent) {
		Layout?.navDrop?.(event);
	}

	function regionDragleave(event: EditorEvent) {
		Layout?.regionDragleave?.(event);
	}

	function regionDragover(event: EditorEvent) {
		Layout?.regionDragover?.(event);
	}

	function borderPointerdown(event: EditorEvent) {
		Layout?.borderPointerdown?.(event);
	}

	function pointerup(event: EditorEvent) {
		Layout?.pointerup?.(event);
	}

	function pointermove(event: EditorEvent) {
		Layout?.pointermove?.(event);
	}

	return {
		currentPage,
		layouts,
		items,
		syncState,
		getCurrentPage,
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

export function getLayoutStore() {
	return useLayoutStore(pinia);
}
