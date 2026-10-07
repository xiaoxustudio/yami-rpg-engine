import { elementDataOf } from '@ui-kit';
import type { YamiElement } from '@app/types/element-api';
import type { Matrix } from '@app/engine/webgl/matrix2.ts';
import { animationEls } from '@app/animation/element-registry';
import type { ParticleEmitterShape } from '@app/particle/particle-window.ts';
import type { History } from '@app/tools/history.ts';
import { getAnimationStore } from '@app/stores/animation';
import {
	AnimationWindowEngine,
	bindAnimationWindow
} from '@app/engine/animation/animation-window-engine.ts';

export type AnimationElement = YamiElement;

export interface AnimationTimelineMarqueeExtensions {
	x: number;
	y: number;
	length: number;
	layer: AnimationLayer | null;
}

export interface AnimationMarqueeExtensions {
	length: number;
	layer: AnimationLayer | null;
	isSelected: (...args: unknown[]) => boolean;
	isPointIn: (x: number, y: number) => boolean;
	isShrinkable: (...args: unknown[]) => boolean;
	isExtendable: (...args: unknown[]) => boolean;
}

export interface AnimationListExtensions {
	expandToItem: (item: unknown) => void;
	selectWithNoEvent: (item: unknown) => void;
	restoreMotionAndLayer: (
		motion: AnimationMotion | null,
		direction: number,
		layer: AnimationLayer
	) => void;
}

export interface AnimationDirListExtensions {
	setDirDirection: (...args: unknown[]) => void;
	setDirItems: (...args: unknown[]) => void;
}

export interface AnimationTimelineCursorExtensions {
	pointerevent: PointerEvent | null;
	x: number;
	y: number;
}

export interface AnimationSearcherExtensions {
	addKeydownFilter?: () => void;
}

export interface AnimationPointerAreaExtensions {
	width: number;
	height: number;
	x: number;
	y: number;
}

export type AnimationFrame = {
	start: number;
	end: number;
	rotation?: number;
	easingId?: string;
	x?: number;
	y?: number;
	key?: HTMLElement & { easing?: boolean };
	[k: string]: unknown;
};
export type AnimationLayer = {
	class: string;
	frames: AnimationFrame[];
	children: AnimationLayer[];
	timeline?: HTMLElement & { layer?: AnimationLayer };
	expanded?: boolean;
	[k: string]: unknown;
};
export type AnimationMotion = {
	id: string;
	mode: string;
	dirCases: { layers: AnimationLayer[]; [k: string]: unknown }[];
	loop?: boolean | null;
	element: HTMLElement & {
		textNode: Text;
		loopIcon?: HTMLElement;
		loop?: boolean | null;
	};
	[k: string]: unknown;
};
export type AnimationMotionData = Partial<AnimationMotion> & { id: string; mode: string };
export type AnimationContext = {
	layer: { class: string; sprite: string; [k: string]: unknown };
	frame: AnimationFrame;
	matrix: number[];
	anchorX: number;
	anchorY: number;
	pivotX: number;
	pivotY: number;
	emitter?: ParticleEmitterShape;
	parent: AnimationContext | null;
	[k: string]: unknown;
};
export type AnimationMarquee = {
	layer: AnimationLayer;
	x: number;
	length: number;
	[k: string]: unknown;
};
export type AnimationFileContext = {
	meta: { guid: string; path: string; [k: string]: unknown };
	animation: {
		mode: string;
		sprites: Array<{
			id: string;
			image: string;
			hframes: number;
			vframes: number;
			[k: string]: unknown;
		}>;
		motions: AnimationMotion[];
		[k: string]: unknown;
	};
	editor?: {
		motion: AnimationMotion | null;
		target: unknown;
		player: NonNullable<typeof Animation.player>;
		history: History;
		centerX: number;
		centerY: number;
		selectionX: number;
		selectionLength: number;
		listScrollTop: number;
	};
};
export type AnimationFrameData = { copies: AnimationFrame[]; length: number };

export type AnimationHistoryObject = { response: unknown };
export type AnimationHistoryMotionId = { motion: AnimationMotion; direction: number; id: string };
export type AnimationHistoryMotionMode = {
	motion: AnimationMotion;
	direction: number;
	mode: string;
	dirCases: AnimationMotion['dirCases'];
};
export type AnimationHistoryLayerOperation = {
	motion: AnimationMotion;
	direction: number;
	response: unknown;
};
export type AnimationHistoryLayerState = {
	motion: AnimationMotion;
	direction: number;
	item: AnimationLayer;
	oldValues: unknown;
	newValue: boolean;
};
export type AnimationHistoryLayerShift = {
	motion: AnimationMotion;
	direction: number;
	layer: AnimationLayer;
	shiftX: number;
	shiftY: number;
};
export type AnimationHistoryFrames = {
	motion: AnimationMotion;
	direction: number;
	changes: { layer: AnimationLayer; frames: AnimationFrame[] }[];
	sMarquee: { layer: AnimationLayer; x: number; length: number };
	dMarquee: { layer: AnimationLayer; x: number; length: number };
};
export type AnimationHistoryEasing = {
	motion: AnimationMotion;
	direction: number;
	target: AnimationFrame & { easingId?: string; key: HTMLElement & { easing?: boolean } };
	easingId: string;
};
export type AnimationHistoryTargetShift = {
	motion: AnimationMotion;
	direction: number;
	editor: { target: unknown };
	target: AnimationFrame & { x: number; y: number };
	x: number;
	y: number;
};
export type AnimationHistoryTargetResize = {
	motion: AnimationMotion;
	direction: number;
	editor: { target: unknown };
	target: AnimationFrame & { scaleX: number; scaleY: number };
	scaleX: number;
	scaleY: number;
};
export type AnimationHistoryTargetRotate = {
	motion: AnimationMotion;
	direction: number;
	editor: { target: unknown };
	target: AnimationFrame & { rotation: number };
	rotation: number;
};
export type AnimationHistoryTargetIndex = {
	motion: AnimationMotion;
	direction: number;
	target: AnimationFrame & { spriteX: number; spriteY: number };
	hindex: number;
	vindex: number;
};

export interface AnimationDragEvent extends PointerEvent {
	dragKey?: boolean;
	mode?: string;
	scrollLeft?: number;
	scrollTop?: number;
	absoluteAnchorX?: number;
	absoluteAnchorY?: number;
	lastAngle?: number;
	rotationRadians?: number;
	startRotation?: number;
	startScaleX?: number;
	startScaleY?: number;
	startWidth?: number;
	startHeight?: number;
	enabled?: boolean;
	startX?: number;
	startY?: number;
}

export interface AnimationShape {
	matrix: Matrix;
	scrollLeft: number;
	scrollTop: number;
	scrollRight: number;
	scrollBottom: number;
	page: AnimationElement;
	head: AnimationElement & AnimationPointerAreaExtensions;
	body: AnimationElement;
	screen: AnimationElement;
	marquee: AnimationElement & AnimationMarqueeExtensions & AnimationTimelineCursorExtensions;
	dirList: AnimationElement & AnimationDirListExtensions;
	searcher: AnimationElement & AnimationSearcherExtensions;
	list: AnimationElement & AnimationListExtensions;
	layerList: AnimationElement & AnimationListExtensions;
	timeline: AnimationElement;
	toolbar: AnimationElement;
	outerRuler: AnimationElement;
	innerRuler: AnimationElement;
	outerTimelineList: AnimationElement & AnimationListExtensions;
	innerTimelineList: AnimationElement & AnimationTimelineCursorExtensions;
	timelineCursor: AnimationElement & AnimationTimelineCursorExtensions;
	timelineMarquee: AnimationElement &
		AnimationTimelineMarqueeExtensions &
		AnimationMarqueeExtensions;
	timelineMarqueeShift: AnimationElement & AnimationTimelineMarqueeExtensions;
	outerPointerArea: AnimationElement & AnimationPointerAreaExtensions;
	innerPointerArea: AnimationElement & AnimationPointerAreaExtensions;
	pointer: AnimationElement & AnimationPointerAreaExtensions;
	adjustMarquee: () => unknown;
	close: () => unknown;
	copy: (...args: unknown[]) => unknown;
	createDirItems: () => unknown;
	delete: (...args: unknown[]) => unknown;
	deleteFrame: (shrink?: boolean) => unknown;
	dragAndDropFrame: () => unknown;
	drawBackground: () => unknown;
	drawBackParticles: () => unknown;
	drawCoordinateAxes: () => unknown;
	drawEmitters: () => unknown;
	drawEmitterWireframe: (context: AnimationContext, color: number) => unknown;
	drawFrontParticles: () => unknown;
	drawHoverWireframe: () => unknown;
	drawJointArrows: () => unknown;
	drawJointNodes: () => unknown;
	drawJointSpinner: () => unknown;
	drawOnionskins: () => unknown;
	drawSpriteControlPoints: () => unknown;
	drawSpriteWireframe: (context: AnimationContext, color: number) => unknown;
	drawTargetAnchor: () => unknown;
	drawTargetWireframe: () => unknown;
	editMotion: (motion: AnimationMotion) => unknown;
	emitParticles: (deltaTime: number) => unknown;
	enumchange: (_event: Event) => unknown;
	extendFrame: () => unknown;
	getKeyFrame: (x: number, y: number) => unknown;
	getLayerIndex: (layer: AnimationLayer) => number;
	getMotionListItems: (animationId: string) => Array<{ value: string }>;
	getNewMotionId: (callback: (id: string) => void) => unknown;
	getSpriteListItems: (animationId: string) => unknown;
	headPointerdown: (event: Event) => unknown;
	initialize: () => unknown;
	innerTimelineListDblclick: (event: PointerEvent) => unknown;
	innerTimelineListPointerleave: (_event: Event) => unknown;
	innerTimelineListPointermove: (event: PointerEvent) => unknown;
	insertFrame: () => unknown;
	isPointInFrame: (context: AnimationContext, x: number, y: number) => unknown;
	keydown: (event: KeyboardEvent) => unknown;
	layerListChange: (_event: Event) => unknown;
	layerListKeydown: (event: KeyboardEvent) => unknown;
	layerListPointerdown: (event: PointerEvent) => unknown;
	layerListScroll: (_event: Event) => unknown;
	listKeydown: (event: KeyboardEvent) => unknown;
	listPageResize: (_event: Event) => unknown;
	listPointerdown: (event: PointerEvent) => unknown;
	loadFrames: (index: number, forceReload?: boolean) => unknown;
	loadTextures: () => unknown;
	marqueeDoubleclick: (_event: Event) => unknown;
	marqueePointerdown: (
		event: PointerEvent & {
			dragKey?: boolean;
			mode?: string;
			scrollLeft?: number;
			scrollTop?: number;
			absoluteAnchorX?: number;
			absoluteAnchorY?: number;
			lastAngle?: number;
			rotationRadians?: number;
			startRotation?: number;
			startScaleX?: number;
			startScaleY?: number;
			startWidth?: number;
			startHeight?: number;
			enabled?: boolean;
			startX?: number;
			startY?: number;
		}
	) => unknown;
	marqueePointerleave: (_event: Event) => unknown;
	marqueePointermove: (event: PointerEvent) => unknown;
	multiSelectFramesRelative: (direction: string) => unknown;
	multiSelectFramesToHomeEnd: (direction: string) => unknown;
	nextFrame: () => unknown;
	nextKeyFrame: () => unknown;
	openFrame: () => unknown;
	outerTimelineListBlur: (_event: Event) => unknown;
	outerTimelineListKeydown: (event: KeyboardEvent) => unknown;
	outerTimelineListScroll: (_event: Event) => unknown;
	paste: (...args: unknown[]) => unknown;
	pointermove: (event: PointerEvent) => unknown;
	previousFrame: () => unknown;
	previousKeyFrame: () => unknown;
	redo: () => unknown;
	renderingFunction: () => unknown;
	requestAnimation: () => unknown;
	requestRefreshingList: () => unknown;
	requestRendering: () => unknown;
	resetSoundContexts: () => unknown;
	resize: () => unknown;
	rotateTarget: (rotation: number) => unknown;
	save: () => unknown;
	screenKeydown: (event: KeyboardEvent) => unknown;
	screenUserscroll: (_event: Event) => unknown;
	screenWheel: (event: WheelEvent) => unknown;
	scrollToMarquee: (shiftKey: boolean) => unknown;
	searcherInput: (event: Event & { inputType?: string }) => unknown;
	selectAllFrames: () => unknown;
	selectAllFramesOfKey: () => unknown;
	selectControlPoint: (x: number, y: number) => { x: number; y: number; angle: number } | null;
	selectFrameAtHomeEnd: (direction: string) => unknown;
	selectFrameRelative: (direction: string) => unknown;
	setControlPoint: (point: { x: number; y: number; angle: number } | null) => unknown;
	shiftFrames: (frames: AnimationFrame[], start: number, offset: number) => unknown;
	shiftSelectedFrames: (mode: string) => unknown;
	shiftTarget: (x: number, y: number) => unknown;
	sortFrames: (frames: AnimationFrame[]) => unknown;
	stop: () => unknown;
	stopAnimation: () => unknown;
	stopPlayingSound: () => unknown;
	stopRendering: () => unknown;
	switchPointerdown: (event: PointerEvent) => unknown;
	switchSettings: () => unknown;
	themechange: (_event: Event) => unknown;
	timelinePageResize: (_event: Event) => unknown;
	timelineToolbarPointerdown: (event: PointerEvent) => unknown;
	undo: () => unknown;
	updateAnimation: (deltaTime: number) => unknown;
	updateControlPoints: (context: AnimationContext) => unknown;
	updateCursor: (x: number, y: number) => unknown;
	updateFrameContexts: () => unknown;
	updateHead: () => unknown;
	updateMarquee: () => unknown;
	updateMarqueeShift: (x: number, y: number, length?: number) => unknown;
	updateMatrix: () => unknown;
	updateMotion: () => unknown;
	updateMotionItem: () => unknown;
	updateParticles: (deltaTime: number) => unknown;
	updatePlayerMotion: () => unknown;
	updatePointer: () => unknown;
	updatePointerArea: () => unknown;
	updateRuler: () => unknown;
	updateTarget: () => unknown;
	updateTargetContext: () => unknown;
	updateTimeline: () => unknown;
	updateTimelineLength: () => unknown;
	updateTransform: () => unknown;
	webglRestored: (_event: Event) => unknown;
	windowResize: (_event: Event) => unknown;
	zoomInput: (_event: Event) => unknown;
	scale: number;
	scaleX: number;
	scaleY: number;
	translationKey: number;
	frameMax: number;
	dragging: AnimationDragEvent | null;
	motion: AnimationMotion;
	history: History;
	planToSave: () => unknown;
	cloneFrame: (frames: AnimationFrame[], index: number, ...args: unknown[]) => AnimationFrame;
	saveFrames: (
		layers: AnimationLayer[],
		sMarquee: AnimationMarquee,
		dMarquee?: AnimationMarquee
	) => unknown;
	setMotion: (motion: AnimationMotionData | null, ...args: unknown[]) => unknown;
	setDirection: (direction: number, ...args: unknown[]) => unknown;
	unselectMarquee: (
		frame?: AnimationFrame | Record<string, unknown> | null,
		...args: unknown[]
	) => unknown;
	outerTimelineListPointermove: (event: PointerEvent) => unknown;
	selectMarquee: (
		x: number,
		y: number,
		length: number,
		origin?: number,
		...args: unknown[]
	) => unknown;
	sprites: Array<
		{ id: string; image: string; hframes: number; vframes: number } & Record<string, unknown>
	> & {
		listItems?: unknown;
	};
	setZoom: (zoom: number) => unknown;
	pointerup: (event?: PointerEvent) => unknown;
	translationKeyup: (event?: KeyboardEvent) => unknown;
	outerTimelineListPointerup: (event?: PointerEvent) => unknown;
	copyFrame: (returnData?: boolean) => { copies: AnimationFrame[]; length: number } | undefined;
	getFrameCoords: (event: PointerEvent, clamp?: boolean) => { x: number; y: number };
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
}

export const Animation = {
	matrix: null!,
	scrollLeft: null!,
	scrollTop: null!,
	scrollRight: null!,
	scrollBottom: null!,
	page:
		(animationEls.get('animation') as AnimationShape['page']) ?? ({} as AnimationShape['page']),
	head:
		(animationEls.get('animation-head') as AnimationShape['head']) ??
		({} as AnimationShape['head']),
	body:
		(animationEls.get('animation-body') as AnimationShape['body']) ??
		({} as AnimationShape['body']),
	screen:
		(animationEls.get('animation-screen') as AnimationShape['screen']) ??
		({} as AnimationShape['screen']),
	marquee:
		(animationEls.get('animation-marquee') as AnimationShape['marquee']) ??
		({} as AnimationShape['marquee']),
	dirList:
		(animationEls.get('animation-dirList') as AnimationShape['dirList']) ??
		({} as AnimationShape['dirList']),
	searcher:
		(animationEls.get('animation-searcher') as AnimationShape['searcher']) ??
		({} as AnimationShape['searcher']),
	list:
		(animationEls.get('animation-list') as AnimationShape['list']) ??
		({} as AnimationShape['list']),
	layerList:
		(animationEls.get('animation-layer-list') as AnimationShape['layerList']) ??
		({} as AnimationShape['layerList']),
	timeline:
		(animationEls.get('animation-timeline') as AnimationShape['timeline']) ??
		({} as AnimationShape['timeline']),
	toolbar:
		(animationEls.get('animation-timeline-toolbar') as AnimationShape['toolbar']) ??
		({} as AnimationShape['toolbar']),
	outerRuler:
		(animationEls.get('animation-timeline-ruler-outer') as AnimationShape['outerRuler']) ??
		({} as AnimationShape['outerRuler']),
	innerRuler:
		(animationEls.get('animation-timeline-ruler-inner') as AnimationShape['innerRuler']) ??
		({} as AnimationShape['innerRuler']),
	outerTimelineList:
		(animationEls.get(
			'animation-timeline-list-outer'
		) as AnimationShape['outerTimelineList']) ?? ({} as AnimationShape['outerTimelineList']),
	innerTimelineList:
		(animationEls.get(
			'animation-timeline-list-inner'
		) as AnimationShape['innerTimelineList']) ?? ({} as AnimationShape['innerTimelineList']),
	timelineCursor:
		(animationEls.get('animation-timeline-cursor') as AnimationShape['timelineCursor']) ??
		({} as AnimationShape['timelineCursor']),
	timelineMarquee:
		(animationEls.get('animation-timeline-marquee') as AnimationShape['timelineMarquee']) ??
		({} as AnimationShape['timelineMarquee']),
	timelineMarqueeShift:
		(animationEls.get(
			'animation-timeline-marquee-shift'
		) as AnimationShape['timelineMarqueeShift']) ??
		({} as AnimationShape['timelineMarqueeShift']),
	outerPointerArea:
		(animationEls.get(
			'animation-timeline-pointer-area-outer'
		) as AnimationShape['outerPointerArea']) ?? ({} as AnimationShape['outerPointerArea']),
	innerPointerArea:
		(animationEls.get(
			'animation-timeline-pointer-area-inner'
		) as AnimationShape['innerPointerArea']) ?? ({} as AnimationShape['innerPointerArea']),
	pointer:
		(animationEls.get('animation-timeline-pointer') as AnimationShape['pointer']) ??
		({} as AnimationShape['pointer']),
	dirTags: null,
	dragging: null,
	hover: null,
	contextLoaded: false,
	particleUpdating: false,
	controlPoints: null,
	controlPointVisible: false,
	controlPointActive: null,
	controlPointRotation: null,
	translationKey: 0b0000,
	translationTimer: null,
	background: null,
	zoomTimer: null,
	outerWidth: null,
	outerHeight: null,
	centerX: null,
	centerY: null,
	centerOffsetX: null,
	centerOffsetY: null,
	padding: null,
	inspectorTypeMap: null,
	context: null,
	meta: null,
	motions: null,
	layers: null,
	animIndex: null,
	setSpeed: null,
	revealTarget: null,
	getPointerCoords: null,
	createTimelines: null,
	getAnimationRange: null,
	switchMark: null,
	switchOnionskin: null,
	switchMirror: null,
	switchLoop: null,
	Player: null
} satisfies Partial<AnimationShape> as Partial<AnimationShape> as AnimationShape;

elementDataOf<{ page?: HTMLElement | null }>(Animation.list).page = animationEls.get(
	'animation-motion'
) as YamiElement;
elementDataOf<{ head: HTMLElement }>(Animation.list).head = animationEls.get(
	'animation-list-head'
) as YamiElement;

elementDataOf<{ head: HTMLElement }>(Animation.timeline).head = animationEls.get(
	'animation-timeline-head'
) as YamiElement;

elementDataOf<{ dragging: PointerEvent | null }>(Animation.outerTimelineList).dragging = null;

Animation.innerTimelineList.pointerevent = null;

Animation.timelineCursor.pointerevent = null;

Animation.timelineMarquee.layer = null;
Animation.timelineMarquee.x = -1;
Animation.timelineMarquee.y = -1;
Animation.timelineMarquee.length = -1;
elementDataOf<{ origin: number }>(Animation.timelineMarquee).origin = -1;

import { ANIMATION_STATE_KEYS } from '@app/stores/animation-keys';

for (const key of ANIMATION_STATE_KEYS) {
	Object.defineProperty(Animation, key, {
		get: () => getAnimationStore()[key],
		set: (value: unknown) => {
			Reflect.set(getAnimationStore(), key, value);
		},
		configurable: true
	});
}

Animation.updateCamera = AnimationWindowEngine.updateCamera;
Animation.updateTransform = AnimationWindowEngine.updateTransform;
Animation.updateMatrix = AnimationWindowEngine.updateMatrix;
Animation.drawBackground = AnimationWindowEngine.drawBackground;
Animation.drawOnionskins = AnimationWindowEngine.drawOnionskins;
Animation.drawSpriteLayers = AnimationWindowEngine.drawSpriteLayers;
Animation.drawEmitters = AnimationWindowEngine.drawEmitters;
Animation.emitParticles = AnimationWindowEngine.emitParticles;
Animation.updateParticles = AnimationWindowEngine.updateParticles;
Animation.drawBackParticles = AnimationWindowEngine.drawBackParticles;
Animation.drawFrontParticles = AnimationWindowEngine.drawFrontParticles;
Animation.drawCoordinateAxes = AnimationWindowEngine.drawCoordinateAxes;
Animation.drawJointNodes = AnimationWindowEngine.drawJointNodes;
Animation.drawJointArrows = AnimationWindowEngine.drawJointArrows;
Animation.drawJointSpinner = AnimationWindowEngine.drawJointSpinner;
Animation.drawHoverWireframe = AnimationWindowEngine.drawHoverWireframe;
Animation.drawTargetWireframe = AnimationWindowEngine.drawTargetWireframe;
Animation.drawSpriteWireframe = AnimationWindowEngine.drawSpriteWireframe;
Animation.drawEmitterWireframe = AnimationWindowEngine.drawEmitterWireframe;
Animation.drawTargetAnchor = AnimationWindowEngine.drawTargetAnchor;
Animation.drawSpriteControlPoints = AnimationWindowEngine.drawSpriteControlPoints;
Animation.requestAnimation = AnimationWindowEngine.requestAnimation;
Animation.updateAnimation = AnimationWindowEngine.updateAnimation;
Animation.stopAnimation = AnimationWindowEngine.stopAnimation;
Animation.requestRendering = AnimationWindowEngine.requestRendering;
Animation.renderingFunction = AnimationWindowEngine.renderingFunction;
Animation.stopRendering = AnimationWindowEngine.stopRendering;

bindAnimationWindow(Animation);

export const animationWindowReady = Promise.all([
	import('./register.ts'),
	import('@app/engine/animation/animation-player.ts').then((m) => {
		Animation.Player = m.AnimationPlayer;
	})
])
	.then(() => undefined)
	.catch(() => undefined);
