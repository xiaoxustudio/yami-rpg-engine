import type { YamiElement } from '@app/types/element-api';
// 第 235 轮：本来这里另有一份 `SceneItem`（与本文件同名不同形），合并到 `scene-list.ts` 那一份
// —— 两份并存时它们互不兼容，`Scene.list.updateFolderState(...)` 之类的调用点会以 TS2345 报出来。
export type { SceneItem } from './scene-list.ts';

export type DragEventItem = PointerEvent & {
	dragKey?: boolean;
	mode?: string;
	scrollLeft?: number;
	scrollTop?: number;
	pointerdownX?: number;
	pointerdownY?: number;
	enabled?: boolean;
	latest?: DragEventItem;
	startX?: number;
	startY?: number;
};

export type ScrollableScreen = YamiElement;
