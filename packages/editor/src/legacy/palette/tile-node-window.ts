import { relate, getRelativeCoords } from '@/util/element-utils';
import { Window } from '@/tools/window-object.ts';
import { $ } from '@/util/dom.ts';
import { on, rect, css, addClass } from '@/util/element-utils.ts';
import { Timer } from '@/util/timer.ts';
import { Scene } from '@/scene/scene-window.ts';
import { Cursor } from '@/tools/pointer-object.ts';
import { Palette } from './palette.ts';

export const TileNode = {
	get canvas() {
		return $('#autoTile-selectNode-canvas');
	},
	context: null as any,
	get screen() {
		return $('#autoTile-selectNode-screen');
	},
	get marquee() {
		return $('#autoTile-selectNode-marquee');
	},
	dragging: null as any,
	nodes: null as any,
	image: null as any,
	offsetX: null as any,
	offsetY: null as any,
	hframes: null as any,
	vframes: null as any,
	scrollLeft: null as any,
	scrollTop: null as any,
	scrollRight: null as any,
	scrollBottom: null as any,
	initialize: null as any,
	open: null as any,
	updateTransform: null as any,
	updateBackground: null as any,
	drawNodes: null as any,
	requestRendering: null as any,
	renderingFunction: null as any,
	stopRendering: null as any,
	scrollToSelection: null as any,
	getDevicePixelClientBoxSize: null as any,
	dprchange: null as any,
	windowClosed: null as any,
	keydown: null as any,
	screenScroll: null as any,
	marqueePointerdown: null as any,
	pointerup: null as any,
	pointermove: null as any
};

TileNode.initialize = function (this: any) {
	if (!this.canvas) return;
	this.context = this.canvas.getContext('2d');

	window.addEventListener('dprchange', this.dprchange);
	on($('#autoTile-selectNode'), 'closed', this.windowClosed);
	on(this.screen, 'scroll', this.screenScroll);
	on(this.marquee, 'pointerdown', this.marqueePointerdown);
};

TileNode.open = function (this: any, nodes: any, image: any, offsetX: any, offsetY: any) {
	const MAX_CONTENT_WIDTH = 1180;
	const MAX_CONTENT_HEIGHT = 696;
	const MIN_CONTENT_WIDTH = 100;
	const MIN_CONTENT_HEIGHT = 100;
	const windowFrame = $('#autoTile-selectNode');
	const screen = this.screen;
	const tileWidth = Palette.tileset.tileWidth;
	const tileHeight = Palette.tileset.tileHeight;
	const hframes = Math.min(nodes.length, 8);
	const vframes = Math.ceil(nodes.length / 8);
	const dpr = window.devicePixelRatio;
	const innerWidth = tileWidth * hframes;
	const innerHeight = tileHeight * vframes;
	let contentWidth = innerWidth / dpr;
	let contentHeight = innerHeight / dpr;
	this.nodes = nodes;
	this.image = image;
	this.offsetX = offsetX;
	this.offsetY = offsetY;
	this.hframes = hframes;
	this.vframes = vframes;

	// 使用 overflow: auto 浏览器行为有时无法预测
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
	window.addEventListener('keydown', this.keydown);
	Window.open!('autoTile-selectNode');

	const screenBox = this.getDevicePixelClientBoxSize(screen);
	const screenWidth = screenBox.width;
	const screenHeight = screenBox.height;
	const left = Math.max(((screenWidth - innerWidth) >> 1) / dpr, 0);
	const top = Math.max(((screenHeight - innerHeight) >> 1) / dpr, 0);
	this.marquee.style.left = `${left}px`;
	this.marquee.style.top = `${top}px`;
	this.marquee.style.width = `${innerWidth / dpr}px`;
	this.marquee.style.height = `${innerHeight / dpr}px`;
	this.marquee.scaleX = tileWidth / dpr;
	this.marquee.scaleY = tileHeight / dpr;
	if (Palette.explicit) {
		this.marquee.select();
	} else {
		this.marquee.select(0, 0, 1, 1);
	}

	const canvasWidth = Math.min(innerWidth, screenWidth);
	const canvasHeight = Math.min(innerHeight, screenHeight);
	this.canvas.style.left = `${left}px`;
	this.canvas.style.top = `${top}px`;
	this.canvas.width = canvasWidth;
	this.canvas.height = canvasHeight;
	this.canvas.style.width = `${canvasWidth / dpr}px`;
	this.canvas.style.height = `${canvasHeight / dpr}px`;

	this.scrollToSelection();
	this.updateTransform();
	this.requestRendering();
};

TileNode.updateTransform = function (this: any) {
	const dpr = window.devicePixelRatio;
	this.scrollLeft = this.screen.scrollLeft * dpr;
	this.scrollTop = this.screen.scrollTop * dpr;
	this.scrollRight = this.scrollLeft + this.canvas.width;
	this.scrollBottom = this.scrollTop + this.canvas.height;
	this.context.setTransform(1, 0, 0, 1, -this.scrollLeft, -this.scrollTop);
};

TileNode.updateBackground = function (this: any, ...args: any[]) {
	return Palette.updateBackground(...args);
};

TileNode.drawNodes = function (this: any) {
	if (!this.nodes) return;
	const context = this.context;
	const tileset = Palette.tileset;
	const image = this.image;
	const nodes = this.nodes;
	const length = nodes.length;
	const tw = tileset.tileWidth;
	const th = tileset.tileHeight;
	const ox = this.offsetX;
	const oy = this.offsetY;
	const sl = this.scrollLeft;
	const st = this.scrollTop;
	const sr = this.scrollRight;
	const sb = this.scrollBottom;
	const bx = Math.max(Math.floor(sl / tw), 0);
	const by = Math.max(Math.floor(st / th), 0);
	const ex = Math.min(Math.ceil(sr / tw), this.hframes);
	const ey = Math.min(Math.ceil(sb / th), this.vframes);
	context.clearRect(sl, st, sr - sl, sb - st);
	for (let y = by; y < ey; y++) {
		for (let x = bx; x < ex; x++) {
			const i = x | (y << 3);
			if (i < length) {
				const frame = nodes[i].frames[0];
				const sx = (ox + (frame & 0xff)) * tw;
				const sy = (oy + (frame >> 8)) * th;
				const dx = x * tw;
				const dy = y * th;
				context.drawImage(image, sx, sy, tw, th, dx, dy, tw, th);
			}
		}
	}
};

TileNode.requestRendering = function (this: any) {
	if (this.nodes !== null) {
		Timer.appendUpdater!('sharedRendering', this.renderingFunction);
	}
};

TileNode.renderingFunction = function (this: any) {
	TileNode.drawNodes!();
};

TileNode.stopRendering = function (this: any) {
	Timer.removeUpdater!('sharedRendering', this.renderingFunction);
};

TileNode.scrollToSelection = function (this: any) {
	const marquee = this.marquee;
	if (marquee.visible) {
		const screen = this.screen;
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

TileNode.getDevicePixelClientBoxSize = function (this: any, element: any) {
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

TileNode.dprchange = function (this: any, event: any) {
	if (this.nodes !== null) {
		const marquee = this.marquee;
		const { x, y, width, height } = marquee;
		this.open(this.nodes, this.image);
		marquee.select(x, y, width, height);
	}
}.bind(TileNode);

TileNode.windowClosed = function (this: any, event: any) {
	this.nodes = null;
	this.image = null;
	this.canvas.width = 0;
	this.canvas.height = 0;
	this.stopRendering();
	if (this.dragging) {
		this.pointerup(this.dragging);
	}
	window.removeEventListener('keydown', this.keydown);
}.bind(TileNode);

TileNode.keydown = function (this: any, event: any) {
	event.preventDefault();
	if (this.dragging) {
		return;
	}
	switch (event.code) {
		case 'Enter':
		case 'NumpadEnter': {
			const { x, y } = this.marquee;
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
			const marquee = this.marquee;
			const x = Math.clamp(marquee.x + offsetX, 0, this.hframes - 1);
			const y = Math.clamp(marquee.y + offsetY, 0, this.vframes - 1);
			if (marquee.x !== x || marquee.y !== y) {
				const index = x | (y << 3);
				if (index < this.nodes.length) {
					marquee.select(x, y, 1, 1);
					this.scrollToSelection();
				}
			}
			break;
		}
	}
}.bind(TileNode);

TileNode.screenScroll = function (this: any, event: any) {
	this.updateTransform();
	this.updateBackground();
	this.requestRendering();
}.bind(TileNode);

TileNode.marqueePointerdown = function (this: any, event: any) {
	if (this.dragging) {
		return;
	}
	switch (event.button) {
		case 0: {
			if (event.altKey) {
				this.dragging = event;
				event.mode = 'scroll';
				event.screen = event.target.parentNode;
				event.scrollLeft = event.screen.scrollLeft;
				event.scrollTop = event.screen.scrollTop;
				Cursor.open('cursor-grab');
				window.addEventListener('pointerup', this.pointerup);
				window.addEventListener('pointermove', this.pointermove);
				return;
			}
			const marquee = this.marquee;
			const coords = getRelativeCoords(event, marquee);
			const x = Math.floor(coords.x / marquee.scaleX);
			const y = Math.floor(coords.y / marquee.scaleY);
			const index = x | (y << 3);
			if (index < this.nodes.length) {
				marquee.select(x, y, 1, 1);
				this.dragging = event;
				event.mode = 'select';
				window.addEventListener('pointerup', this.pointerup);
			}
			break;
		}
		case 2:
			this.dragging = event;
			event.mode = 'scroll';
			event.screen = event.target.parentNode;
			event.scrollLeft = event.screen.scrollLeft;
			event.scrollTop = event.screen.scrollTop;
			Cursor.open('cursor-grab');
			window.addEventListener('pointerup', this.pointerup);
			window.addEventListener('pointermove', this.pointermove);
			break;
	}
}.bind(TileNode);

TileNode.pointerup = function (this: any, event: any) {
	const { dragging } = this;
	if (dragging && relate(dragging, event)) {
		switch (dragging.mode) {
			case 'select': {
				const marquee = this.marquee;
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
						// 关闭窗口会额外触发一次本事件 换做 mouseup 事件也一样
						Window.close!('autoTile-selectNode');
					}
				}
				break;
			}
			case 'scroll':
				Cursor.close('cursor-grab');
				break;
		}
		this.dragging = null;
		window.removeEventListener('pointerup', this.pointerup);
		window.removeEventListener('pointermove', this.pointermove);
	}
}.bind(TileNode);

TileNode.pointermove = function (this: any, event: any) {
	const { dragging } = this;
	if (dragging && relate(dragging, event)) {
		switch (dragging.mode) {
			case 'scroll':
				dragging.screen.scrollLeft = dragging.scrollLeft + dragging.clientX - event.clientX;
				dragging.screen.scrollTop = dragging.scrollTop + dragging.clientY - event.clientY;
				break;
		}
	}
}.bind(TileNode);
