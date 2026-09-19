import { elementDataOf } from '@ui-kit';
import type { YamiElement } from '@app/types/element-api';
import { animationEls } from '@app/animation/element-registry';
import type { ParticleEmitterShape } from '@app/particle/particle-window.ts';
import { getAnimationStore } from '@app/stores/animation';
import {
	AnimationWindowEngine,
	bindAnimationWindow
} from '@app/engine/animation/animation-window-engine.ts';

// DOM 元素字段：运行时挂载大量扩展方法（.hide()/.show()/.update()/.write()/.on() 等），统一用 HTMLElement & {[ k: string ]: any} 兜底，避免穷举
// oxlint-disable-next-line no-explicit-any
export type AnimationElement = YamiElement & { [k: string]: any };

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
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
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

export interface AnimationShape {
	page: AnimationElement;
	head: AnimationElement;
	body: AnimationElement;
	screen: AnimationElement;
	marquee: AnimationElement;
	dirList: AnimationElement;
	searcher: AnimationElement;
	list: AnimationElement;
	layerList: AnimationElement;
	timeline: AnimationElement;
	toolbar: AnimationElement;
	outerRuler: AnimationElement;
	innerRuler: AnimationElement;
	outerTimelineList: AnimationElement;
	innerTimelineList: AnimationElement;
	timelineCursor: AnimationElement;
	timelineMarquee: AnimationElement;
	timelineMarqueeShift: AnimationElement;
	outerPointerArea: AnimationElement;
	innerPointerArea: AnimationElement;
	pointer: AnimationElement;
	// editor + animation properties（运行时挂载具体值，统一 any | null）
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
}

export const Animation: AnimationShape = {
	page: animationEls.get('animation') as YamiElement,
	head: animationEls.get('animation-head') as YamiElement,
	body: animationEls.get('animation-body') as YamiElement,
	screen: animationEls.get('animation-screen') as YamiElement,
	marquee:
		(animationEls.get('animation-marquee') as YamiElement) ||
		({} as unknown as AnimationElement),
	dirList: animationEls.get('animation-dirList') as YamiElement,
	searcher: animationEls.get('animation-searcher') as YamiElement,
	list:
		(animationEls.get('animation-list') as YamiElement) || ({} as unknown as AnimationElement),
	layerList:
		(animationEls.get('animation-layer-list') as YamiElement) ||
		({} as unknown as AnimationElement),
	timeline:
		(animationEls.get('animation-timeline') as YamiElement) ||
		({} as unknown as AnimationElement),
	toolbar: animationEls.get('animation-timeline-toolbar') as YamiElement,
	outerRuler: animationEls.get('animation-timeline-ruler-outer') as YamiElement,
	innerRuler: animationEls.get('animation-timeline-ruler-inner') as YamiElement,
	outerTimelineList:
		(animationEls.get('animation-timeline-list-outer') as YamiElement) ||
		({} as unknown as AnimationElement),
	innerTimelineList:
		(animationEls.get('animation-timeline-list-inner') as YamiElement) ||
		({} as unknown as AnimationElement),
	timelineCursor:
		(animationEls.get('animation-timeline-cursor') as YamiElement) ||
		({} as unknown as AnimationElement),
	timelineMarquee:
		(animationEls.get('animation-timeline-marquee') as YamiElement) ||
		({} as unknown as AnimationElement),
	timelineMarqueeShift: animationEls.get('animation-timeline-marquee-shift') as YamiElement,
	outerPointerArea: animationEls.get('animation-timeline-pointer-area-outer') as YamiElement,
	innerPointerArea: animationEls.get('animation-timeline-pointer-area-inner') as YamiElement,
	pointer: animationEls.get('animation-timeline-pointer') as YamiElement,
	dirTags: null,
	dragging: null,
	hover: null,
	history: null,
	contextLoaded: false,
	particleUpdating: false,
	targetContext: null,
	controlPoints: null,
	controlPointVisible: false,
	controlPointActive: null,
	controlPointRotation: null,
	translationKey: 0b0000,
	translationTimer: null,
	background: null,
	matrix: null,
	zoomTimer: null,
	scale: null,
	scaleX: null,
	scaleY: null,
	outerWidth: null,
	outerHeight: null,
	scrollLeft: null,
	scrollTop: null,
	scrollRight: null,
	scrollBottom: null,
	centerX: null,
	centerY: null,
	centerOffsetX: null,
	centerOffsetY: null,
	padding: null,
	inspectorTypeMap: null,
	context: null,
	meta: null,
	player: null,
	sprites: null,
	motions: null,
	layers: null,
	animIndex: null,
	frameMax: null,
	initialize: null,
	open: null,
	load: null,
	save: null,
	close: null,
	destroy: null,
	play: null,
	stop: null,
	copy: null,
	paste: null,
	delete: null,
	undo: null,
	redo: null,
	openLayer: null,
	previousFrame: null,
	nextFrame: null,
	previousKeyFrame: null,
	nextKeyFrame: null,
	setSpeed: null,
	setZoom: null,
	setHover: null,
	setMotion: null,
	setMotionMode: null,
	setDirection: null,
	createDirItems: null,
	editMotion: null,
	getNewMotionId: null,
	revealTarget: null,
	shiftTarget: null,
	resizeTarget: null,
	rotateTarget: null,
	setControlPoint: null,
	updateMotion: null,
	updateMotionItem: null,
	updateTarget: null,
	updateTargetContext: null,
	updatePlayerMotion: null,
	updateFrameContexts: null,
	updateSoundContexts: null,
	resetSoundContexts: null,
	stopPlayingSound: null,
	updateControlPoints: null,
	updateHead: null,
	resize: null,
	getPointerCoords: null,
	getFrameCoords: null,
	getKeyFrame: null,
	getLayerIndex: null,
	getMotionListItems: null,
	getSpriteListItems: null,
	updateCamera: null,
	updateTransform: null,
	updateMatrix: null,
	updateRuler: null,
	updateTimeline: null,
	updateTimelineLength: null,
	updatePointerArea: null,
	updatePointer: null,
	updateCursor: null,
	selectFrame: null,
	selectMarquee: null,
	unselectMarquee: null,
	updateMarquee: null,
	scrollToMarquee: null,
	updateMarqueeShift: null,
	selectFrameRelative: null,
	selectFrameAtHomeEnd: null,
	selectAllFramesOfKey: null,
	multiSelectFramesRelative: null,
	multiSelectFramesToHomeEnd: null,
	openFrame: null,
	loadTextures: null,
	loadFrames: null,
	drawBackground: null,
	drawOnionskins: null,
	drawSpriteLayers: null,
	drawEmitters: null,
	emitParticles: null,
	updateParticles: null,
	drawBackParticles: null,
	drawFrontParticles: null,
	drawCoordinateAxes: null,
	drawJointNodes: null,
	drawJointArrows: null,
	drawJointSpinner: null,
	drawHoverWireframe: null,
	drawTargetWireframe: null,
	drawSpriteWireframe: null,
	drawEmitterWireframe: null,
	drawTargetAnchor: null,
	drawSpriteControlPoints: null,
	createTimelines: null,
	getFrame: null,
	sortFrames: null,
	shiftFrames: null,
	saveFrames: null,
	cloneFrame: null,
	insertFrame: null,
	extendFrame: null,
	deleteFrame: null,
	copyFrame: null,
	pasteFrame: null,
	selectAllFrames: null,
	dragAndDropFrame: null,
	adjustMarquee: null,
	shiftLayerPosition: null,
	shiftSelectedFrames: null,
	selectControlPoint: null,
	selectObject: null,
	isPointInFrame: null,
	getAnimationRange: null,
	requestRefreshingList: null,
	requestAnimation: null,
	updateAnimation: null,
	stopAnimation: null,
	requestRendering: null,
	renderingFunction: null,
	stopRendering: null,
	switchMark: null,
	switchOnionskin: null,
	switchMirror: null,
	switchSettings: null,
	switchLoop: null,
	planToSave: null,
	saveToConfig: null,
	loadFromConfig: null,
	saveToProject: null,
	loadFromProject: null,
	webglRestored: null,
	windowResize: null,
	themechange: null,
	datachange: null,
	enumchange: null,
	keydown: null,
	headPointerdown: null,
	switchPointerdown: null,
	zoomFocus: null,
	zoomInput: null,
	screenKeydown: null,
	translationKeyup: null,
	screenWheel: null,
	screenUserscroll: null,
	screenBlur: null,
	marqueePointerdown: null,
	marqueePointermove: null,
	marqueePointerleave: null,
	marqueeDoubleclick: null,
	pointerup: null,
	pointermove: null,
	searcherInput: null,
	listKeydown: null,
	listPointerdown: null,
	listSelect: null,
	listRecord: null,
	listOpen: null,
	listPopup: null,
	listChange: null,
	listPageResize: null,
	timelinePageResize: null,
	timelineToolbarPointerdown: null,
	layerListScroll: null,
	layerListKeydown: null,
	layerListPointerdown: null,
	layerListSelect: null,
	layerListRecord: null,
	layerListPopup: null,
	layerListChange: null,
	outerTimelineListKeydown: null,
	outerTimelineListScroll: null,
	outerTimelineListBlur: null,
	outerTimelineListPointerdown: null,
	outerTimelineListPointerup: null,
	outerTimelineListPointermove: null,
	innerTimelineListPointermove: null,
	innerTimelineListPointerleave: null,
	innerTimelineListDblclick: null,
	Player: null
};

// P4b：`page` 走显式元素数据（字段已从 DATA_FIELDS 摘除）
elementDataOf<{ page?: HTMLElement | null }>(Animation.list).page = animationEls.get(
	'animation-motion'
) as YamiElement;
elementDataOf<{ head: HTMLElement }>(Animation.list).head = animationEls.get(
	'animation-list-head'
) as YamiElement;

elementDataOf<{ head: HTMLElement }>(Animation.timeline).head = animationEls.get(
	'animation-timeline-head'
) as YamiElement;

// outerTimelineList properties
// P4b：`dragging` 是 outerTimelineList 元素上的元素数据（原先靠原型访问器透明落到 WeakMap）
elementDataOf<{ dragging: PointerEvent | null }>(Animation.outerTimelineList).dragging = null;
// outerTimelineList methods
Animation.outerTimelineList.restoreMotionAndLayer = null;

// innerTimelineList properties
Animation.innerTimelineList.pointerevent = null;

// timelineCursor properties
Animation.timelineCursor.pointerevent = null;

// timelineMarquee properties
Animation.timelineMarquee.layer = null;
Animation.timelineMarquee.x = -1;
Animation.timelineMarquee.y = -1;
Animation.timelineMarquee.length = -1;
// P4b：`origin` 是 timelineMarquee 元素上的元素数据（原先靠原型访问器透明落到 WeakMap）
elementDataOf<{ origin: number }>(Animation.timelineMarquee).origin = -1;
// timelineMarquee methods
Animation.timelineMarquee.isPointIn = null;
Animation.timelineMarquee.isSelected = null;
Animation.timelineMarquee.isExtendable = null;
Animation.timelineMarquee.isShrinkable = null;

const animationBridgeKeys = [
	'state',
	'target',
	'motion',
	'direction',
	'mode',
	'speed',
	'zoom',
	'showMark',
	'showOnionskin',
	'mirror',
	'loop',
	'playing'
] as const;

for (const key of animationBridgeKeys) {
	Object.defineProperty(Animation, key, {
		get: () => getAnimationStore()[key],
		set: (value: unknown) => {
			(getAnimationStore() as unknown as Record<string, unknown>)[key] = value;
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
