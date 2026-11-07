/**
 * 图块调色板（palette）的骨架节点表。
 *
 * `palette/palette-initialize.ts` 长期驱动这些节点（画布 / 屏幕 / 选框 / 各类输入），
 * 以前按 id 从 `paletteEls` 取。现在由 `FileTilesetPaletteSection.vue` 与
 * `FileTilesetGeneralSection.vue` 交出，`pick` 带 id 兜底。
 */
import { createSkeletonTable } from './skeleton-table';

export type PaletteNodeKey =
	| 'head'
	| 'body'
	| 'frame'
	| 'canvas'
	| 'screen'
	| 'marquee'
	| 'scroll'
	| 'priority'
	| 'tag'
	| 'terrain'
	| 'edit'
	| 'zoom'
	| 'detail';

export const paletteNodes = createSkeletonTable<PaletteNodeKey>({
	head: 'palette-head',
	body: 'palette-body',
	frame: 'palette-frame',
	canvas: 'palette-canvas',
	screen: 'palette-screen',
	marquee: 'palette-marquee',
	scroll: 'palette-scroll',
	priority: 'palette-priority',
	tag: 'palette-tag',
	terrain: 'palette-terrain',
	edit: 'palette-edit',
	zoom: 'palette-zoom',
	detail: 'fileTileset-general-detail'
});
