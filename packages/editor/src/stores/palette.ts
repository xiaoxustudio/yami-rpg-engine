import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { pinia } from './pinia';
import { Palette } from '@app/palette/palette.ts';
import type { EditorProjectShape } from './editor';

export type PaletteMode = 'normal' | 'priority' | 'tag' | 'terrain' | 'edit';
export type PaletteState = 'closed' | 'loading' | 'open' | 'suspended';

/**
 * 图块组数据的**窄视图**（检查器/调色板读取用的那几个字段）。
 *
 * 第 238 轮：**补齐**运行期真正存在的字段（`tileWidth` / `tileHeight` / `height` / `tiles` /
 * `priorities` / `terrains`）—— 本文件的 `tileset` 是 `shallowRef<any>`（真源是
 * `Data.tilesets[guid]` 的 `DataEntry`），而 `Palette` 单例收口后，桥键 `Palette.tileset`
 * 与各读取点（`useTileNodeWindow.ts:126`、`palette/auto-tile.ts:1074`、
 * `palette/__tests__/palette-selection-render.spec.ts:94`）都要按**非可空**用它们，
 * 声明成可选只会把「数据里一定有」变成一串 `!`。
 */
export interface PaletteTilesetShape {
	type?: string;
	width: number;
	height: number;
	tileWidth: number;
	tileHeight: number;
	tags: (string | number)[];
	/** 自动图块模板表（`palette/auto-tile.ts:1074` 按索引读写）。 */
	tiles: Record<number, unknown>;
	priorities?: number[];
	terrains?: number[];
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
