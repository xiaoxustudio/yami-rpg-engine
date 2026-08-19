import { getRelativeCoords } from '@app/legacy/util/element-utils';
import { clear, removeClass } from '@app/legacy/util/element-utils.ts';
import { File } from '@app/legacy/file/file-system-core.ts';
import { Scene } from '@app/legacy/scene/scene-window.ts';
import { Data } from '@app/legacy/data/data-object.ts';
import { Timer } from '@app/legacy/util/timer.ts';
import { getPaletteStore } from '@app/stores/palette';
import type { Palette } from '@app/legacy/palette/palette.ts';

export const PaletteEngine: Record<string, any> = {};

interface MarkPosition {
	text: string;
	start: number;
	width: number;
	aspectRatio: number;
}

// 标记画布（运行时挂载 fontSize/font/totalWidth/entries/positions）
interface MarkCanvasShape extends HTMLCanvasElement {
	fontSize: number;
	font: string;
	totalWidth: number;
	entries: { text: string; start: number; width: number }[];
	positions: Record<string, MarkPosition>;
}

PaletteEngine.getTileCoords = (function IIFE() {
	const point = { x: 0, y: 0 };
	return function (this: typeof Palette, event: PointerEvent, clamp: boolean = false) {
		const coords = getRelativeCoords(event, this.marquee);
		const tileset = getPaletteStore().tileset;
		if (!tileset) return point;
		const stw = this.scaledTileWidth;
		const sth = this.scaledTileHeight;
		const dpr = window.devicePixelRatio;
		let x = Math.floor((coords.x * dpr) / stw);
		let y = Math.floor((coords.y * dpr) / sth);
		if (clamp) {
			x = Math.clamp(x, 0, tileset.width - 1);
			y = Math.clamp(y, 0, tileset.height - 1);
		}
		point.x = x;
		point.y = y;
		return point;
	};
})();

PaletteEngine.updateCamera = function (this: typeof Palette, x = this.meta.x, y = this.meta.y) {
	const dpr = window.devicePixelRatio;
	const screen = this.screen;
	const scrollX = x * this.scaledTileWidth + this.paddingLeft;
	const scrollY = y * this.scaledTileHeight + this.paddingTop;
	const toleranceX = this.scaledTileWidth * 0.0001;
	const toleranceY = this.scaledTileHeight * 0.0001;
	screen.rawScrollLeft =
		Math.clamp(scrollX - this.centerOffsetX, 0, this.outerWidth - this.screenWidth) / dpr;
	screen.rawScrollTop =
		Math.clamp(scrollY - this.centerOffsetY, 0, this.outerHeight - this.screenHeight) / dpr;
	screen.scrollLeft = (scrollX - (this.screenWidth >> 1) + toleranceX) / dpr;
	screen.scrollTop = (scrollY - (this.screenHeight >> 1) + toleranceY) / dpr;
};

PaletteEngine.updateTransform = function (this: typeof Palette) {
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
	const scrollX = screen.rawScrollLeft * dpr + this.centerOffsetX;
	const scrollY = screen.rawScrollTop * dpr + this.centerOffsetY;
	this.meta.x = Math.roundTo((scrollX - this.paddingLeft) / this.scaledTileWidth, 4);
	this.meta.y = Math.roundTo((scrollY - this.paddingTop) / this.scaledTileHeight, 4);
	Data.manifest.changed = true;
};

// 保持图像与网格背景的相对位置 避免视觉干扰并且可以测量位置
PaletteEngine.updateBackground = function (this: typeof Palette) {
	const style = this.canvas.style;
	const x = -this.screen.scrollLeft;
	const y = -this.screen.scrollTop;
	if (style.backgroundX !== x || style.backgroundY !== y) {
		style.backgroundX = x;
		style.backgroundY = y;
		style.backgroundPosition = `${x}px ${y}px`;
	}
};

PaletteEngine.createMarkCanvas = function (this: typeof Palette) {
	let canvas = this.markCanvas;
	if (canvas === null) {
		const size = 128;
		canvas = document.createElement('canvas');
		canvas.width = 0;
		canvas.height = size * 3;
		canvas.fontSize = size;
		canvas.entries = [];
		canvas.totalWidth = 0;
		const positions: Record<string, MarkPosition> = (canvas.positions = {} as Record<
			string,
			MarkPosition
		>);
		const context = canvas.getContext('2d');
		const font = `${size}px sans-serif`;
		canvas.font = font;
		context.font = font;

		let start = 0;
		for (let i = 0; i < 10; i++) {
			const text = i.toString();
			const width = Math.ceil(context.measureText(text).width);
			const aspectRatio = width / size;
			positions[i] = { text, start, width, aspectRatio };
			canvas.entries.push({ text, start, width });
			start += width;
		}

		const width = Math.ceil(context.measureText('+').width);
		const addStart = start;
		positions.add = {
			text: '+',
			start: addStart,
			width: width,
			aspectRatio: width / size
		};
		start += width;
		canvas.entries.push({ text: '+', start: addStart, width });
		canvas.totalWidth = start;

		this.rebuildMarkCanvas(canvas);
		this.markCanvas = canvas;
		// canvas.style.display = 'block' canvas.style.position = 'fixed' document.body.appendChild(canvas)
	}
	return canvas;
};

PaletteEngine.rebuildMarkCanvas = function (this: typeof Palette, canvas: MarkCanvasShape) {
	const size = canvas.fontSize;
	canvas.width = canvas.totalWidth;
	canvas.height = size * 3;
	const context = canvas.getContext('2d')!;
	context.font = canvas.font;
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.shadowColor = '#000000';
	context.shadowBlur = size / 32;
	context.shadowOffsetY = size / 32;
	for (const entry of canvas.entries) {
		const { text, start, width } = entry;
		const x = start + width / 2;
		context.fillStyle = '#ffffff';
		context.fillText(text, x, size * 0.5);
		context.fillStyle = '#ffd700';
		context.fillText(text, x, size * 1.5);
		context.fillStyle = '#00ff00';
		context.fillText(text, x, size * 2.5);
	}
};

PaletteEngine.ensureMarkPosition = function (
	this: typeof Palette,
	canvas: MarkCanvasShape,
	text: string,
	key: string = text
) {
	const positions = canvas.positions;
	const existing = positions[key];
	if (existing) return existing;
	const context = canvas.getContext('2d')!;
	context.font = canvas.font;
	const width = Math.ceil(context.measureText(text).width);
	const start = canvas.totalWidth;
	const aspectRatio = width / canvas.fontSize;
	const position = { text, start, width, aspectRatio };
	positions[key] = position;
	canvas.entries.push({ text, start, width });
	canvas.totalWidth += width;
	this.rebuildMarkCanvas(canvas);
	return position;
};

PaletteEngine.drawTileset = function (this: typeof Palette) {
	if (this.body.clientWidth > 0 && this.canvas.width !== 0 && this.canvas.height !== 0) {
		const context = this.context;
		const sl = this.scrollLeft;
		const st = this.scrollTop;
		const sr = this.scrollRight;
		const sb = this.scrollBottom;
		context.clearRect(sl, st, sr - sl, sb - st);

		this.drawTiles();
		this.drawTileGrid();
		this.drawPriorities();
		this.drawTags();
		this.drawTerrains();
	}
};

PaletteEngine.drawTiles = function (this: typeof Palette) {
	const context = this.context;
	const tileset = getPaletteStore().tileset;
	const images = this.images;
	context.imageSmoothingEnabled = this.scale < 1;
	switch (tileset.type) {
		case 'normal': {
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
			const image = images[tileset.image];
			if (image instanceof Image) {
				context.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
			} else if (image === undefined) {
				const guid = tileset.image;
				const symbol = (images[guid] = Symbol());
				File.get!({
					guid: guid,
					type: 'image'
				}).then((image: HTMLImageElement) => {
					if (images[guid] === symbol) {
						images[guid] = image;
						this.requestRendering();
					}
				});
			}
			break;
		}
		case 'auto': {
			const templates = Data.autotiles.map;
			const tiles = tileset.tiles;
			const tro = tileset.width;
			const tw = tileset.tileWidth;
			const th = tileset.tileHeight;
			const stw = this.scaledTileWidth;
			const sth = this.scaledTileHeight;
			const sl = this.scrollLeft;
			const st = this.scrollTop;
			const sr = this.scrollRight;
			const sb = this.scrollBottom;
			const bx = Math.max(Math.floor(sl / stw), 0);
			const by = Math.max(Math.floor(st / sth), 0);
			const ex = Math.min(Math.ceil(sr / stw), tileset.width);
			const ey = Math.min(Math.ceil(sb / sth), tileset.height);
			for (let y = by; y < ey; y++) {
				for (let x = bx; x < ex; x++) {
					const i = x + y * tro;
					const tile = tiles[i];
					if (tile !== 0) {
						const template = templates[tile.template];
						const image = images[tile.image];
						if (template !== undefined && image instanceof Image) {
							const node = template.nodes[template.cover];
							if (node === undefined) continue;
							const frame = node.frames[0];
							const sx = (tile.x + (frame & 0xff)) * tw;
							const sy = (tile.y + (frame >> 8)) * th;
							const dx = x * stw;
							const dy = y * sth;
							context.drawImage(image, sx, sy, tw, th, dx, dy, stw, sth);
						} else if (image === undefined) {
							const guid = tile.image;
							const symbol = (images[guid] = Symbol());
							File.get!({
								guid: guid,
								type: 'image'
							}).then((image: HTMLImageElement) => {
								if (images[guid] === symbol) {
									images[guid] = image;
									this.requestRendering();
								}
							});
						}
					}
				}
			}
			break;
		}
	}
};

PaletteEngine.drawTileGrid = function (this: typeof Palette) {
	if (getPaletteStore().showGrid) {
		const context = this.context;
		const sl = this.scrollLeft;
		const st = this.scrollTop;
		const sr = this.scrollRight;
		const sb = this.scrollBottom;
		const tw = this.scaledTileWidth;
		const th = this.scaledTileHeight;
		const bx = Math.floor(sl / tw + 1) * tw;
		const by = Math.floor(st / th + 1) * th;
		const ex = Math.ceil(sr / tw) * tw;
		const ey = Math.ceil(sb / th) * th;
		context.beginPath();
		for (let y = by; y < ey; y += th) {
			context.moveTo(sl, y + 0.5);
			context.lineTo(sr, y + 0.5);
		}
		for (let x = bx; x < ex; x += tw) {
			context.moveTo(x + 0.5, st);
			context.lineTo(x + 0.5, sb);
		}
		context.lineWidth = 1;
		context.strokeStyle = this.gridColor;
		context.stroke();
	}
};

PaletteEngine.drawPriorities = function (this: typeof Palette) {
	if (getPaletteStore().mode === 'priority') {
		const context = this.context;
		const tileset = getPaletteStore().tileset;
		const priorities = tileset.priorities;
		const tro = tileset.width;
		const sl = this.scrollLeft;
		const st = this.scrollTop;
		const sr = this.scrollRight;
		const sb = this.scrollBottom;
		const tw = this.scaledTileWidth;
		const th = this.scaledTileHeight;
		const ts = Math.min(tw, th);
		if (ts < 16) return;
		const bx = Math.max(Math.floor(sl / tw), 0);
		const by = Math.max(Math.floor(st / th), 0);
		const ex = Math.min(Math.ceil(sr / tw), tileset.width);
		const ey = Math.min(Math.ceil(sb / th), tileset.height);
		const dragging = this.dragging;
		const mark = this.createMarkCanvas();
		const positions = mark.positions;
		const height = mark.fontSize;
		const fs = ts / 2;
		const oy = fs / 2;
		let activeIndex;
		let activeOffset;
		switch (dragging?.mode) {
			case 'increase-priority':
			case 'ready-to-decrease-priority':
				if (dragging.active) {
					activeIndex = dragging.startIndex;
					activeOffset = height * 2;
				}
				break;
			default:
				activeIndex = getPaletteStore().activeIndex;
				activeOffset = height;
				break;
		}
		context.imageSmoothingEnabled = fs < height;
		switch (tileset.type) {
			case 'normal':
				for (let y = by; y < ey; y++) {
					for (let x = bx; x < ex; x++) {
						const i = x + y * tro;
						const priority = priorities[i];
						if (priority === 0) continue;
						const position = positions[priority];
						const { start, width, aspectRatio } = position;
						const dw = fs * aspectRatio;
						const dx = (x + 0.5) * tw - dw / 2;
						const dy = (y + 0.5) * th - oy;
						const sy = i === activeIndex ? activeOffset : 0;
						context.drawImage(mark, start, sy, width, height, dx, dy, dw, fs);
					}
				}
				break;
			case 'auto': {
				const tiles = tileset.tiles;
				for (let y = by; y < ey; y++) {
					for (let x = bx; x < ex; x++) {
						const i = x + y * tro;
						const tile = tiles[i];
						const priority = priorities[i];
						if (tile === 0 || priority === 0) continue;
						const position = positions[priority];
						const { start, width, aspectRatio } = position;
						const dw = fs * aspectRatio;
						const dx = (x + 0.5) * tw - dw / 2;
						const dy = (y + 0.5) * th - oy;
						const sy = i === activeIndex ? activeOffset : 0;
						context.drawImage(mark, start, sy, width, height, dx, dy, dw, fs);
					}
				}
				break;
			}
		}
	}
};

PaletteEngine.drawTags = function (this: typeof Palette) {
	if (getPaletteStore().mode === 'tag') {
		const context = this.context;
		const tileset = getPaletteStore().tileset;
		const tags = tileset.tags;
		const tro = tileset.width;
		const sl = this.scrollLeft;
		const st = this.scrollTop;
		const sr = this.scrollRight;
		const sb = this.scrollBottom;
		const tw = this.scaledTileWidth;
		const th = this.scaledTileHeight;
		const ts = Math.min(tw, th);
		if (ts < 16) return;
		const bx = Math.max(Math.floor(sl / tw), 0);
		const by = Math.max(Math.floor(st / th), 0);
		const ex = Math.min(Math.ceil(sr / tw), tileset.width);
		const ey = Math.min(Math.ceil(sb / th), tileset.height);
		const dragging = this.dragging;
		const mark = this.createMarkCanvas();
		const positions = mark.positions;
		const height = mark.fontSize;
		const fs = ts / 2;
		const oy = fs / 2;
		let activeIndex;
		let activeOffset;
		switch (dragging?.mode) {
			case 'increase-tag':
			case 'ready-to-decrease-tag':
				if (dragging.active) {
					activeIndex = dragging.startIndex;
					activeOffset = height * 2;
				}
				break;
			default:
				activeIndex = getPaletteStore().activeIndex;
				activeOffset = height;
				break;
		}
		context.imageSmoothingEnabled = fs < height;
		switch (tileset.type) {
			case 'normal':
				for (let y = by; y < ey; y++) {
					for (let x = bx; x < ex; x++) {
						const i = x + y * tro;
						const tag = (tags[i] ??= 0);
						if (tag === 0) continue;
						const position =
							positions[tag] ?? this.ensureMarkPosition(mark, tag.toString(), tag);
						const { start, width, aspectRatio } = position;
						const dw = fs * aspectRatio;
						const dx = (x + 0.5) * tw - dw / 2;
						const dy = (y + 0.5) * th - oy;
						const sy = i === activeIndex ? activeOffset : 0;
						context.drawImage(mark, start, sy, width, height, dx, dy, dw, fs);
					}
				}
				break;
			case 'auto': {
				const tiles = tileset.tiles;
				for (let y = by; y < ey; y++) {
					for (let x = bx; x < ex; x++) {
						const i = x + y * tro;
						const tile = tiles[i];
						const tag = tags[i];
						if (tile === 0 || tag === 0) continue;
						const position =
							positions[tag] ?? this.ensureMarkPosition(mark, tag.toString(), tag);
						const { start, width, aspectRatio } = position;
						const dw = fs * aspectRatio;
						const dx = (x + 0.5) * tw - dw / 2;
						const dy = (y + 0.5) * th - oy;
						const sy = i === activeIndex ? activeOffset : 0;
						context.drawImage(mark, start, sy, width, height, dx, dy, dw, fs);
					}
				}
				break;
			}
		}
	}
};

PaletteEngine.drawTerrains = function (this: typeof Palette) {
	if (getPaletteStore().mode === 'terrain') {
		const context = this.context;
		const tileset = getPaletteStore().tileset;
		const terrains = tileset.terrains;
		const tro = tileset.width;
		const sl = this.scrollLeft;
		const st = this.scrollTop;
		const sr = this.scrollRight;
		const sb = this.scrollBottom;
		const tw = this.scaledTileWidth;
		const th = this.scaledTileHeight;
		const bx = Math.max(Math.floor(sl / tw), 0);
		const by = Math.max(Math.floor(st / th), 0);
		const ex = Math.min(Math.ceil(sr / tw), tileset.width);
		const ey = Math.min(Math.ceil(sb / th), tileset.height);
		for (let y = by; y < ey; y++) {
			for (let x = bx; x < ex; x++) {
				const i = x + y * tro;
				switch (terrains[i]) {
					case 0:
						continue;
					case 1:
						context.fillStyle = 'rgba(0, 0, 255, 0.25)';
						context.fillRect(x * tw, y * th, tw, th);
						continue;
					case 2:
						context.fillStyle = 'rgba(255, 0, 0, 0.25)';
						context.fillRect(x * tw, y * th, tw, th);
						continue;
				}
			}
		}
	}
};

PaletteEngine.selectTiles = function (
	this: typeof Palette,
	x: number,
	y: number,
	width: number,
	height: number
) {
	if (Scene.brush === 'eraser') {
		Scene.switchBrush('pencil');
	}

	const tileset = getPaletteStore().tileset;
	const sro = tileset.width;
	const dTiles = Scene.createTiles(width, height);
	const dro = dTiles.rowOffset;
	const bx = x;
	const by = y;
	const ex = x + width;
	const ey = y + height;
	switch (tileset.type) {
		case 'normal':
			for (let y = by; y < ey; y++) {
				for (let x = bx; x < ex; x++) {
					const di = x - bx + (y - by) * dro;
					dTiles[di] = (1 << 24) | (y << 16) | (x << 8);
				}
			}
			break;
		case 'auto': {
			const sTiles = tileset.tiles;
			for (let y = by; y < ey; y++) {
				for (let x = bx; x < ex; x++) {
					const si = x + y * sro;
					if (sTiles[si] !== 0) {
						const di = x - bx + (y - by) * dro;
						dTiles[di] = (1 << 24) | (y << 16) | (x << 8);
					}
				}
			}
			break;
		}
	}

	if (this.explicit) {
		this.explicit = false;
		removeClass(this.marquee, 'explicit');
	}

	Scene.marquee.tilesetMap = this.tilesetMap;
	Scene.marquee.tilesetMap[1] = this.meta.guid;

	const marquee = Scene.marquee.key === 'tile' ? Scene.marquee : Scene.marquee.saveData.tile;
	marquee.tiles = dTiles;
	marquee.width = width;
	marquee.height = height;
	marquee.offsetX = 0;
	marquee.offsetY = 0;

	dTiles.standard = dTiles;
};

PaletteEngine.copyTilesFromScene = function (
	this: typeof Palette,
	x: number,
	y: number,
	width: number,
	height: number
) {
	const sTiles = Scene.tilemap.tiles;
	const sro = sTiles.rowOffset;
	const dTiles = Scene.createTiles(width, height);
	const dro = dTiles.rowOffset;
	const bx = x;
	const by = y;
	const ex = x + width;
	const ey = y + height;

	if (this.explicit) {
		this.explicit = false;
		removeClass(this.marquee, 'explicit');
	}

	Scene.marquee.tilesetMap = Scene.tilemap.tilesetMap;

	const marquee = Scene.marquee.key === 'tile' ? Scene.marquee : Scene.marquee.saveData.tile;
	marquee.tiles = dTiles;

	for (let y = by; y < ey; y++) {
		for (let x = bx; x < ex; x++) {
			const si = x + y * sro;
			const di = x - bx + (y - by) * dro;
			dTiles[di] = sTiles[si];
		}
	}

	clear(this.marquee);
};

PaletteEngine.flipTiles = function (this: typeof Palette) {
	const marquee = Scene.marquee;
	if (Scene.state !== 'open' || Scene.dragging !== null || marquee.key !== 'tile') {
		return;
	}
	if (marquee.visible) {
		Scene.requestRendering();
	}
	const tilesetMap = marquee.tilesetMap;
	const tilesets = Data.tilesets;
	const sTiles = marquee.tiles;
	const width = sTiles.width;
	const height = sTiles.height;
	const sro = sTiles.rowOffset;
	const dTiles = Scene.createTiles(width, height);
	const dro = dTiles.rowOffset;
	const rx = width - 1;
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const si = x + y * sro;
			let tile = sTiles[si];
			if (tile !== 0) {
				const di = rx - x + y * dro;
				const guid = tilesetMap[tile >> 24];
				const tileset = tilesets[guid];
				if (tileset !== undefined && tileset.type === 'normal') {
					tile ^= 1;
				}
				dTiles[di] = tile;
			}
		}
	}
	marquee.tiles = dTiles;
	// 如果图块已经是标准化的 则引用自身作为标准图块
	if (sTiles === sTiles.standard) {
		const { tiles } = marquee;
		tiles.standard = tiles;
	}
};

PaletteEngine.scrollToSelection = function (this: typeof Palette, shiftKey: boolean) {
	const marquee = this.marquee;
	if (marquee.visible) {
		const stw = this.scaledTileWidth;
		const sth = this.scaledTileHeight;
		const mx = marquee.x;
		const my = marquee.y;
		const mw = marquee.width;
		const mh = marquee.height;
		const ox = marquee.originX;
		const oy = marquee.originY;
		const mr = mx + mw;
		const mb = my + mh;
		const wh = this.screenWidth / stw / 2;
		const hh = this.screenHeight / sth / 2;
		const toleranceX = 0.5 / stw;
		const toleranceY = 0.5 / sth;
		const x1 = mr - wh + toleranceX;
		const x2 = mx + wh - toleranceX;
		const y1 = mb - hh + toleranceY;
		const y2 = my + hh - toleranceY;
		const meta = this.meta;
		const x =
			shiftKey && mx === ox && mw > 1
				? Math.max(Math.min(meta.x, x2), x1)
				: Math.min(Math.max(meta.x, x1), x2);
		const y =
			shiftKey && my === oy && mh > 1
				? Math.max(Math.min(meta.y, y2), y1)
				: Math.min(Math.max(meta.y, y1), y2);
		if (meta.x !== x || meta.y !== y) {
			this.updateCamera(x, y);
			this.updateTransform();
			this.requestRendering();
			this.screen.updateScrollbars();
		}
	}
};

// 稳定的 bound 渲染函数（Timer 调用无 this——预绑定 Palette，removeUpdater 引用匹配）
let boundRenderingFunction: ((deltaTime: number) => void) | null = null;

PaletteEngine.requestRendering = function (this: typeof Palette) {
	if (getPaletteStore().state === 'open') {
		if (!boundRenderingFunction) {
			boundRenderingFunction = PaletteEngine.renderingFunction.bind(this);
		}
		Timer.appendUpdater!('sharedRendering', boundRenderingFunction!);
	}
};

PaletteEngine.renderingFunction = function (this: typeof Palette) {
	this.drawTileset();
};

PaletteEngine.stopRendering = function (this: typeof Palette) {
	if (boundRenderingFunction) {
		Timer.removeUpdater!('sharedRendering', boundRenderingFunction);
	}
};
