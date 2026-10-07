import type { YamiElement } from '@app/types/element-api';
import type { History } from '@app/tools/history.ts';
import type { Matrix } from '@app/engine/webgl/matrix2.ts';
import type { ImageTexture } from '@app/engine/webgl/image-texture.ts';
import type { StageColor } from '@app/utils/stage-color';
import type { Timer } from '@app/utils/timer';
import type { UIElementInstance, UINodeShape } from '@app/engine/ui/element-classes.ts';

export type HoverNode = UINodeShape & { instance: UIElementInstance };

export interface ControlPoint {
	x: number;
	y: number;
	angle: number;
}

export interface UIControlPoints {
	rotate: Record<'TL' | 'TR' | 'BL' | 'BR', ControlPoint>;
	resize: Record<'T' | 'L' | 'R' | 'B' | 'TL' | 'TR' | 'BL' | 'BR', ControlPoint>;
	list: ControlPoint[];
}

export interface UIFacadeShape {
	page: HTMLElement;
	head: HTMLElement;
	body: HTMLElement;
	screen: YamiElement;
	marquee: YamiElement;

	history: History | null;
	planToSave: (() => void) | null;

	controlPoints: UIControlPoints | null;
	controlPointActive: ControlPoint | null;
	controlPointRotation: number;

	translationKey: number;
	translationTimer: Timer | null;
	zoomTimer: Timer | null;

	background: StageColor;
	foreground: StageColor;

	matrix: Matrix;
	scale: number;
	scaleX: number;
	scaleY: number;
	centerX: number;
	centerY: number;
	centerOffsetX: number;
	centerOffsetY: number;

	outerWidth: number;
	outerHeight: number;
	scrollLeft: number;
	scrollTop: number;
	scrollRight: number;
	scrollBottom: number;
	padding: number;
	paddingLeft: number;
	paddingTop: number;

	inspectorTypeMap: Record<string, string>;

	hover: HoverNode | null;
	controlPointTexture: ImageTexture | null;
}
