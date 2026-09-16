import { screenScrollData } from '../screen-scroll-data';
import { relate, getRelativeCoords } from '@app/utils/element-utils';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { engineEls } from '@app/engine/element-registry';
import { addScrollbars, on, show, hide, clear, read, write } from '@app/utils/element-utils.ts';
import { Timer } from '@app/utils/timer';
import { Inspector } from '@app/inspector/inspector.ts';
import { Cursor } from '@app/composables/usePointerObjectWindow';
import { Animation } from '@app/animation/animation-window.ts';
import { Palette } from '@app/palette/palette.ts';
import type { EditorProjectShape } from '@app/stores/editor';

interface SpriteScreen extends HTMLElement {
	rawScrollLeft: number;
	rawScrollTop: number;
}

interface SpriteMarquee extends HTMLElement {
	visible: boolean;
	x: number;
	y: number;
	width: number;
	height: number;
	scaleX?: number;
	scaleY?: number;
	select(...args: unknown[]): void;
}

interface SpriteModule {
	state: 'closed' | 'open' | 'suspended' | 'loading';
	body: HTMLElement;
	window: HTMLElement;
	canvas: HTMLCanvasElement & { dpr?: number };
	context: CanvasRenderingContext2D;
	info: HTMLElement;
	slider: HTMLElement;
	screen: SpriteScreen;
	marquee: SpriteMarquee;
	symbol: symbol | null;
	target: { spriteX: number; spriteY: number } | null;
	hframes: number;
	vframes: number;
	image: CanvasImageSource | null;
	dragging: PointerEvent | null;
	showGrid: boolean;
	gridColor: string;
	zoom: number | null;
	zoomTimer: Timer;
	scale: number;
	scaleX: number;
	scaleY: number;
	scaledUnitWidth: number;
	scaledUnitHeight: number;
	unitWidth: number;
	unitHeight: number;
	outerWidth: number;
	outerHeight: number;
	screenWidth: number;
	screenHeight: number;
	scrollLeft: number;
	scrollTop: number;
	scrollRight: number;
	scrollBottom: number;
	centerOffsetX: number;
	centerOffsetY: number;
	paddingLeft: number;
	paddingTop: number;
	centerX: number;
	centerY: number;
	initialize: () => void;
	open: (target: { spriteX: number; spriteY: number } | null) => void;
	close: () => void;
	suspend: () => void;
	resume: () => void;
	setZoom: (zoom: number) => void;
	loadImage: () => Promise<void>;
	updateTargetInfo: () => void;
	resize: () => void;
	getUnitCoords: (event: PointerEvent) => { x: number; y: number };
	updateCamera: (x?: number, y?: number) => void;
	updateTransform: () => void;
	updateBackground: () => void;
	drawSprite: () => void;
	drawSpriteLayer: () => void;
	drawGridLayer: () => void;
	selectSprite: (hindex: number, vindex: number) => void;
	scrollToSelection: () => void;
	requestRendering: () => void;
	renderingFunction: () => void;
	stopRendering: () => void;
	saveToProject: (project: EditorProjectShape) => void;
	loadFromProject: (project: EditorProjectShape) => void;
	windowResize: (event: Event) => void;
	themechange: (event: Event) => void;
	zoomFocus: (event: Event) => void;
	zoomInput: (event: Event) => void;
	screenKeydown: (event: KeyboardEvent) => void;
	screenWheel: (event: WheelEvent) => void;
	screenUserscroll: (event: Event) => void;
	marqueePointerdown: (event: PointerEvent & { dragKey?: boolean }) => void;
	pointerup: (event: PointerEvent) => void;
	pointermove: (event: PointerEvent) => void;
}

export const Sprite: SpriteModule = {
	state: 'closed',
	body: null as unknown as HTMLElement,
	window: null as unknown as HTMLElement,
	canvas: null as unknown as HTMLCanvasElement & { dpr?: number },
	context: null as unknown as CanvasRenderingContext2D,
	info: null as unknown as HTMLElement,
	slider: null as unknown as HTMLElement,
	screen: null as unknown as SpriteScreen,
	marquee: null as unknown as SpriteMarquee,
	symbol: null,
	target: null,
	hframes: null as unknown as number,
	vframes: null as unknown as number,
	image: null,
	dragging: null,
	showGrid: true,
	gridColor: null as unknown as string,
	zoom: null,
	zoomTimer: null as unknown as Timer,
	scale: null as unknown as number,
	scaleX: null as unknown as number,
	scaleY: null as unknown as number,
	scaledUnitWidth: null as unknown as number,
	scaledUnitHeight: null as unknown as number,
	unitWidth: null as unknown as number,
	unitHeight: null as unknown as number,
	outerWidth: null as unknown as number,
	outerHeight: null as unknown as number,
	screenWidth: null as unknown as number,
	screenHeight: null as unknown as number,
	scrollLeft: null as unknown as number,
	scrollTop: null as unknown as number,
	scrollRight: null as unknown as number,
	scrollBottom: null as unknown as number,
	centerOffsetX: null as unknown as number,
	centerOffsetY: null as unknown as number,
	paddingLeft: null as unknown as number,
	paddingTop: null as unknown as number,
	centerX: null as unknown as number,
	centerY: null as unknown as number,
	initialize: null as unknown as () => void,
	open: null as unknown as (target: { spriteX: number; spriteY: number } | null) => void,
	close: null as unknown as () => void,
	suspend: null as unknown as () => void,
	resume: null as unknown as () => void,
	setZoom: null as unknown as (zoom: number) => void,
	loadImage: null as unknown as () => Promise<void>,
	updateTargetInfo: null as unknown as () => void,
	resize: null as unknown as () => void,
	getUnitCoords: null as unknown as (event: PointerEvent) => { x: number; y: number },
	updateCamera: null as unknown as (x?: number, y?: number) => void,
	updateTransform: null as unknown as () => void,
	updateBackground: Palette?.updateBackground ?? (() => {}),
	drawSprite: null as unknown as () => void,
	drawSpriteLayer: null as unknown as () => void,
	drawGridLayer: null as unknown as () => void,
	selectSprite: null as unknown as (hindex: number, vindex: number) => void,
	scrollToSelection: null as unknown as () => void,
	requestRendering: null as unknown as () => void,
	renderingFunction: null as unknown as () => void,
	stopRendering: null as unknown as () => void,
	saveToProject: null as unknown as (project: EditorProjectShape) => void,
	loadFromProject: null as unknown as (project: EditorProjectShape) => void,
	windowResize: null as unknown as (event: Event) => void,
	themechange: null as unknown as (event: Event) => void,
	zoomFocus: null as unknown as (event: Event) => void,
	zoomInput: null as unknown as (event: Event) => void,
	screenKeydown: null as unknown as (event: KeyboardEvent) => void,
	screenWheel: null as unknown as (event: WheelEvent) => void,
	screenUserscroll: null as unknown as (event: Event) => void,
	marqueePointerdown: null as unknown as (event: PointerEvent & { dragKey?: boolean }) => void,
	pointerup: null as unknown as (event: PointerEvent) => void,
	pointermove: null as unknown as (event: PointerEvent) => void
};

Sprite.initialize = function (this: typeof Sprite) {
	this.body = engineEls.get('sprite-body') as HTMLElement;
	this.window = engineEls.get('sprite-frame') as HTMLElement;
	hide(this.window);
	this.canvas = engineEls.get('sprite-canvas') as HTMLElement as HTMLCanvasElement & {
		dpr?: number;
	};
	this.info = engineEls.get('sprite-info') as HTMLElement;
	this.slider = engineEls.get('sprite-zoom') as HTMLElement;
	this.screen = engineEls.get('sprite-screen') as HTMLElement as SpriteScreen;
	this.marquee = engineEls.get('sprite-marquee') as HTMLElement as SpriteMarquee;
	addScrollbars(this.screen);

	this.context = this.canvas.getContext('2d', { desynchronized: true })!;

	this.zoomTimer = new Timer({
		duration: 80,
		update: (timer) => {
			if (this.state === 'open') {
				const { elapsed, duration, start, end } = timer;
				const time = elapsed / duration;
				this.scale = start * (1 - time) + end * time;
				this.resize();
				this.requestRendering();
			} else {
				this.scale = timer.end;
				return false;
			}
		}
	});

	window.addEventListener('themechange', this.themechange);
	on(inspectorEls.get('animSpriteFrame-vue-mount') as HTMLElement, 'resize', this.windowResize);
	on(
		engineEls.get('animSpriteFrame-properties-detail') as HTMLElement,
		'toggle',
		this.windowResize
	);
	on(engineEls.get('animSpriteFrame-sprite-detail') as HTMLElement, 'toggle', this.windowResize);
	on(this.screen, 'userscroll', this.screenUserscroll);
};

Sprite.open = function (this: typeof Sprite, target: { spriteX: number; spriteY: number } | null) {
	if (this.target !== target) {
		this.close();
		if (Animation.timelineMarquee.layer.sprite) {
			this.state = 'loading';
			this.target = target;
			void this.loadImage();
		}
	}
};

Sprite.close = function (this: typeof Sprite) {
	if (this.state !== 'closed') {
		this.state = 'closed';
		this.symbol = null;
		this.target = null;
		this.image = null;
		hide(this.window);
		clear(this.info);
		clear(this.marquee);
		this.stopRendering();
	}
};

Sprite.suspend = function (this: typeof Sprite) {
	if (this.state === 'open') {
		this.state = 'suspended';
		hide(this.info);
		hide(this.slider);
		this.stopRendering();
	}
};

Sprite.resume = function (this: typeof Sprite) {
	if (this.state === 'suspended') {
		this.state = 'open';
		show(this.info);
		show(this.slider);
		this.resize();
		this.requestRendering();
	}
};

Sprite.setZoom = (function IIFE() {
	return function (this: typeof Sprite, zoom: number) {
		if (this.zoom !== zoom) {
			let scale;
			switch (zoom) {
				case 0:
					scale = 0.25;
					break;
				case 1:
					scale = 0.5;
					break;
				case 2:
					scale = 1;
					break;
				case 3:
					scale = 2;
					break;
				case 4:
					scale = 4;
					break;
				default:
					return;
			}
			this.zoom = zoom;
			if (this.slider) write(this.slider, zoom);
			if (this.state === 'open') {
				const timer = this.zoomTimer;
				timer.start = this.scale;
				timer.end = scale;
				timer.elapsed = 0;
				timer.add();
			} else {
				this.scale = scale;
			}
		}
	};
})();

Sprite.loadImage = async function (this: typeof Sprite) {
	const symbol = (this.symbol = Symbol());
	const name = Animation.timelineMarquee.layer.sprite;
	let texture = Animation.player.textures[name];
	if (texture instanceof Promise) {
		texture = await texture;
	}
	if (this.symbol === symbol) {
		this.symbol = null;
		if (!texture) {
			return this.close();
		}
		const { image } = texture.base;
		this.image = image;
		this.hframes = texture.hframes;
		this.vframes = texture.vframes;
		this.unitWidth = texture.width;
		this.unitHeight = texture.height;
		show(this.window);
		if (this.body.clientWidth > 0) {
			this.state = 'open';
			this.resize();
			this.requestRendering();
		} else {
			this.state = 'suspended';
		}
	}
};

Sprite.updateTargetInfo = function (this: typeof Sprite) {
	const { target } = this;
	if (target) {
		const x = target.spriteX;
		const y = target.spriteY;
		const uw = this.unitWidth;
		const uh = this.unitHeight;
		this.info.textContent = `${x},${y} [${uw}x${uh}]`;
	}
};

Sprite.resize = function (this: typeof Sprite) {
	if (this.state === 'open') {
		const scale = this.scale;
		const scaledUnitWidth = Math.round(this.unitWidth * scale);
		const scaledUnitHeight = Math.round(this.unitHeight * scale);
		const innerWidth = this.hframes * scaledUnitWidth;
		const innerHeight = this.vframes * scaledUnitHeight;
		const screenBox = CSS.getDevicePixelContentBoxSize(this.screen);
		const screenWidth = screenBox.width;
		const screenHeight = screenBox.height;
		const paddingLeft = Math.max((screenWidth - innerWidth) >> 1, 0);
		const paddingTop = Math.max((screenHeight - innerHeight) >> 1, 0);
		const outerWidth = Math.max(innerWidth, screenWidth);
		const outerHeight = Math.max(innerHeight, screenHeight);
		const dpr = window.devicePixelRatio;
		this.scaleX = scaledUnitWidth / this.unitWidth;
		this.scaleY = scaledUnitHeight / this.unitHeight;
		this.scaledUnitWidth = scaledUnitWidth;
		this.scaledUnitHeight = scaledUnitHeight;
		this.outerWidth = outerWidth;
		this.outerHeight = outerHeight;
		this.screenWidth = screenWidth;
		this.screenHeight = screenHeight;
		this.centerOffsetX =
			outerWidth > screenWidth ? screenWidth / 2 : paddingLeft + innerWidth / 2;
		this.centerOffsetY =
			outerHeight > screenHeight ? screenHeight / 2 : paddingTop + innerHeight / 2;
		this.paddingLeft = paddingLeft;
		this.paddingTop = paddingTop;

		this.marquee.style.left = `${paddingLeft / dpr}px`;
		this.marquee.style.top = `${paddingTop / dpr}px`;
		this.marquee.style.width = `${innerWidth / dpr}px`;
		this.marquee.style.height = `${innerHeight / dpr}px`;
		this.marquee.scaleX = scaledUnitWidth / dpr;
		this.marquee.scaleY = scaledUnitHeight / dpr;

		if (this.marquee.visible) {
			this.marquee.select();
		} else {
			const target = this.target!;
			const hindex = target.spriteX;
			const vindex = target.spriteY;
			this.centerX = hindex + 0.5;
			this.centerY = vindex + 0.5;
			this.marquee.select(hindex, vindex, 1, 1);
			this.updateTargetInfo();
		}

		const canvasWidth = Math.min(innerWidth, screenWidth);
		const canvasHeight = Math.min(innerHeight, screenHeight);
		this.canvas.style.left = `${paddingLeft / dpr}px`;
		this.canvas.style.top = `${paddingTop / dpr}px`;
		if (
			this.canvas.dpr !== dpr ||
			this.canvas.width !== canvasWidth ||
			this.canvas.height !== canvasHeight
		) {
			this.canvas.dpr = dpr;
			this.canvas.width = canvasWidth;
			this.canvas.height = canvasHeight;
			this.canvas.style.width = `${canvasWidth / dpr}px`;
			this.canvas.style.height = `${canvasHeight / dpr}px`;
			this.context.imageSmoothingEnabled = false;
		}
		this.updateCamera();
		this.updateTransform();
		this.screen.updateScrollbars();
	}
};

Sprite.getUnitCoords = (function IIFE() {
	const point = { x: 0, y: 0 };
	return function (this: typeof Sprite, event: PointerEvent) {
		const coords = getRelativeCoords(event, this.marquee);
		const suw = this.scaledUnitWidth;
		const suh = this.scaledUnitHeight;
		const dpr = window.devicePixelRatio;
		point.x = Math.clamp(Math.floor((coords.x * dpr) / suw), 0, this.hframes - 1);
		point.y = Math.clamp(Math.floor((coords.y * dpr) / suh), 0, this.vframes - 1);
		return point;
	};
})();

Sprite.updateCamera = function (this: typeof Sprite, x = this.centerX, y = this.centerY) {
	const dpr = window.devicePixelRatio;
	const screen = this.screen;
	const scrollX = x * this.scaledUnitWidth + this.paddingLeft;
	const scrollY = y * this.scaledUnitHeight + this.paddingTop;
	const toleranceX = this.scaledUnitWidth * 0.0001;
	const toleranceY = this.scaledUnitHeight * 0.0001;
	screenScrollData(screen).rawScrollLeft =
		Math.clamp(scrollX - this.centerOffsetX, 0, this.outerWidth - this.screenWidth) / dpr;
	screenScrollData(screen).rawScrollTop =
		Math.clamp(scrollY - this.centerOffsetY, 0, this.outerHeight - this.screenHeight) / dpr;
	screen.scrollLeft = (scrollX - (this.screenWidth >> 1) + toleranceX) / dpr;
	screen.scrollTop = (scrollY - (this.screenHeight >> 1) + toleranceY) / dpr;
};

Sprite.updateTransform = function (this: typeof Sprite) {
	const dpr = window.devicePixelRatio;
	const screen = this.screen;
	const left = Math.roundTo(screen.scrollLeft * dpr, 4);
	const top = Math.roundTo(screen.scrollTop * dpr, 4);
	const right = left + this.canvas.width;
	const bottom = top + this.canvas.height;
	this.scrollLeft = left;
	this.scrollTop = top;
	this.scrollRight = right;
	this.scrollBottom = bottom;
	this.context.setTransform(1, 0, 0, 1, -left, -top);
	const scrollX = screenScrollData(screen).rawScrollLeft * dpr + this.centerOffsetX;
	const scrollY = screenScrollData(screen).rawScrollTop * dpr + this.centerOffsetY;
	this.centerX = Math.roundTo((scrollX - this.paddingLeft) / this.scaledUnitWidth, 4);
	this.centerY = Math.roundTo((scrollY - this.paddingTop) / this.scaledUnitHeight, 4);
};

Sprite.updateBackground = Palette?.updateBackground ?? (() => {});

Sprite.drawSprite = function (this: typeof Sprite) {
	if (this.body.clientWidth > 0 && this.canvas.width !== 0 && this.canvas.height !== 0) {
		const context = this.context;
		const sl = this.scrollLeft;
		const st = this.scrollTop;
		const sr = this.scrollRight;
		const sb = this.scrollBottom;
		context.clearRect(sl, st, sr - sl, sb - st);

		this.drawSpriteLayer();
		this.drawGridLayer();
	}
};

Sprite.drawSpriteLayer = function (this: typeof Sprite) {
	const context = this.context;
	const image = this.image;
	const scaleX = this.scaleX;
	const scaleY = this.scaleY;
	const dx = this.scrollLeft;
	const dy = this.scrollTop;
	const dw = this.scrollRight - dx;
	const dh = this.scrollBottom - dy;
	const sx = dx / scaleX;
	const sy = dy / scaleY;
	const sw = dw / scaleX;
	const sh = dh / scaleY;
	context.drawImage(image!, sx, sy, sw, sh, dx, dy, dw, dh);
};

Sprite.drawGridLayer = function (this: typeof Sprite) {
	if (this.showGrid) {
		const context = this.context;
		const sl = this.scrollLeft;
		const st = this.scrollTop;
		const sr = this.scrollRight;
		const sb = this.scrollBottom;
		const uw = this.scaledUnitWidth;
		const uh = this.scaledUnitHeight;
		const bx = Math.floor(sl / uw + 1) * uw;
		const by = Math.floor(st / uh + 1) * uh;
		const ex = Math.ceil(sr / uw) * uw;
		const ey = Math.ceil(sb / uh) * uh;
		context.beginPath();
		for (let y = by; y < ey; y += uh) {
			context.moveTo(sl, y + 0.5);
			context.lineTo(sr, y + 0.5);
		}
		for (let x = bx; x < ex; x += uw) {
			context.moveTo(x + 0.5, st);
			context.lineTo(x + 0.5, sb);
		}
		context.lineWidth = 1;
		context.strokeStyle = this.gridColor;
		context.stroke();
	}
};

Sprite.selectSprite = function (this: typeof Sprite, hindex: number, vindex: number) {
	const target = this.target;
	if (target !== null) {
		this.marquee.select(hindex, vindex, 1, 1);
		Animation.planToSave();
		const x = Animation.timelineMarquee.x;
		const history = Animation.history;
		const index = history.index;
		const length = history.length;
		const record = history[index];
		const type = 'animation-target-index';
		if (
			index !== length - 1 ||
			record === undefined ||
			record.type !== type ||
			record.target !== target
		) {
			history.save({
				type: type,
				motion: Animation.motion,
				direction: Animation.direction,
				target: target,
				hindex: target.spriteX,
				vindex: target.spriteY
			});
		}
		target.spriteX = hindex;
		target.spriteY = vindex;
		this.updateTargetInfo();
		Animation.loadFrames(x);
		Animation.requestRendering();
	}
};

Sprite.scrollToSelection = function (this: typeof Sprite) {
	const marquee = this.marquee;
	if (marquee.visible) {
		const suw = this.scaledUnitWidth;
		const suh = this.scaledUnitHeight;
		const mx = marquee.x;
		const my = marquee.y;
		const mr = marquee.width + mx;
		const mb = marquee.height + my;
		const wh = this.screenWidth / suw / 2;
		const hh = this.screenHeight / suh / 2;
		const toleranceX = 0.5 / suw;
		const toleranceY = 0.5 / suh;
		const x1 = mr - wh + toleranceX;
		const x2 = mx + wh - toleranceX;
		const y1 = mb - hh + toleranceY;
		const y2 = my + hh - toleranceY;
		const x = Math.min(Math.max(this.centerX, x1), x2);
		const y = Math.min(Math.max(this.centerY, y1), y2);
		if (this.centerX !== x || this.centerY !== y) {
			this.updateCamera(x, y);
			this.updateTransform();
			this.requestRendering();
			this.screen.updateScrollbars();
		}
	}
};

Sprite.requestRendering = function (this: typeof Sprite) {
	if (this.state === 'open') {
		Timer.appendUpdater!('sharedRendering', this.renderingFunction);
	}
};

Sprite.renderingFunction = function () {
	Sprite.drawSprite();
};

Sprite.stopRendering = function (this: typeof Sprite) {
	Timer.removeUpdater!('sharedRendering', this.renderingFunction);
};

Sprite.saveToProject = function (this: typeof Sprite, project: EditorProjectShape) {
	const { sprite } = project;
	const zoom = this.zoom;
	if (zoom !== null) {
		sprite!.zoom = zoom;
	}
};

Sprite.loadFromProject = function (this: typeof Sprite, project: EditorProjectShape) {
	const { sprite } = project;
	this.setZoom(sprite!.zoom!);
};

Sprite.windowResize = function (this: typeof Sprite, _event: Event) {
	if (this.body.clientWidth === 0) {
		return this.suspend();
	}
	switch (this.state) {
		case 'open':
			this.resize();
			this.requestRendering();
			break;
		case 'suspended':
			this.resume();
			break;
	}
}.bind(Sprite);

Sprite.themechange = function (this: typeof Sprite, event: Event) {
	switch (event.value) {
		case 'light':
			this.gridColor = 'rgba(0, 0, 0, 0.5)';
			break;
		case 'dark':
			this.gridColor = 'rgba(255, 255, 255, 0.5)';
			break;
	}
	this.requestRendering();
}.bind(Sprite);

Sprite.zoomFocus = function (_event: Event) {
	Sprite.screen.focus();
};

Sprite.zoomInput = function (this: HTMLElement, _event: Event) {
	Sprite.setZoom(read(this));
};

Sprite.screenKeydown = function (event: KeyboardEvent) {
	if (Sprite.state === 'open' && Sprite.dragging === null) {
		switch (event.code) {
			case 'ArrowLeft':
			case 'ArrowUp':
			case 'ArrowRight':
			case 'ArrowDown': {
				let offsetX = 0;
				let offsetY = 0;
				switch (event.code) {
					case 'ArrowLeft':
						offsetX = -1;
						break;
					case 'ArrowUp':
						offsetY = -1;
						break;
					case 'ArrowRight':
						offsetX = +1;
						break;
					case 'ArrowDown':
						offsetY = +1;
						break;
				}
				const marquee = Sprite.marquee;
				const x = Math.clamp(marquee.x + offsetX, 0, Sprite.hframes - 1);
				const y = Math.clamp(marquee.y + offsetY, 0, Sprite.vframes - 1);
				if (marquee.x !== x || marquee.y !== y) {
					Sprite.selectSprite(x, y);
					Sprite.scrollToSelection();
				}
				break;
			}
			case 'Minus':
			case 'NumpadSubtract':
				Sprite.setZoom(Sprite.zoom! - 1);
				break;
			case 'Equal':
			case 'NumpadAdd':
				Sprite.setZoom(Sprite.zoom! + 1);
				break;
			case 'Digit0':
			case 'Numpad0':
				Sprite.setZoom(2);
				break;
		}
	}
};

Sprite.screenWheel = function (this: typeof Sprite, event: WheelEvent) {
	event.preventDefault();
	if (event.deltaY !== 0 && this.dragging === null) {
		this.setZoom(this.zoom! + (event.deltaY > 0 ? -1 : 1));
	}
}.bind(Sprite);

Sprite.screenUserscroll = function (this: typeof Sprite, _event: Event) {
	if (this.state === 'open') {
		screenScrollData(this.screen).rawScrollLeft = this.screen.scrollLeft;
		screenScrollData(this.screen).rawScrollTop = this.screen.scrollTop;
		this.updateTransform();
		this.updateBackground();
		this.requestRendering();
		this.screen.updateScrollbars();
	}
}.bind(Sprite);

Sprite.marqueePointerdown = function (
	this: typeof Sprite,
	event: PointerEvent & { dragKey?: boolean }
) {
	// 优先触发检查器输入框的blur事件
	if (Inspector.manager.focusing) {
		document.activeElement!.blur();
	}
	if (this.dragging) {
		return;
	}
	switch (event.button) {
		case 0: {
			if (event.dragKey) {
				this.dragging = event;
				event.mode = 'scroll';
				event.scrollLeft = this.screen.scrollLeft;
				event.scrollTop = this.screen.scrollTop;
				Cursor.open('cursor-grab');
				window.addEventListener('pointerup', this.pointerup);
				window.addEventListener('pointermove', this.pointermove);
				return;
			}
			const { x, y } = this.getUnitCoords(event);
			const { marquee } = this;
			if (!marquee.visible || marquee.x !== x || marquee.y !== y) {
				this.selectSprite(x, y);
			}
			break;
		}
		case 2:
			this.dragging = event;
			event.mode = 'scroll';
			event.scrollLeft = this.screen.scrollLeft;
			event.scrollTop = this.screen.scrollTop;
			Cursor.open('cursor-grab');
			window.addEventListener('pointerup', this.pointerup);
			window.addEventListener('pointermove', this.pointermove);
			break;
	}
}.bind(Sprite);

Sprite.pointerup = function (this: typeof Sprite, event: PointerEvent) {
	const { dragging } = this;
	if (dragging && relate(dragging, event)) {
		switch (dragging.mode) {
			case 'scroll':
				this.screen.endScrolling();
				Cursor.close('cursor-grab');
				break;
		}
		this.dragging = null;
		window.removeEventListener('pointerup', this.pointerup);
		window.removeEventListener('pointermove', this.pointermove);
	}
}.bind(Sprite);

Sprite.pointermove = function (this: typeof Sprite, event: PointerEvent) {
	const { dragging } = this;
	if (dragging && relate(dragging, event)) {
		switch (dragging.mode) {
			case 'scroll': {
				const distX = event.clientX - dragging.clientX;
				const distY = event.clientY - dragging.clientY;
				this.screen.beginScrolling();
				this.screen.setScroll(dragging.scrollLeft - distX, dragging.scrollTop - distY);
				break;
			}
		}
	}
}.bind(Sprite);
