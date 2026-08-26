import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { pinia } from './pinia';
import { Palette } from '@app/palette/palette.ts';
import type { EditorProjectShape } from './editor';

export type PaletteMode = 'normal' | 'priority' | 'tag' | 'terrain' | 'edit';
export type PaletteState = 'closed' | 'loading' | 'open' | 'suspended';

export interface PaletteTilesetShape {
	type?: string;
	width: number;
	tags: (string | number)[];
}

export interface PaletteShape {
	state: PaletteState;
	mode: PaletteMode;
	zoom: number | null;
	showGrid: boolean;
	scrollable: boolean;
	activeIndex: number | null;
	tileset: PaletteTilesetShape | null;
}

export const paletteStateKeys: (keyof PaletteShape)[] = [
	'state',
	'mode',
	'zoom',
	'showGrid',
	'scrollable',
	'activeIndex',
	'tileset'
];

export const usePaletteStore = defineStore('palette', () => {
	const state = shallowRef<string>('closed');
	const mode = shallowRef<string>('normal');
	const zoom = shallowRef<number | null>(null);
	const showGrid = shallowRef<boolean>(true);
	const scrollable = shallowRef<boolean>(false);
	const activeIndex = shallowRef<number | null>(null);
	// oxlint-disable-next-line no-explicit-any
	const tileset = shallowRef<any>(null);

	const initialized = shallowRef(false);

	function initialize() {
		if (initialized.value) return;
		Palette?.initialize?.();
		initialized.value = true;
	}

	function setMode(value: PaletteMode) {
		mode.value = value;
	}

	function setState(value: PaletteState) {
		state.value = value;
	}

	function setActiveIndex(value: number | null) {
		activeIndex.value = value;
	}

	function saveToProject(project: EditorProjectShape) {
		Palette?.saveToProject?.(project);
	}

	function loadFromProject(project: EditorProjectShape) {
		Palette?.loadFromProject?.(project);
	}

	return {
		state,
		mode,
		zoom,
		showGrid,
		scrollable,
		activeIndex,
		tileset,
		initialized,
		initialize,
		setMode,
		setState,
		setActiveIndex,
		saveToProject,
		loadFromProject
	};
});

export function getPaletteStore() {
	return usePaletteStore(pinia);
}
