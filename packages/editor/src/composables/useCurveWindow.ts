import { animationEls } from '@app/animation/element-registry';
import { addClass, hide, on, rect, removeClass, show, write } from '@app/utils/element-utils.ts';
import { Timer } from '@app/utils/timer';
import { Animation } from '@app/animation/animation-window.ts';
import { Data } from '@app/data/data-object.ts';
import { Easing } from '@app/data/transition-window.ts';
import { headNavOf, lastNavItemOf } from '@app/engine/layout/layout.ts';

export type CurveState = 'closed' | 'open' | 'suspended';

export interface CurveFrame {
	easingId?: string;
	key: HTMLElement & { easing?: boolean };
}

export type CurveCanvas = HTMLCanvasElement & {
	context?: CanvasRenderingContext2D;
	gridColor?: string;
	axisColor?: string;
	textColor?: string;
	curveColor?: string;
};

export type CurveList = HTMLElement & {
	defaultItem: { name: string; value: string };
	setItemNames: ((options: Record<string, string>) => void) | null;
	dataValue: string | null;
	data: unknown;
	loadItems(items: unknown[]): void;
	update(): void;
};

type CurveMapInstance = Float64Array & {
	count: number;
	[i: number]: number;
	update(...points: unknown[]): void;
};

interface CurveWindow {
	state: CurveState;
	page: HTMLElement | null;
	head: HTMLElement | null;
	list: CurveList | null;
	canvas: CurveCanvas | null;
	target: CurveFrame | null;
	index: number | null | '';
	curveMap: CurveMapInstance | null;
	initialize: () => void;
	open: () => void;
	load: (...args: unknown[]) => void;
	close: () => void;
	suspend: () => void;
	resume: () => void;
	updateHead: () => void;
	updateEasingOptions: () => void;
	updateTimeline: (target: CurveFrame) => void;
	resize: () => void;
	drawCurve: () => void;
	requestRendering: () => void;
	renderingFunction: () => void;
	stopRendering: () => void;
	windowResize: (event?: Event) => void;
	themechange: (event: Event) => void;
	datachange: (event: Event) => void;
	easingIdWrite: (event: Event) => void;
	easingIdInput: (event: Event) => void;
	settingsPointerdown: (event: PointerEvent) => void;
}

let state: CurveState = 'closed';
let page: HTMLElement | null = null;
let head: HTMLElement | null = null;
let list: CurveList | null = null;
let canvas: CurveCanvas | null = null;
let target: CurveFrame | null = null;
let index: number | null | '' = null;
let curveMap: CurveMapInstance | null = null;

const initialize = (): void => {
	page = animationEls.get('animation-easing') ?? null;
	head = animationEls.get('animation-easing-head') ?? null;
	list = animationEls.get('animation-easing-id') as unknown as CurveList;
	canvas = animationEls.get('animation-easing-canvas') as unknown as CurveCanvas;
	hide(page);
	hide(list);

	curveMap = new Easing.CurveMap!();

	list.defaultItem = { name: 'No Easing', value: '' };

	list.setItemNames = function (
		this: HTMLElement & {
			defaultItem?: { name: string; value: string };
			dataValue?: unknown;
			update?: () => void;
		},
		options: Record<string, string>
	) {
		const item = this.defaultItem!;
		const key = item.value;
		const name = options[key];
		if (name !== undefined) {
			item.name = name;
		}
		if (this.dataValue !== null) {
			this.update?.();
		}
	};

	window.addEventListener('themechange', themechange as unknown as EventListener);
	window.addEventListener('datachange', datachange as unknown as EventListener);
	on(page!, 'resize', windowResize as unknown as (event?: Event) => void);
	on(
		animationEls.get('animation-easing-settings'),
		'pointerdown',
		settingsPointerdown as unknown as (event: PointerEvent) => void
	);
};

const open = (): void => {
	if (state === 'closed') {
		state = 'open';
		show(page!);
		windowResize();
		updateEasingOptions();
	}
};

const load = (...args: unknown[]): void => {
	const frame = args[0] as CurveFrame;
	if (target !== frame) {
		target = frame;
		if (frame) {
			show(list!);
			write(list, frame.easingId);
		} else {
			hide(list!);
			index = null;
			requestRendering();
		}
	}
};

const close = (): void => {
	if (state !== 'closed') {
		state = 'closed';
		hide(page!);
		stopRendering();
	}
};

const suspend = (): void => {
	if (state === 'open') {
		state = 'suspended';
		stopRendering();
	}
};

const resume = (): void => {
	if (state === 'suspended') {
		state = 'open';
		resize();
		requestRendering();
	}
};

const updateHead = (): void => {
	if (page!.clientWidth !== 0) {
		const nav = headNavOf(head);
		const item = lastNavItemOf(nav);
		if (!nav || !item) return;
		const nRect = rect(nav);
		const iRect = rect(item);
		const left = iRect.right - nRect.left;
		head!.style.left = `${left}px`;
	}
};

const updateEasingOptions = (): void => {
	const currentList = list!;
	const { easings } = Data;
	if (currentList.data !== easings) {
		currentList.data = easings;
		const headItem = currentList.defaultItem;
		const items = Data.createEasingItems!();
		currentList.loadItems([headItem, ...items]);
	}
};

const updateTimeline = (frameTarget: CurveFrame): void => {
	const easing = !!frameTarget.easingId;
	const { key } = frameTarget;
	if (key.easing !== easing) {
		key.easing = easing;
		if (easing) {
			addClass(key, 'easing');
		} else {
			removeClass(key, 'easing');
		}
	}
};

const resize = (): void => {
	if (state === 'open') {
		const screenBox = CSS.getDevicePixelContentBoxSize(page!);
		const screenWidth = screenBox.width;
		const screenHeight = screenBox.height;

		if (canvas!.width !== screenWidth || canvas!.height !== screenHeight) {
			canvas!.width = screenWidth;
			canvas!.height = screenHeight;
		}
	}
};

const drawCurve = (): void => {
	const currentCanvas = canvas!;
	const width = currentCanvas.width;
	const height = currentCanvas.height;
	if (width * height === 0) {
		return;
	}
	const centerX = width >> 1;
	const centerY = height >> 1;
	const spacing = Math.floor(Math.min(width, height) / 12);
	const originX = centerX - spacing * 5;
	const originY = centerY + spacing * 5;
	const fullSize = spacing * 10;

	let { context } = currentCanvas;
	if (!context) {
		context = currentCanvas.context = currentCanvas.getContext('2d', {
			desynchronized: true
		}) as CanvasRenderingContext2D;
	}
	const ctx = context;
	ctx.clearRect(0, 0, width, height);

	ctx.strokeStyle = currentCanvas.gridColor!;
	ctx.setLineDash([1]);
	for (let y = originY % spacing; y < height; y += spacing) {
		ctx.beginPath();
		ctx.moveTo(0, y + 0.5);
		ctx.lineTo(width, y + 0.5);
		ctx.stroke();
	}
	for (let x = originX % spacing; x < width; x += spacing) {
		ctx.beginPath();
		ctx.moveTo(x + 0.5, 0);
		ctx.lineTo(x + 0.5, height);
		ctx.stroke();
	}

	ctx.strokeStyle = currentCanvas.axisColor!;
	ctx.beginPath();
	ctx.moveTo(originX, originY - fullSize + 0.5);
	ctx.lineTo(originX + fullSize + 0.5, originY - fullSize + 0.5);
	ctx.lineTo(originX + fullSize + 0.5, originY);
	ctx.stroke();

	ctx.strokeStyle = currentCanvas.axisColor!;
	ctx.setLineDash([]);
	ctx.beginPath();
	ctx.moveTo(0, originY + 0.5);
	ctx.lineTo(width, originY + 0.5);
	ctx.moveTo(originX + 0.5, 0);
	ctx.lineTo(originX + 0.5, height);
	ctx.stroke();

	ctx.textBaseline = 'top';
	ctx.font = '12px Arial';
	ctx.fillStyle = currentCanvas.textColor!;
	ctx.fillText('TIME', originX + 4, originY + 4);
	ctx.translate(originX, originY);
	ctx.rotate((Math.PI * 3) / 2);
	ctx.fillText('PROGRESSION', 4, -12);
	ctx.setTransform(1, 0, 0, 1, 0, 0);

	switch (index) {
		case null:
			break;
		case '':
			ctx.lineWidth = 2;
			ctx.strokeStyle = currentCanvas.curveColor!;
			ctx.beginPath();
			ctx.moveTo(originX + 0.5, originY + 0.5);
			ctx.lineTo(originX + fullSize + 0.5, originY + 0.5);
			ctx.lineTo(originX + fullSize + 0.5, originY - fullSize + 0.5);
			ctx.stroke();
			ctx.lineWidth = 1;
			break;
		default: {
			ctx.lineWidth = 2;
			ctx.strokeStyle = currentCanvas.curveColor!;
			ctx.beginPath();
			ctx.moveTo(originX + 0.5, originY + 0.5);
			const count = curveMap!.count;
			for (let i = 2; i < count; i += 2) {
				ctx.lineTo(
					originX + curveMap![i] * fullSize + 0.5,
					originY - curveMap![i + 1] * fullSize + 0.5
				);
			}
			ctx.stroke();
			ctx.lineWidth = 1;
			break;
		}
	}
};

const requestRendering = (): void => {
	if (state === 'open') {
		Timer.appendUpdater!('sharedRendering2', renderingFunction as (deltaTime: number) => void);
	}
};

const renderingFunction = (): void => {
	drawCurve();
};

const stopRendering = (): void => {
	Timer.removeUpdater!('sharedRendering2', renderingFunction as (deltaTime: number) => void);
};

const windowResize = (_event?: Event): void => {
	if (page!.clientWidth === 0) {
		return suspend();
	}
	updateHead();
	switch (state) {
		case 'open':
			resize();
			requestRendering();
			break;
		case 'suspended':
			resume();
			break;
	}
};

const themechange = (event: Event): void => {
	const currentCanvas = canvas!;
	switch (event.value) {
		case 'light':
			currentCanvas.textColor = '#808080';
			currentCanvas.gridColor = '#c0c0c0';
			currentCanvas.axisColor = '#606060';
			currentCanvas.curveColor = '#202020';
			break;
		case 'dark':
			currentCanvas.textColor = '#808080';
			currentCanvas.gridColor = '#404040';
			currentCanvas.axisColor = '#808080';
			currentCanvas.curveColor = '#d8d8d8';
			break;
	}
	requestRendering();
};

const datachange = (event: Event): void => {
	if (state === 'open' && event.key === 'easings') {
		updateEasingOptions();
		const currentIndex = index;
		if (currentIndex !== null) {
			index = null;
			write(list, currentIndex);
		}
	}
};

const easingIdWrite = (event: Event): void => {
	const id = event.value;
	if (index !== id) {
		index = id;
		requestRendering();
		if (id !== '') {
			const easing = Data.easings.map[id];
			const points = easing?.points ?? [
				{ x: 0, y: 0 },
				{ x: 1, y: 1 }
			];
			const { startPoint, endPoint } = Easing;
			(curveMap as unknown as { update(...pts: unknown[]): void }).update(
				startPoint,
				...points,
				endPoint
			);
		}
	}
};

const easingIdInput = (event: Event): void => {
	Animation.planToSave!();
	Animation.history.save({
		type: 'animation-easing-change',
		motion: Animation.motion,
		direction: Animation.direction,
		target: target!,
		easingId: target!.easingId
	});
	target!.easingId = event.value;
	updateTimeline(target!);
};

const settingsPointerdown = (_event: PointerEvent): void => {
	Easing.open!();
};

export function useCurveWindow(): CurveWindow {
	return {
		get state() {
			return state;
		},
		get page() {
			return page;
		},
		get head() {
			return head;
		},
		get list() {
			return list;
		},
		get canvas() {
			return canvas;
		},
		get target() {
			return target;
		},
		get index() {
			return index;
		},
		get curveMap() {
			return curveMap;
		},
		initialize,
		open,
		load,
		close,
		suspend,
		resume,
		updateHead,
		updateEasingOptions,
		updateTimeline,
		resize,
		drawCurve,
		requestRendering,
		renderingFunction,
		stopRendering,
		windowResize,
		themechange,
		datachange,
		easingIdWrite,
		easingIdInput,
		settingsPointerdown
	};
}
