/**
 * 取色窗口的骨架节点表（画布 / 光标 / 边框 / 色值输入 / 根元素）。
 *
 * `tools/color-picker-window.ts` 长期驱动这些节点（画渐变、摆光标、监听 pointerdown），
 * 之前按 id 从 `colorEls` 取。现在由 `Color.vue` 交出，`pick` 带 id 兜底。
 */
import { createSkeletonTable } from './skeleton-table';

export type ColorNodeKey =
	| 'root'
	| 'paletteCanvas'
	| 'paletteFrame'
	| 'paletteCursor'
	| 'pillarCanvas'
	| 'pillarFrame'
	| 'pillarCursor'
	| 'viewer'
	| 'hex';

export const colorNodes = createSkeletonTable<ColorNodeKey>({
	root: 'color',
	paletteCanvas: 'color-palette-canvas',
	paletteFrame: 'color-palette-frame',
	paletteCursor: 'color-palette-cursor',
	pillarCanvas: 'color-pillar-canvas',
	pillarFrame: 'color-pillar-frame',
	pillarCursor: 'color-pillar-cursor',
	viewer: 'color-viewer',
	hex: 'color-hex'
});
