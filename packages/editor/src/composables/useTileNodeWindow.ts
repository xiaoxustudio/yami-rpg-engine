import { relate, getRelativeCoords } from '@app/legacy/util/element-utils';
import { Window } from '@app/legacy/tools/window-object.ts';
import { on, rect, css, addClass } from '@app/legacy/util/element-utils.ts';
import { Timer } from '@app/legacy/util/timer.ts';
import { Scene } from '@app/legacy/scene/scene-window.ts';
import { Cursor } from '@app/legacy/tools/pointer-object.ts';
import { Palette } from '@app/legacy/palette/palette.ts';

type TileNodeMarquee = HTMLElement & {
	visible: boolean;
	x: number;
	y: number;
	width: number;
	height: number;
	scaleX: number;
	scaleY: number;
	select(x?: number, y?: number, width?: number, height?: number): void;
};

type TileNodeDragging = PointerEvent & {
	mode: 'select' | 'scroll';
	screen: HTMLElement;
	scrollLeft: number;
	scrollTop: number;
};

type TileNodeNodes = ArrayLike<{ frames: number[] }>;

interface TileNodeWindow {
	readonly canvas: HTMLCanvasElement;
	readonly screen: HTMLElement;
	readonly marquee: TileNodeMarquee;
	context: CanvasRenderingContext2D | null;
	dragging: TileNodeDragging | null;
	nodes: TileNodeNodes | null;
	image: HTMLImageElement | null;
	offsetX: number | null | undefined;
	offsetY: number | null | undefined;
	hframes: number | null;
	vframes: number | null;
	scrollLeft: number | null;
	scrollTop: number | null;
	scrollRight: number | null;
	scrollBottom: number | null;
	initialize: () => void;
	open: (
		nodes: TileNodeNodes,
		image: HTMLImageElement,
		offsetX?: number,
		offsetY?: number
	) => void;
	updateTransform: () => void;
	updateBackground: (...args: unknown[]) => unknown;
	drawNodes: () => void;
	requestRendering: () => void;
	renderingFunction: () => void;
	stopRendering: () => void;
	scrollToSelection: () => void;
	getDevicePixelClientBoxSize: (element: HTMLElement) => { width: number; height: number };
	dprchange: (event: Event) => void;
	windowClosed: () => void;
	keydown: (event: KeyboardEvent) => void;
	screenScroll: (event: Event) => void;
	marqueePointerdown: (event: PointerEvent) => void;
	pointerup: (event: PointerEvent) => void;
	pointermove: (event: PointerEvent) => void;
}

const getCanvas = (): HTMLCanvasElement =>
	document.getElementById('autoTile-selectNode-canvas') as HTMLCanvasElement;

const getScreen = (): HTMLElement => document.getElementById('autoTile-selectNode-screen')!;

const getMarquee = (): TileNodeMarquee =>
	document.getElementById('autoTile-selectNode-marquee') as unknown as TileNodeMarquee;

let context: CanvasRenderingContext2D | null = null;
let dragging: TileNodeDragging | null = null;
let nodes: TileNodeNodes | null = null;
let image: HTMLImageElement | null = null;
let offsetX: number | null | undefined = null;
let offsetY: number | null | undefined = null;
let hframes: number | null = null;
let vframes: number | null = null;
let scrollLeft: number | null = null;
let scrollTop: number | null = null;
let scrollRight: number | null = null;
let scrollBottom: number | null = null;

const initialize = (): void => {
	const canvas = getCanvas();
	if (!canvas) return;
	context = canvas.getContext('2d');

	window.addEventListener('dprchange', dprchange);
	on(getScreen(), 'scroll', screenScroll);
	on(getMarquee(), 'pointerdown', marqueePointerdown);
};

const open = (
	sourceNodes: TileNodeNodes,
	sourceImage: HTMLImageElement,
	sourceOffsetX?: number,
	sourceOffsetY?: number
): void => {
	const MAX_CONTENT_WIDTH = 1180;
	const MAX_CONTENT_HEIGHT = 696;
	const MIN_CONTENT_WIDTH = 100;
	const MIN_CONTENT_HEIGHT = 100;
	const windowFrame = document.getElementById('autoTile-selectNode')!;
	const screen = getScreen();
	const tileWidth = Palette.tileset.tileWidth;
	const tileHeight = Palette.tileset.tileHeight;
	const nodesArr = sourceNodes as ArrayLike<unknown>;
	const sourceHframes = Math.min(nodesArr.length, 8);
	const sourceVframes = Math.ceil(nodesArr.length / 8);
	const dpr = window.devicePixelRatio;
	const innerWidth = tileWidth * sourceHframes;
	const innerHeight = tileHeight * sourceVframes;
	let contentWidth = innerWidth / dpr;
	let contentHeight = innerHeight / dpr;
	nodes = sourceNodes;
	image = sourceImage;
	offsetX = sourceOffsetX;
	offsetY = sourceOffsetY;
	hframes = sourceHframes;
	vframes = sourceVframes;

	if (contentWidth > MAX_CONTENT_WIDTH) {
		contentHeight += 12;
		screen.style.overflowX = 'scroll';
	} else {
		screen.style.overflowX = 'hidden';
	}
	if (contentHeight > MAX_CONTENT_HEIGHT) {
		contentWidth += 12;
		screen.style.overflowY = 'scroll';
	} else {
		screen.style.overflowY = 'hidden';
	}

	contentWidth = Math.clamp(contentWidth, MIN_CONTENT_WIDTH, MAX_CONTENT_WIDTH);
	contentHeight = Math.clamp(contentHeight, MIN_CONTENT_HEIGHT, MAX_CONTENT_HEIGHT);
	windowFrame.style.width = `${contentWidth}px`;
	windowFrame.style.height = `${contentHeight + 28}px`;
	window.addEventListener('keydown', keydown);
	Window.open!('autoTile-selectNode');

	const screenBox = getDevicePixelClientBoxSize(screen);
	const screenWidth = screenBox.width;
	const screenHeight = screenBox.height;
	const left = Math.max(((screenWidth - innerWidth) >> 1) / dpr, 0);
	const top = Math.max(((screenHeight - innerHeight) >> 1) / dpr, 0);
	const marquee = getMarquee();
	marquee.style.left = `${left}px`;
	marquee.style.top = `${top}px`;
	marquee.style.width = `${innerWidth / dpr}px`;
	marquee.style.height = `${innerHeight / dpr}px`;
	marquee.scaleX = tileWidth / dpr;
	marquee.scaleY = tileHeight / dpr;
	if (Palette.explicit) {
		marquee.select();
	} else {
		marquee.select(0, 0, 1, 1);
	}

	const canvasWidth = Math.min(innerWidth, screenWidth);
	const canvasHeight = Math.min(innerHeight, screenHeight);
	const canvas = getCanvas();
	canvas.style.left = `${left}px`;
	canvas.style.top = `${top}px`;
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
	canvas.style.width = `${canvasWidth / dpr}px`;
	canvas.style.height = `${canvasHeight / dpr}px`;

	scrollToSelection();
	updateTransform();
	requestRendering();
};

const updateTransform = (): void => {
	const dpr = window.devicePixelRatio;
	scrollLeft = getScreen().scrollLeft * dpr;
	scrollTop = getScreen().scrollTop * dpr;
	scrollRight = scrollLeft + getCanvas().width;
	scrollBottom = scrollTop + getCanvas().height;
	context!.setTransform(1, 0, 0, 1, -scrollLeft, -scrollTop);
};

const updateBackground = (...args: unknown[]): unknown => {
	return Palette.updateBackground(...args);
};

const drawNodes = (): void => {
	if (!nodes) return;
	const drawContext = context!;
	const tileset = Palette.tileset;
	const drawImage = image!;
	const drawNodesSource = nodes;
	const length = drawNodesSource.length;
	const tw = tileset.tileWidth;
	const th = tileset.tileHeight;
	const ox = offsetX!;
	const oy = offsetY!;
	const sl = scrollLeft!;
	const st = scrollTop!;
	const sr = scrollRight!;
	const sb = scrollBottom!;
	const bx = Math.max(Math.floor(sl / tw), 0);
	const by = Math.max(Math.floor(st / th), 0);
	const ex = Math.min(Math.ceil(sr / tw), hframes!);
	const ey = Math.min(Math.ceil(sb / th), vframes!);
	drawContext.clearRect(sl, st, sr - sl, sb - st);
	for (let y = by; y < ey; y++) {
		for (let x = bx; x < ex; x++) {
			const i = x | (y << 3);
			if (i < length) {
				const frame = drawNodesSource[i].frames[0];
				const sx = (ox + (frame & 0xff)) * tw;
				const sy = (oy + (frame >> 8)) * th;
				const dx = x * tw;
				const dy = y * th;
				drawContext.drawImage(drawImage, sx, sy, tw, th, dx, dy, tw, th);
			}
		}
	}
};

const requestRendering = (): void => {
	if (nodes !== null) {
		Timer.appendUpdater!('sharedRendering', renderingFunction);
	}
};

const renderingFunction = (): void => {
	drawNodes();
};

const stopRendering = (): void => {
	Timer.removeUpdater!('sharedRendering', renderingFunction);
};

const scrollToSelection = (): void => {
	const marquee = getMarquee();
	if (marquee.visible) {
		const screen = getScreen();
		const tw = marquee.scaleX;
		const th = marquee.scaleY;
		const ml = marquee.x * tw;
		const mt = marquee.y * th;
		const mr = ml + tw;
		const mb = mt + th;
		const cw = screen.clientWidth;
		const ch = screen.clientHeight;
		const sl = screen.scrollLeft;
		const st = screen.scrollTop;
		const x = Math.min(Math.max(sl, mr - cw), ml);
		const y = Math.min(Math.max(st, mb - ch), mt);
		if (sl !== x || st !== y) {
			screen.scroll(x, y);
		}
	}
};

const getDevicePixelClientBoxSize = (element: HTMLElement): { width: number; height: number } => {
	const elementRect = rect(element);
	const elementCss = css(element);
	if (elementCss.overflowX === 'scroll') {
		Object.defineProperty(elementRect, 'bottom', {
			value: elementRect.bottom - 12
		});
	}
	if (elementCss.overflowY === 'scroll') {
		Object.defineProperty(elementRect, 'right', {
			value: elementRect.right - 12
		});
	}
	const dpr = window.devicePixelRatio;
	const left = Math.round(elementRect.left * dpr + 1e-5);
	const right = Math.round(elementRect.right * dpr + 1e-5);
	const top = Math.round(elementRect.top * dpr + 1e-5);
	const bottom = Math.round(elementRect.bottom * dpr + 1e-5);
	const width = right - left;
	const height = bottom - top;
	return { width, height };
};

const dprchange = (event: Event): void => {
	if (nodes !== null) {
		const marquee = getMarquee();
		const { x, y, width, height } = marquee;
		open(nodes, image!);
		marquee.select(x, y, width, height);
	}
};

const windowClosed = (): void => {
	nodes = null;
	image = null;
	getCanvas().width = 0;
	getCanvas().height = 0;
	stopRendering();
	if (dragging) {
		pointerup(dragging);
	}
	window.removeEventListener('keydown', keydown);
};

const keydown = (event: KeyboardEvent): void => {
	event.preventDefault();
	if (dragging) {
		return;
	}
	switch (event.code) {
		case 'Enter':
		case 'NumpadEnter': {
			const { x, y } = getMarquee();
			const tiles =
				Scene.marquee.key === 'tile'
					? Scene.marquee.tiles
					: Scene.marquee.saveData.tile.tiles;
			const length = tiles.length;
			for (let i = 0; i < length; i++) {
				if (tiles[i] !== 0) {
					tiles[i] &= 0xffffffc0;
					tiles[i] |= x | (y << 3);
					break;
				}
			}
			Palette.explicit = true;
			addClass(Palette.marquee, 'explicit');
			Window.close!('autoTile-selectNode');
			break;
		}
		case 'ArrowLeft':
		case 'ArrowUp':
		case 'ArrowRight':
		case 'ArrowDown': {
			let offsetXArrow = 0;
			let offsetYArrow = 0;
			switch (event.code) {
				case 'ArrowLeft':
					offsetXArrow = -1;
					break;
				case 'ArrowUp':
					offsetYArrow = -1;
					break;
				case 'ArrowRight':
					offsetXArrow = +1;
					break;
				case 'ArrowDown':
					offsetYArrow = +1;
					break;
			}
			const marquee = getMarquee();
			const x = Math.clamp(marquee.x + offsetXArrow, 0, hframes! - 1);
			const y = Math.clamp(marquee.y + offsetYArrow, 0, vframes! - 1);
			if (marquee.x !== x || marquee.y !== y) {
				const index = x | (y << 3);
				if (index < nodes!.length) {
					marquee.select(x, y, 1, 1);
					scrollToSelection();
				}
			}
			break;
		}
	}
};

const screenScroll = (event: Event): void => {
	updateTransform();
	updateBackground();
	requestRendering();
};

const marqueePointerdown = (event: PointerEvent): void => {
	if (dragging) {
		return;
	}
	switch (event.button) {
		case 0: {
			if (event.altKey) {
				dragging = event as unknown as TileNodeDragging;
				dragging.mode = 'scroll';
				dragging.screen = (event.target as HTMLElement).parentNode as HTMLElement;
				dragging.scrollLeft = dragging.screen.scrollLeft;
				dragging.scrollTop = dragging.screen.scrollTop;
				Cursor.open('cursor-grab');
				window.addEventListener('pointerup', pointerup);
				window.addEventListener('pointermove', pointermove);
				return;
			}
			const marquee = getMarquee();
			const coords = getRelativeCoords(event, marquee);
			const x = Math.floor(coords.x / marquee.scaleX);
			const y = Math.floor(coords.y / marquee.scaleY);
			const index = x | (y << 3);
			if (index < nodes!.length) {
				marquee.select(x, y, 1, 1);
				dragging = event as unknown as TileNodeDragging;
				dragging.mode = 'select';
				window.addEventListener('pointerup', pointerup);
			}
			break;
		}
		case 2:
			dragging = event as unknown as TileNodeDragging;
			dragging.mode = 'scroll';
			dragging.screen = (event.target as HTMLElement).parentNode as HTMLElement;
			dragging.scrollLeft = dragging.screen.scrollLeft;
			dragging.scrollTop = dragging.screen.scrollTop;
			Cursor.open('cursor-grab');
			window.addEventListener('pointerup', pointerup);
			window.addEventListener('pointermove', pointermove);
			break;
	}
};

const pointerup = (event: PointerEvent): void => {
	const currentDragging = dragging;
	if (currentDragging && relate(currentDragging, event)) {
		switch (currentDragging.mode) {
			case 'select': {
				const marquee = getMarquee();
				if (event.target === marquee) {
					const coords = getRelativeCoords(event, marquee);
					const x = Math.floor(coords.x / marquee.scaleX);
					const y = Math.floor(coords.y / marquee.scaleY);
					if (marquee.x === x && marquee.y === y) {
						const tiles =
							Scene.marquee.key === 'tile'
								? Scene.marquee.tiles
								: Scene.marquee.saveData.tile.tiles;
						const length = tiles.length;
						for (let i = 0; i < length; i++) {
							if (tiles[i] !== 0) {
								tiles[i] &= 0xffffffc0;
								tiles[i] |= x | (y << 3);
								break;
							}
						}
						Palette.explicit = true;
						addClass(Palette.marquee, 'explicit');
						Window.close!('autoTile-selectNode');
					}
				}
				break;
			}
			case 'scroll':
				Cursor.close('cursor-grab');
				break;
		}
		dragging = null;
		window.removeEventListener('pointerup', pointerup);
		window.removeEventListener('pointermove', pointermove);
	}
};

const pointermove = (event: PointerEvent): void => {
	const currentDragging = dragging;
	if (currentDragging && relate(currentDragging, event)) {
		switch (currentDragging.mode) {
			case 'scroll':
				currentDragging.screen.scrollLeft =
					currentDragging.scrollLeft + currentDragging.clientX - event.clientX;
				currentDragging.screen.scrollTop =
					currentDragging.scrollTop + currentDragging.clientY - event.clientY;
				break;
		}
	}
};

export function useTileNodeWindow(): TileNodeWindow {
	return {
		get canvas() {
			return getCanvas();
		},
		get screen() {
			return getScreen();
		},
		get marquee() {
			return getMarquee();
		},
		get context() {
			return context;
		},
		get dragging() {
			return dragging;
		},
		get nodes() {
			return nodes;
		},
		get image() {
			return image;
		},
		get offsetX() {
			return offsetX;
		},
		get offsetY() {
			return offsetY;
		},
		get hframes() {
			return hframes;
		},
		get vframes() {
			return vframes;
		},
		get scrollLeft() {
			return scrollLeft;
		},
		get scrollTop() {
			return scrollTop;
		},
		get scrollRight() {
			return scrollRight;
		},
		get scrollBottom() {
			return scrollBottom;
		},
		initialize,
		open,
		updateTransform,
		updateBackground,
		drawNodes,
		requestRendering,
		renderingFunction,
		stopRendering,
		scrollToSelection,
		getDevicePixelClientBoxSize,
		dprchange,
		windowClosed,
		keydown,
		screenScroll,
		marqueePointerdown,
		pointerup,
		pointermove
	};
}
