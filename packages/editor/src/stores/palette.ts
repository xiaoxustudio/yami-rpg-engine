import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

// Phase 10——Palette 工具栏状态（mode/zoom/scrollable 等经 Pinia 承载——legacy Palette.xxx 访问零改动）
export type PaletteMode = 'normal' | 'priority' | 'tag' | 'terrain' | 'edit';
export type PaletteState = 'closed' | 'loading' | 'open' | 'suspended';

// Phase 10——逐步补齐类型（tileset 为 Data.tilesets 数据对象——随迁移细化）
export interface PaletteShape {
	state: PaletteState;
	mode: PaletteMode;
	zoom: number | null;
	showGrid: boolean;
	scrollable: boolean;
	activeIndex: number | null;
	tileset: any | null;
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
	const state = shallowRef<PaletteState>('closed');
	const mode = shallowRef<PaletteMode>('normal');
	const zoom = shallowRef<number | null>(null);
	const showGrid = shallowRef<boolean>(true);
	const scrollable = shallowRef<boolean>(false);
	const activeIndex = shallowRef<number | null>(null);
	const tileset = shallowRef<any | null>(null);
	let listening = false;

	function syncState() {
		const Palette = (window as any).Palette;
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
