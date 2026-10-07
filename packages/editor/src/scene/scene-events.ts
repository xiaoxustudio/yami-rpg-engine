import type { YamiElement } from '@app/types/element-api';
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
