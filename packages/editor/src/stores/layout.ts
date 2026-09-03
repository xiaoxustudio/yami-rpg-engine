import { defineStore } from 'pinia';
import { Layout } from '@app/engine/layout/layout.ts';
import { pinia } from './pinia';
import type { EditorEvent } from '@app/types/editor-event.ts';
import { shallowReactive, shallowRef } from 'vue';

type LayoutSchemeShape = {
	end: number;
	split?: string;
	children?: LayoutSchemeShape[];
	tabs?: string[];
	[key: string]: unknown;
};

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

export const layoutStateKeys = [
	'dragging',
	'resizing',
	'focusableSelector',
	'focusableElements'
] as const;

export const useLayoutStore = defineStore('layout', () => {
	// oxlint-disable-next-line no-explicit-any
	const dragging = shallowRef<any>(null);
	// oxlint-disable-next-line no-explicit-any
	const resizing = shallowRef<any>(null);
	const focusableSelector = shallowRef<string | null>(null);
	const focusableElements = shallowRef<HTMLElement[] | null>(null);

	// 运行时页面/页签归属：value → 当前承载该页面的 group-manager / leaf nav 元素
	// （M3b 整壳 Teleport :to 输入，docs/layout-vue-plan.md 附录 F.1）。
	const pageTargets = shallowReactive<Record<string, HTMLElement | null>>({});
	const tabTargets = shallowReactive<Record<string, HTMLElement | null>>({});

	const makeTargets = (record: Record<string, HTMLElement | null>) => ({
		set(entries: Record<string, HTMLElement>): void {
			for (const key of Object.keys(record)) {
				if (!(key in entries)) delete record[key];
			}
			for (const [key, element] of Object.entries(entries)) {
				record[key] = element;
			}
		},
		reset(): void {
			for (const key of Object.keys(record)) {
				delete record[key];
			}
		},
		remove(keys: readonly string[]): void {
			for (const key of keys) {
				delete record[key];
			}
		}
	});

	const pageTargetActions = makeTargets(pageTargets);
	const tabTargetActions = makeTargets(tabTargets);

	function setPageTargets(record: Record<string, HTMLElement>): void {
		pageTargetActions.set(record);
	}

	function resetPageTargets(): void {
		pageTargetActions.reset();
	}

	function removePageTargets(keys: readonly string[]): void {
		pageTargetActions.remove(keys);
	}

	function setTabTargets(record: Record<string, HTMLElement>): void {
		tabTargetActions.set(record);
	}

	function resetTabTargets(): void {
		tabTargetActions.reset();
	}

	function removeTabTargets(keys: readonly string[]): void {
		tabTargetActions.remove(keys);
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
		dragging,
		resizing,
		focusableSelector,
		focusableElements,
		pageTargets,
		setPageTargets,
		resetPageTargets,
		removePageTargets,
		tabTargets,
		setTabTargets,
		resetTabTargets,
		removeTabTargets,
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
