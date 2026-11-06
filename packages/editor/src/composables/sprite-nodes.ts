/**
 * 精灵面板（`AnimSpriteFrameSpriteSection`）的骨架节点表。
 *
 * `engine/sprite/sprite.ts` 长期驱动这些节点（body / frame / info / zoom / screen / marquee
 * 与两个 detail 容器），之前按 id 从 `engineEls` 取。现在由 section 交出。
 */
import { createSkeletonTable } from './skeleton-table';

export type SpriteNodeKey =
	| 'body'
	| 'frame'
	| 'info'
	| 'zoom'
	| 'screen'
	| 'marquee'
	| 'canvas'
	| 'propertiesDetail'
	| 'spriteDetail';

export const spriteNodes = createSkeletonTable<SpriteNodeKey>({
	body: 'sprite-body',
	frame: 'sprite-frame',
	info: 'sprite-info',
	zoom: 'sprite-zoom',
	screen: 'sprite-screen',
	marquee: 'sprite-marquee',
	canvas: 'sprite-canvas',
	propertiesDetail: 'animSpriteFrame-properties-detail',
	spriteDetail: 'animSpriteFrame-sprite-detail'
});
