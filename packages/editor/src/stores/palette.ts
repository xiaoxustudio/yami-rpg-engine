import { defineStore } from 'pinia';
import { Palette } from '@/palette/palette.ts';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

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
	const tileset = shallowRef<PaletteTilesetShape | null>(null);
	let listening = false;

	function syncState() {
		state.value = Palette?.state ?? 'closed';
		mode.value = Palette?.mode ?? 'normal';
		zoom.value = Palette?.zoom ?? null;
		showGrid.value = Palette?.showGrid ?? true;
		scrollable.value = Palette?.scrollable ?? false;
		activeIndex.value = Palette?.activeIndex ?? null;
		tileset.value = Palette?.tileset ?? null;
		if (!listening && typeof window !== 'undefined') {
			window.addEventListener('localize', syncState);
			listening = true;
		}
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

	return {
		state,
		mode,
		zoom,
		showGrid,
		scrollable,
		activeIndex,
		tileset,
		syncState,
		setMode,
		setState,
		setActiveIndex
	};
});

export function getPaletteStore() {
	return usePaletteStore(pinia);
}
