import { relate, getRelativeCoords } from '@/util/element-utils';
import { $ } from '@/util/dom.ts';
import {
	addClass,
	addScrollbars,
	clear,
	hide,
	off,
	on,
	rect,
	removeClass,
	show,
	write
} from '@/util/element-utils.ts';
import { File } from '@/file/file-system-core.ts';
import { Scene } from '@/scene/scene-window.ts';
import { Cursor } from '@/tools/pointer-object.ts';
import { Menu } from '@/components/menu-list.ts';
import { Data } from '@/data/data-object.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { Layout } from '@/layout/layout.ts';
import { SetTileTag } from '@/module/global.ts';
import { AutoTile } from './auto-tile.ts';
import { FrameGenerator } from './tile-frame-generator.ts';
import { TileFrame } from './tile-frame-index.ts';
import { TileNode } from './tile-node-window.ts';
import { Local } from '@/tools/localization.ts';
function getWindow() {
	return (window as any).Window;
}
import { Timer } from '@/util/timer.ts';

export const Palette = {
	state: 'closed',
	page: null as any,
	head: null as any,
	body: null as any,
	window: null as any,
	canvas: null as any,
	context: null as any,
	screen: null as any,
	marquee: null as any,
	info: null as any,
	itemScroll: null as any,
	itemPriority: null as any,
	itemTag: null as any,
	itemTerrain: null as any,
	itemEdit: null as any,
	zoomSlider: null as any,
	symbol: null as any,
	meta: null as any,
	tileset: null as any,
	images: null as any,
	priorities: null as any,
	terrains: null as any,
	dragging: null as any,
	explicit: false,
	mode: 'normal',
	scrollable: false,
	showGrid: true,
	activeIndex: null as any,
	openIndex: null as any,
	gridColor: null as any,
	zoom: null as any,
	zoomTimer: null as any,
	scale: null as any,
	scaleX: null as any,
	scaleY: null as any,
	scaledTileWidth: null as any,
	scaledTileHeight: null as any,
	outerWidth: null as any,
	outerHeight: null as any,
	screenWidth: null as any,
	screenHeight: null as any,
	scrollLeft: null as any,
	scrollTop: null as any,
	scrollRight: null as any,
	scrollBottom: null as any,
	centerOffsetX: null as any,
	centerOffsetY: null as any,
	paddingLeft: null as any,
	paddingTop: null as any,
	centerX: null as any,
	centerY: null as any,
	markCanvas: null as any,
	tilesetMap: {},
	initialize: null as any,
	open: null as any,
	close: null as any,
	suspend: null as any,
	resume: null as any,
	setZoom: null as any,
	setImage: null as any,
	setSize: null as any,
	setTileSize: null as any,
	setTerrain: null as any,
	loadImages: null as any,
	updateHead: null as any,
	resize: null as any,
	getTileCoords: null as any,
	updateCamera: null as any,
	updateTransform: null as any,
	updateBackground: null as any,
	updateInfo: null as any,
	createMarkCanvas: null as any,
	rebuildMarkCanvas: null as any,
	ensureMarkPosition: null as any,
	drawTileset: null as any,
	drawTiles: null as any,
	drawTileGrid: null as any,
	drawPriorities: null as any,
	drawTags: null as any,
	drawTerrains: null as any,
	editAutoTile: null as any,
	copyAutoTile: null as any,
	pasteAutoTile: null as any,
	deleteAutoTile: null as any,
	selectTiles: null as any,
	copyTilesFromScene: null as any,
	flipTiles: null as any,
	openSelection: null as any,
	editSelection: null as any,
	editTagAt: null as any,
	scrollToSelection: null as any,
	requestRendering: null as any,
	renderingFunction: null as any,
	stopRendering: null as any,
	skipScrollEvent: null as any,
	switchScroll: null as any,
	switchPriority: null as any,
	switchTag: null as any,
	switchTerrain: null as any,
	switchEdit: null as any,
	saveToProject: null as any,
	loadFromProject: null as any,
	windowResize: null as any,
	themechange: null as any,
	screenKeydown: null as any,
	screenWheel: null as any,
	screenUserscroll: null as any,
	screenBlur: null as any,
	marqueePointerdown: null as any,
	marqueePointermove: null as any,
	marqueePointerleave: null as any,
	marqueeDoubleclick: null as any,
	marqueePopup: null as any,
	pointerup: null as any,
	pointermove: null as any
};

Palette.initialize = function (this: any) {
	if (!$('#palette-frame')) return;
	this.page = $('#fileTileset');
	this.head = $('#palette-head');
	this.body = $('#palette-body');
	this.window = hide($('#palette-frame'));
	this.canvas = $('#palette-canvas');
	this.screen = $('#palette-screen');
	this.marquee = $('#palette-marquee');
	this.info = $('#palette-info');
	this.itemScroll = $('#palette-scroll');
	this.itemPriority = $('#palette-priority');
	this.itemTag = $('#palette-tag');
	this.itemTerrain = $('#palette-terrain');
	this.itemEdit = $('#palette-edit');
	this.zoomSlider = $('#palette-zoom');
	addScrollbars(this.screen);

	this.context = this.canvas.getContext('2d', { desynchronized: true });

	this.images = {} as Record<string, any>;

	this.zoomTimer = new Timer({
		duration: 80,
		update: (timer: any) => {
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

	const marquee = this.marquee;
	const source: any = document.createElement('selection');
	const destination: any = document.createElement('selection');
	const selections = { source, destination } as Record<string, any>;
	source.id = 'source-selection';
	destination.id = 'destination-selection';

	marquee.customSelect = function (this: any, key: any, x: any, y: any) {
		const selection = selections[key];
		const scaleX = this.scaleX;
		const scaleY = this.scaleY;
		const realX = x * scaleX;
		const realY = y * scaleY;
		const realWidth = scaleX;
		const realHeight = scaleY;
		(selection as HTMLElement & { x: number; y: number }).x = x;
		(selection as HTMLElement & { x: number; y: number }).y = y;
		if (selection === destination && source.x === x && source.y === y) {
			return selection.remove();
		}
		if (!selection.parentNode) {
			this.appendChild(selection);
		}
		selection.style.left = `${realX}px`;
		selection.style.top = `${realY}px`;
		selection.style.width = `${realWidth}px`;
		selection.style.height = `${realHeight}px`;
	};

	// 选框区域自定义方法 - 取消选择
	marquee.customUnselect = function (this: any, key: any) {
		selections[key].remove();
	};

	marquee.customShiftAutoTile = function (this: any) {
		source.remove();
		destination.remove();
		const { x: sx, y: sy } = source as HTMLElement & {
			x: number;
			y: number;
		};
		const { x: dx, y: dy } = destination as HTMLElement & {
			x: number;
			y: number;
		};
		if (sx !== dx || sy !== dy) {
			const tileset = Palette.tileset;
			const tiles = tileset.tiles;
			const priorities = tileset.priorities;
			const terrains = tileset.terrains;
			const ro = tileset.width;
			const si = sx + sy * ro;
			const di = dx + dy * ro;
			if (tiles[si]) {
				if (tiles[di]) {
					const tile = tiles[si];
					const priority = priorities[si];
					const terrain = terrains[si];
					tiles[si] = tiles[di];
					priorities[si] = priorities[di];
					terrains[si] = terrains[di];
					tiles[di] = tile;
					priorities[di] = priority;
					terrains[di] = terrain;
				} else {
					tiles[di] = tiles[si];
					priorities[di] = priorities[si];
					terrains[di] = terrains[si];
					tiles[si] = 0;
					priorities[si] = 0;
					terrains[si] = 0;
				}
			}
		}
	};

	window.addEventListener('themechange', this.themechange);
	on(this.page, 'resize', this.windowResize);
	on($('#fileTileset-general-detail'), 'toggle', this.windowResize);
	// keydown/wheel 经 Vue 模板转发（FileTilesetPage @keydown/@wheel）
	on(this.screen, 'userscroll', this.screenUserscroll);
	on(this.screen, 'blur', this.screenBlur);
	// marquee pointerdown/doubleclick 经 Vue 模板转发（FileTilesetPage @pointerdown/@doubleclick）；pointermove/pointerleave 仍由 switch 系列动态挂接

	AutoTile.initialize!();
	FrameGenerator.initialize!();
	TileFrame.initialize!();
	TileNode.initialize!();
};

Palette.open = function (this: any, meta: any) {
	if (!meta || meta === this.meta) {
		return;
	}
	this.close();
	const data = Data.tilesets[meta.guid];
	if (data) {
		this.state = 'loading';
		this.meta = meta;
		this.tileset = data;
		this.loadImages();
		// 如果在编辑模式中打开普通图块组，则关闭编辑模式
		if (this.mode === 'edit' && data.type === 'normal') {
			this.switchEdit();
		}
	} else {
		Inspector.close('tileset');
		getWindow().confirm(
			{
				message: `Failed to read file: ${meta.path}`
			},
			[
				{
					label: 'Confirm'
				}
			]
		);
	}
};

Palette.close = function (this: any) {
	if (this.state !== 'closed') {
		this.state = 'closed';
		this.symbol = null;
		this.meta = null;
		this.tileset = null;
		hide(this.window);
		clear(this.marquee);
		this.stopRendering();
	}
};

Palette.suspend = function (this: any) {
	if (this.state === 'open') {
		this.state = 'suspended';
		this.stopRendering();
	}
};

Palette.resume = function (this: any) {
	if (this.state === 'suspended') {
		this.state = 'open';
		this.resize();
		this.requestRendering();
	}
};

Palette.setZoom = (function IIFE() {
	return function (this: any, zoom: any) {
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
			if (this.zoomSlider) write(this.zoomSlider, zoom);
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

Palette.setImage = function (this: any, image: any) {
	this.tileset.image = image;
	this.loadImages();
};

Palette.setSize = function (this: any, width: any, height: any) {
	const length = width * height;
	const tileset = this.tileset;
	switch (tileset.type) {
		case 'normal': {
			const dPriorities = new Array(length).fill(0);
			const dTerrains = new Array(length).fill(0);
			const dro = width;
			const sPriorities = tileset.priorities;
			const sTerrains = tileset.terrains;
			const sro = tileset.width;
			const ex = Math.min(width, tileset.width);
			const ey = Math.min(height, tileset.height);
			for (let y = 0; y < ey; y++) {
				for (let x = 0; x < ex; x++) {
					const di = x + y * dro;
					const si = x + y * sro;
					dPriorities[di] = sPriorities[si];
					dTerrains[di] = sTerrains[si];
				}
			}
			tileset.width = width;
			tileset.height = height;
			tileset.priorities = dPriorities;
			tileset.terrains = dTerrains;
			break;
		}
		case 'auto': {
			const dTiles = new Array(length).fill(0);
			const dPriorities = new Array(length).fill(0);
			const dTerrains = new Array(length).fill(0);
			const dro = width;
			const sTiles = tileset.tiles;
			const sPriorities = tileset.priorities;
			const sTerrains = tileset.terrains;
			const sro = tileset.width;
			const ex = Math.min(width, tileset.width);
			const ey = Math.min(height, tileset.height);
			for (let y = 0; y < ey; y++) {
				for (let x = 0; x < ex; x++) {
					const di = x + y * dro;
					const si = x + y * sro;
					dTiles[di] = sTiles[si];
					dPriorities[di] = sPriorities[si];
					dTerrains[di] = sTerrains[si];
				}
			}
			tileset.width = width;
			tileset.height = height;
			tileset.tiles = dTiles;
			tileset.priorities = dPriorities;
			tileset.terrains = dTerrains;
			break;
		}
	}
	this.resize();
	this.updateCamera();
	this.requestRendering();
};

Palette.setTileSize = function (this: any, tileWidth: any, tileHeight: any) {
	const tileset = this.tileset;
	tileset.tileWidth = tileWidth;
	tileset.tileHeight = tileHeight;
	this.resize();
	this.updateCamera();
	this.requestRendering();
};

Palette.setTerrain = function (this: any, x: any, y: any, offset: any) {
	const tileset = this.tileset;
	const terrains = tileset.terrains;
	const i = x + y * tileset.width;
	if (tileset.type === 'normal' || tileset.tiles[i] !== 0) {
		terrains[i] = (terrains[i] + 3 + offset) % 3;
		this.requestRendering();
		File.planToSave!(this.meta);
	}
};

Palette.loadImages = async function (this: any) {
	const last = this.images;
	const images = { '': null } as Record<string, any>;
	const promises = [] as any[];
	const tileset = this.tileset;
	switch (tileset.type) {
		case 'normal': {
			const guid = tileset.image;
			if (images[guid] === undefined) {
				if (last[guid] instanceof Image) {
					images[guid] = last[guid];
				} else {
					const symbol = (images[guid] = Symbol());
					promises.push(
						File.get!({
							guid: guid,
							type: 'image'
						}).then((image: any) => {
							if (images[guid] === symbol) {
								images[guid] = image;
							}
						})
					);
				}
			}
			break;
		}
		case 'auto': {
			const tiles = tileset.tiles;
			const length = tiles.length;
			for (let i = 0; i < length; i++) {
				const tile = tiles[i];
				if (tile !== 0) {
					const guid = tile.image;
					if (images[guid] === undefined) {
						if (last[guid] instanceof Image) {
							images[guid] = last[guid];
						} else {
							const symbol = (images[guid] = Symbol());
							promises.push(
								File.get!({
									guid: guid,
									type: 'image'
								}).then((image: any) => {
									if (images[guid] === symbol) {
										images[guid] = image;
									}
								})
							);
						}
					}
				}
			}
			break;
		}
	}
	this.images = images;
	const symbol = (this.symbol = Symbol());
	if (promises.length > 0) {
		await Promise.all(promises);
	}
	if (this.symbol === symbol) {
		this.symbol = null;
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

Palette.updateHead = function (this: any) {
	const { page, head } = this;
	if (page.clientWidth !== 0) {
		const { nav } = Layout.getGroupOfElement(head);
		const nRect = rect(nav);
		const iRect = rect(nav.lastChild as HTMLElement);
		const left = iRect.right - nRect.left;
		if (head.left !== left) {
			head.left = left;
			head.style.left = `${left}px`;
		}
	}
};

Palette.resize = function (this: any) {
	if (this.state === 'open') {
		const tileset = this.tileset;
		const scale = this.scale;
		const scaledTileWidth = Math.round(tileset.tileWidth * scale);
		const scaledTileHeight = Math.round(tileset.tileHeight * scale);
		const innerWidth = tileset.width * scaledTileWidth;
		const innerHeight = tileset.height * scaledTileHeight;
		const screenBox = CSS.getDevicePixelContentBoxSize(this.screen);
		const screenWidth = screenBox.width;
		const screenHeight = screenBox.height;
		const paddingLeft = Math.max((screenWidth - innerWidth) >> 1, 0);
		const paddingTop = Math.max((screenHeight - innerHeight) >> 1, 0);
		const outerWidth = Math.max(innerWidth, screenWidth);
		const outerHeight = Math.max(innerHeight, screenHeight);
		const dpr = window.devicePixelRatio;
		this.scaleX = scaledTileWidth / tileset.tileWidth;
		this.scaleY = scaledTileHeight / tileset.tileHeight;
		this.scaledTileWidth = scaledTileWidth;
		this.scaledTileHeight = scaledTileHeight;
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
		this.marquee.scaleX = scaledTileWidth / dpr;
		this.marquee.scaleY = scaledTileHeight / dpr;
		this.marquee.visible && this.mode === 'normal' && this.marquee.select();

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
			// this.context.imageSmoothingEnabled = scale < 1
			this.context.textAlign = 'center';
			this.context.textBaseline = 'middle';
		}
		this.context.font = `${Math.min(scaledTileWidth >> 1, scaledTileHeight >> 1)}px sans-serif`;
		this.updateCamera();
		this.updateTransform();
		this.skipScrollEvent();
		this.screen.updateScrollbars();
	}
};

Palette.getTileCoords = (function IIFE() {
	const point = { x: 0, y: 0 };
	return function (this: any, event: any, clamp: any = false) {
		const coords = getRelativeCoords(event, this.marquee);
		const tileset = this.tileset;
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

Palette.updateCamera = function (this: any, x = this.meta.x, y = this.meta.y) {
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

Palette.updateTransform = function (this: any) {
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
Palette.updateBackground = function (this: any) {
	const style = this.canvas.style;
	const x = -this.screen.scrollLeft;
	const y = -this.screen.scrollTop;
	if (style.backgroundX !== x || style.backgroundY !== y) {
		style.backgroundX = x;
		style.backgroundY = y;
		style.backgroundPosition = `${x}px ${y}px`;
	}
};

Palette.updateInfo = function (this: any, index = this.activeIndex) {
	getPaletteStore().setActiveIndex(index);
};

Palette.createMarkCanvas = function (this: any) {
	let canvas = this.markCanvas;
	if (canvas === null) {
		const size = 128;
		canvas = document.createElement('canvas');
		canvas.width = 0;
		canvas.height = size * 3;
		canvas.fontSize = size;
		canvas.entries = [] as any[];
		canvas.totalWidth = 0;
		const positions: Record<string, any> = (canvas.positions = {} as Record<string, any>);
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

Palette.rebuildMarkCanvas = function (this: any, canvas: any) {
	const size = canvas.fontSize;
	canvas.width = canvas.totalWidth;
	canvas.height = size * 3;
	const context = canvas.getContext('2d');
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

Palette.ensureMarkPosition = function (this: any, canvas: any, text: any, key: any = text) {
	const positions = canvas.positions;
	const existing = positions[key];
	if (existing) return existing;
	const context = canvas.getContext('2d');
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

Palette.drawTileset = function (this: any) {
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

Palette.drawTiles = function (this: any) {
	const context = this.context;
	const tileset = this.tileset;
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
				}).then((image: any) => {
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
							}).then((image: any) => {
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

Palette.drawTileGrid = function (this: any) {
	if (this.showGrid) {
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

Palette.drawPriorities = function (this: any) {
	if (this.mode === 'priority') {
		const context = this.context;
		const tileset = this.tileset;
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
				activeIndex = this.activeIndex;
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

Palette.drawTags = function (this: any) {
	if (this.mode === 'tag') {
		const context = this.context;
		const tileset = this.tileset;
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
				activeIndex = this.activeIndex;
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

Palette.drawTerrains = function (this: any) {
	if (this.mode === 'terrain') {
		const context = this.context;
		const tileset = this.tileset;
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

Palette.editAutoTile = function (this: any, index: any) {
	if (this.tileset.type === 'auto') {
		const tiles = this.tileset.tiles;
		if (index < tiles.length) {
			const tile = tiles[index];
			this.openIndex = index;
			AutoTile.open!(tile || AutoTile.create!());
		}
	}
};

Palette.copyAutoTile = function (this: any, index: any) {
	if (this.tileset.type === 'auto') {
		const tileset = this.tileset;
		const tiles = tileset.tiles;
		const priorities = tileset.priorities;
		const terrains = tileset.terrains;
		if (tiles[index]) {
			(Clipboard as any).write('yami.tile', {
				tile: tiles[index],
				priority: priorities[index],
				terrain: terrains[index]
			});
		}
	}
};

Palette.pasteAutoTile = function (this: any, index: any) {
	if (this.tileset.type === 'auto') {
		const tileset = this.tileset;
		const tiles = tileset.tiles;
		const priorities = tileset.priorities;
		const terrains = tileset.terrains;
		const copy = (Clipboard as any).read('yami.tile');
		if (copy && index < tiles.length) {
			tiles[index] = copy.tile;
			priorities[index] = copy.priority;
			terrains[index] = copy.terrain;
			this.requestRendering();
			File.planToSave!(this.meta);
		}
	}
};

Palette.deleteAutoTile = function (this: any, index: any) {
	if (this.tileset.type === 'auto') {
		const tileset = this.tileset;
		const tiles = tileset.tiles;
		const priorities = tileset.priorities;
		const terrains = tileset.terrains;
		if (tiles[index]) {
			tiles[index] = 0;
			priorities[index] = 0;
			terrains[index] = 0;
			this.requestRendering();
			File.planToSave!(this.meta);
		}
	}
};

Palette.selectTiles = function (this: any, x: any, y: any, width: any, height: any) {
	if (Scene.brush === 'eraser') {
		Scene.switchBrush('pencil');
	}

	const tileset = this.tileset;
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

Palette.copyTilesFromScene = function (this: any, x: any, y: any, width: any, height: any) {
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

Palette.flipTiles = function (this: any) {
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

Palette.openSelection = function (this: any) {
	const { tileset, marquee } = this;
	if (tileset.type === 'auto' && marquee.visible) {
		const { x, y, width, height } = marquee;
		const i = x + y * tileset.width;
		const tile = tileset.tiles[i];
		if (tile !== 0) {
			const template = Data.autotiles.map[tile.template];
			const image = this.images[tile.image];
			if (width === 1 && height === 1 && template !== undefined && image instanceof Image) {
				TileNode.open!(template.nodes, image, tile.x, tile.y);
			}
		}
	}
};

Palette.editSelection = function (this: any) {
	const { tileset, marquee } = this;
	if (tileset.type === 'auto' && marquee.visible) {
		const { x, y, width, height } = marquee;
		const i = x + y * tileset.width;
		if (width === 1 && height === 1 && i < tileset.tiles.length) {
			Palette.editAutoTile(i);
		}
	}
};

Palette.editTagAt = function (this: any, x: any, y: any) {
	const tileset = this.tileset;
	const tags = tileset?.tags;
	if (!tags) return;
	const i = x + y * tileset.width;
	if (i < 0 || i >= tags.length) return;
	SetTileTag.open!(tags[i], (tag: any) => {
		if (tags[i] === tag) return;
		tags[i] = tag;
		this.updateInfo();
		this.requestRendering();
		Scene.requestRendering();
		File.planToSave!(this.meta);
	});
};

Palette.scrollToSelection = function (this: any, shiftKey: any) {
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

Palette.requestRendering = function (this: any) {
	if (this.state === 'open') {
		Timer.appendUpdater!('sharedRendering', this.renderingFunction);
	}
};

Palette.renderingFunction = function (this: any) {
	Palette.drawTileset();
};

Palette.stopRendering = function (this: any) {
	Timer.removeUpdater!('sharedRendering', this.renderingFunction);
};

Palette.skipScrollEvent = (function IIFE() {
	const restore = () => {
		if (Palette.scrollable) {
			on(Palette.screen, 'scroll', Palette.screenUserscroll);
		}
	};
	const restoreDelay = () => {
		requestAnimationFrame(restore);
	};
	return () => {
		if (Palette.scrollable) {
			off(Palette.screen, 'scroll', Palette.screenUserscroll);
			// 在动画队列中调用此方法就不需要了
			window.event?.type === 'resize'
				? requestAnimationFrame(restoreDelay)
				: requestAnimationFrame(restore);
		}
	};
})();

Palette.switchScroll = (function IIFE() {
	return function (this: any, enabled = !this.scrollable) {
		if (enabled) {
			addClass(this.itemScroll, 'selected');
			addClass(this.screen, 'scrollable');
			on(this.screen, 'scroll', this.screenUserscroll);
			off(this.screen, 'userscroll', this.screenUserscroll);
		} else {
			removeClass(this.itemScroll, 'selected');
			removeClass(this.screen, 'scrollable');
			off(this.screen, 'scroll', this.screenUserscroll);
			on(this.screen, 'userscroll', this.screenUserscroll);
		}
		this.scrollable = enabled;
	};
})();

Palette.switchPriority = (function IIFE() {
	return function (this: any, enabled = this.mode !== 'priority') {
		if (enabled) {
			addClass(this.itemPriority, 'selected');
			this.marquee.visible && hide(this.marquee.selection);
			off(this.marquee, 'doubleclick', this.marqueeDoubleclick);
			on(this.marquee, 'pointermove', this.marqueePointermove);
			on(this.marquee, 'pointerleave', this.marqueePointerleave);
		} else {
			removeClass(this.itemPriority, 'selected');
			this.marquee.visible && show(this.marquee.selection);
			off(this.marquee, 'pointermove', this.marqueePointermove);
			off(this.marquee, 'pointerleave', this.marqueePointerleave);
			on(this.marquee, 'doubleclick', this.marqueeDoubleclick);
		}
		removeClass(this.itemTag, 'selected');
		removeClass(this.itemTerrain, 'selected');
		removeClass(this.itemEdit, 'selected');
		this.mode = enabled ? 'priority' : 'normal';
		this.requestRendering();
	};
})();

Palette.switchTag = (function IIFE() {
	return function (this: any, enabled = this.mode !== 'tag') {
		if (enabled) {
			addClass(this.itemTag, 'selected');
			this.marquee.visible && hide(this.marquee.selection);
			on(this.marquee, 'doubleclick', this.marqueeDoubleclick);
			on(this.marquee, 'pointermove', this.marqueePointermove);
			on(this.marquee, 'pointerleave', this.marqueePointerleave);
		} else {
			removeClass(this.itemTag, 'selected');
			this.marquee.visible && show(this.marquee.selection);
			off(this.marquee, 'pointermove', this.marqueePointermove);
			off(this.marquee, 'pointerleave', this.marqueePointerleave);
			on(this.marquee, 'doubleclick', this.marqueeDoubleclick);
		}
		removeClass(this.itemPriority, 'selected');
		removeClass(this.itemTerrain, 'selected');
		removeClass(this.itemEdit, 'selected');
		this.mode = enabled ? 'tag' : 'normal';
		this.requestRendering();
	};
})();

Palette.switchTerrain = (function IIFE() {
	return function (this: any, enabled = this.mode !== 'terrain') {
		if (enabled) {
			addClass(this.itemTerrain, 'selected');
			this.marquee.visible && hide(this.marquee.selection);
			off(this.marquee, 'doubleclick', this.marqueeDoubleclick);
			on(this.marquee, 'pointermove', this.marqueePointermove);
			on(this.marquee, 'pointerleave', this.marqueePointerleave);
		} else {
			removeClass(this.itemTerrain, 'selected');
			this.marquee.visible && show(this.marquee.selection);
			off(this.marquee, 'pointermove', this.marqueePointermove);
			off(this.marquee, 'pointerleave', this.marqueePointerleave);
			on(this.marquee, 'doubleclick', this.marqueeDoubleclick);
		}
		removeClass(this.itemPriority, 'selected');
		removeClass(this.itemTag, 'selected');
		removeClass(this.itemEdit, 'selected');
		this.mode = enabled ? 'terrain' : 'normal';
		this.requestRendering();
	};
})();

Palette.switchEdit = (function IIFE() {
	return function (this: any, enabled = this.mode !== 'edit') {
		if (enabled) {
			addClass(this.itemEdit, 'selected');
			this.marquee.visible && hide(this.marquee.selection);
			off(this.marquee, 'doubleclick', this.marqueeDoubleclick);
			on(this.marquee, 'pointermove', this.marqueePointermove);
			on(this.marquee, 'pointerleave', this.marqueePointerleave);
		} else {
			removeClass(this.itemEdit, 'selected');
			this.marquee.visible && show(this.marquee.selection);
			off(this.marquee, 'pointermove', this.marqueePointermove);
			off(this.marquee, 'pointerleave', this.marqueePointerleave);
			on(this.marquee, 'doubleclick', this.marqueeDoubleclick);
		}
		removeClass(this.itemPriority, 'selected');
		removeClass(this.itemTag, 'selected');
		removeClass(this.itemTerrain, 'selected');
		this.mode = enabled ? 'edit' : 'normal';
		this.requestRendering();
	};
})();

Palette.saveToProject = function (this: any, project: any) {
	const { palette } = project;
	const zoom = this.zoom;
	if (zoom !== null) {
		palette.zoom = zoom;
	}
};

Palette.loadFromProject = function (this: any, project: any) {
	const { palette } = project;
	this.setZoom(palette.zoom);
};

Palette.windowResize = function (this: any, event: any) {
	if (this.body.clientWidth === 0) {
		return this.suspend();
	}
	this.updateHead();
	switch (this.state) {
		case 'open':
			this.resize();
			this.requestRendering();
			break;
		case 'suspended':
			this.resume();
			break;
	}
}.bind(Palette);

Palette.themechange = function (this: any, event: any) {
	switch (event.value) {
		case 'light':
			this.gridColor = 'rgba(0, 0, 0, 0.5)';
			break;
		case 'dark':
			this.gridColor = 'rgba(255, 255, 255, 0.5)';
			break;
	}
	this.requestRendering();
}.bind(Palette);

Palette.screenKeydown = function (this: any, event: any) {
	switch (event.code) {
		case 'Space':
			event.preventDefault();
			break;
	}
	if (Palette.state === 'open' && Palette.dragging === null) {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter': {
				event.stopPropagation();
				if (event.ctrlKey || event.metaKey) {
					Palette.editSelection();
				} else {
					Palette.openSelection();
				}
				break;
			}
			case 'ArrowLeft':
			case 'ArrowUp':
			case 'ArrowRight':
			case 'ArrowDown': {
				event.preventDefault();
				const marquee = Palette.marquee;
				if (!marquee.visible) return;
				const tileset = Palette.tileset;
				const hframes = tileset.width;
				const vframes = tileset.height;
				let mx = marquee.x;
				let my = marquee.y;
				let mw = marquee.width;
				let mh = marquee.height;
				if (event.shiftKey) {
					const ox = marquee.originX;
					const oy = marquee.originY;
					switch (event.code) {
						case 'ArrowLeft':
							if (mx === ox && mw > 1) {
								mw--;
							} else {
								mx--;
								mw++;
							}
							break;
						case 'ArrowRight':
							if (mx === ox) {
								mw++;
							} else {
								mx++;
								mw--;
							}
							break;
						case 'ArrowUp':
							if (my === oy && mh > 1) {
								mh--;
							} else {
								my--;
								mh++;
							}
							break;
						case 'ArrowDown':
							if (my === oy) {
								mh++;
							} else {
								my++;
								mh--;
							}
							break;
					}
					if (mx >= 0 && mx + mw <= hframes && my >= 0 && my + mh <= vframes) {
						marquee.select(mx, my, mw, mh);
						Palette.selectTiles(mx, my, mw, mh);
						Palette.scrollToSelection(true);
						Scene.requestRendering();
					}
					return;
				}
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
				const x = Math.clamp(mx + offsetX, 0, hframes - mw);
				const y = Math.clamp(my + offsetY, 0, vframes - mh);
				if (mx !== x || my !== y) {
					marquee.select(x, y, mw, mh);
					marquee.originX += x - mx;
					marquee.originY += y - my;
					Palette.selectTiles(x, y, mw, mh);
					Palette.scrollToSelection(false);
					Scene.requestRendering();
				}
				break;
			}
			case 'Minus':
			case 'NumpadSubtract':
				Palette.setZoom(Palette.zoom - 1);
				break;
			case 'Equal':
			case 'NumpadAdd':
				Palette.setZoom(Palette.zoom + 1);
				break;
			case 'Digit0':
			case 'Numpad0':
				Palette.setZoom(2);
				break;
		}
	}
};

Palette.screenWheel = (function IIFE() {
	let timerIsWorking = false;
	const timer = new Timer({
		duration: 400,
		callback: (timer: any) => {
			timerIsWorking = false;
			Palette.screen.endScrolling();
		}
	});
	return function (this: any, event: any) {
		if (this.scrollable) {
			timer.elapsed = 0;
			if (!timerIsWorking) {
				timerIsWorking = true;
				timer.add();
				this.screen.beginScrolling();
			}
		} else {
			event.preventDefault();
			if (event.deltaY !== 0 && this.dragging === null) {
				this.setZoom(this.zoom + (event.deltaY > 0 ? -1 : 1));
			}
		}
	}.bind(Palette);
})();

Palette.screenUserscroll = function (this: any, event: any) {
	if (this.state === 'open') {
		this.screen.rawScrollLeft = this.screen.scrollLeft;
		this.screen.rawScrollTop = this.screen.scrollTop;
		this.updateTransform();
		this.updateBackground();
		this.requestRendering();
		this.screen.updateScrollbars();
	}
}.bind(Palette);

Palette.screenBlur = function (this: any, event: any) {
	if (this.dragging) {
		this.pointerup(this.dragging);
	}
}.bind(Palette);

Palette.marqueePointerdown = function (this: any, event: any) {
	if (this.dragging) {
		return;
	}
	const { x, y } = this.getTileCoords(event, true);
	switch (event.button) {
		case 0: {
			// 如果正在修改图块组宽高，让它立即生效
			document.activeElement!.blur();
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
			if (event.ctrlKey || event.metaKey) {
				const tileset = this.tileset;
				if (tileset.type === 'auto') {
					const i = x + y * tileset.width;
					this.dragging = event;
					event.mode = 'edit';
					event.active = true;
					event.startX = x;
					event.startY = y;
					event.startIndex = i;
					this.marqueePointerleave();
					this.marquee.customSelect('source', x, y);
					window.addEventListener('pointerup', this.pointerup);
					window.addEventListener('pointermove', this.pointermove);
					return;
				}
			}
			const { marquee } = this;
			switch (this.mode) {
				case 'normal':
					if (event.shiftKey && marquee.visible) {
						const ox = marquee.originX;
						const oy = marquee.originY;
						const mx = Math.min(x, ox);
						const my = Math.min(y, oy);
						const mw = Math.abs(x - ox) + 1;
						const mh = Math.abs(y - oy) + 1;
						marquee.select(mx, my, mw, mh);
					} else {
						marquee.select(x, y, 1, 1);
						marquee.originX = x;
						marquee.originY = y;
					}
					if (this.explicit) {
						this.explicit = false;
						removeClass(marquee, 'explicit');
					}
					this.dragging = event;
					event.mode = 'select';
					window.addEventListener('pointerup', this.pointerup);
					window.addEventListener('pointermove', this.pointermove);
					this.screen.addScrollListener('both', this.scaleX / 4, false, () => {
						this.screen.beginScrolling();
						this.updateTransform();
						this.requestRendering();
						this.screen.updateScrollbars();
						this.pointermove(event.latest);
					});
					Scene.marquee.style.pointerEvents = 'none';
					break;
				case 'priority': {
					const tileset = this.tileset;
					const i = x + y * tileset.width;
					this.dragging = event;
					event.mode = 'increase-priority';
					event.active = true;
					event.priorities = tileset.priorities;
					event.startX = x;
					event.startY = y;
					event.startIndex = i;
					this.requestRendering();
					window.addEventListener('pointerup', this.pointerup);
					window.addEventListener('pointermove', this.pointermove);
					break;
				}
				case 'tag': {
					const tileset = this.tileset;
					const i = x + y * tileset.width;
					this.dragging = event;
					event.mode = 'increase-tag';
					event.active = true;
					event.tags = tileset.tags;
					event.startX = x;
					event.startY = y;
					event.startIndex = i;
					this.requestRendering();
					window.addEventListener('pointerup', this.pointerup);
					window.addEventListener('pointermove', this.pointermove);
					break;
				}
				case 'terrain':
					this.setTerrain(x, y, -1);
					// window.addEventListener('pointerup', this.pointerup) window.addEventListener('pointermove', this.pointermove)
					break;
				case 'edit': {
					const tileset = this.tileset;
					const i = x + y * tileset.width;
					switch (tileset.type) {
						case 'normal':
							break;
						case 'auto': {
							const tiles = tileset.tiles;
							if (tiles[i] !== 0) {
								this.dragging = event;
								event.mode = 'ready-to-shift';
								event.active = true;
								event.tiles = tiles;
								event.startX = x;
								event.startY = y;
								event.startIndex = i;
								this.requestRendering();
								marquee.customSelect('source', x, y);
								window.addEventListener('pointerup', this.pointerup);
								window.addEventListener('pointermove', this.pointermove);
							} else {
								event.preventDefault();
								this.editAutoTile(i);
							}
							break;
						}
					}
					break;
				}
			}
			break;
		}
		case 2:
			switch (this.mode) {
				case 'normal':
					this.dragging = event;
					event.mode = 'scroll';
					event.scrollLeft = this.screen.scrollLeft;
					event.scrollTop = this.screen.scrollTop;
					Cursor.open('cursor-grab');
					window.addEventListener('pointerup', this.pointerup);
					window.addEventListener('pointermove', this.pointermove);
					break;
				case 'priority': {
					const tileset = this.tileset;
					const i = x + y * tileset.width;
					this.dragging = event;
					event.mode = 'ready-to-decrease-priority';
					event.active = true;
					event.priorities = tileset.priorities;
					event.startX = x;
					event.startY = y;
					event.startIndex = i;
					event.scrollLeft = this.screen.scrollLeft;
					event.scrollTop = this.screen.scrollTop;
					this.requestRendering();
					window.addEventListener('pointerup', this.pointerup);
					window.addEventListener('pointermove', this.pointermove);
					break;
				}
				case 'tag': {
					const tileset = this.tileset;
					const i = x + y * tileset.width;
					this.dragging = event;
					event.mode = 'ready-to-decrease-tag';
					event.active = true;
					event.tags = tileset.tags;
					event.startX = x;
					event.startY = y;
					event.startIndex = i;
					event.scrollLeft = this.screen.scrollLeft;
					event.scrollTop = this.screen.scrollTop;
					this.requestRendering();
					window.addEventListener('pointerup', this.pointerup);
					window.addEventListener('pointermove', this.pointermove);
					break;
				}
				case 'terrain':
					this.dragging = event;
					event.mode = 'ready-to-increase-terrain';
					event.active = true;
					event.startX = x;
					event.startY = y;
					event.scrollLeft = this.screen.scrollLeft;
					event.scrollTop = this.screen.scrollTop;
					window.addEventListener('pointerup', this.pointerup);
					window.addEventListener('pointermove', this.pointermove);
					break;
				case 'edit':
					this.dragging = event;
					event.mode = 'ready-to-scroll';
					event.scrollLeft = this.screen.scrollLeft;
					event.scrollTop = this.screen.scrollTop;
					window.addEventListener('pointerup', this.pointerup);
					window.addEventListener('pointermove', this.pointermove);
					break;
			}
			break;
	}
}.bind(Palette);

Palette.marqueePointermove = function (this: any, event: any) {
	if (this.dragging === null) {
		const { x, y } = this.getTileCoords(event, true);
		const index = x + y * this.tileset.width;
		if (this.activeIndex !== index) {
			this.activeIndex = index;
			this.updateInfo(index);
			this.requestRendering();
		}
	}
}.bind(Palette);

Palette.marqueePointerleave = function (this: any, event: any) {
	if (this.activeIndex !== null) {
		this.activeIndex = null;
		this.updateInfo(null);
		this.requestRendering();
	}
}.bind(Palette);

Palette.marqueeDoubleclick = function (this: any, event: any) {
	if (this.mode === 'tag') {
		const { x, y } = this.getTileCoords(event, true);
		this.editTagAt(x, y);
		return;
	}
	this.openSelection();
}.bind(Palette);

Palette.marqueePopup = function (this: any, event: any) {
	if (this.mode === 'edit' && this.tileset.type === 'auto') {
		const { x, y } = this.getTileCoords(event, true);
		const tiles = this.tileset.tiles;
		const index = x + y * this.tileset.width;
		const existing = !!tiles[index];
		const editable = true;
		const copyable = existing;
		const pastable = (Clipboard as any).has('yami.tile');
		const deletable = existing;
		const get = Local.createGetter('menuTileset');
		Menu.popup(
			{
				x: event.clientX,
				y: event.clientY,
				minWidth: 0
			},
			[
				{
					label: get('edit'),
					enabled: editable,
					click: () => {
						this.editAutoTile(index);
					}
				},
				{
					label: get('cut'),
					enabled: copyable,
					click: () => {
						this.copyAutoTile(index);
						this.deleteAutoTile(index);
					}
				},
				{
					label: get('copy'),
					enabled: copyable,
					click: () => {
						this.copyAutoTile(index);
					}
				},
				{
					label: get('paste'),
					enabled: pastable,
					click: () => {
						this.pasteAutoTile(index);
					}
				},
				{
					label: get('delete'),
					enabled: deletable,
					click: () => {
						this.deleteAutoTile(index);
					}
				}
			]
		);
	}
};

Palette.pointerup = function (this: any, event: any) {
	const { dragging } = this;
	if (relate(dragging, event)) {
		// 打开窗口时触发的blur事件会导致再次执行pointerup 因此提前重置dragging来避免重复执行
		this.dragging = null;
		switch (dragging.mode) {
			case 'select': {
				const { x, y, width, height } = this.marquee;
				this.selectTiles(x, y, width, height);
				this.screen.endScrolling();
				this.screen.removeScrollListener();
				Scene.marquee.style.pointerEvents = 'inherit';
				break;
			}
			case 'ready-to-scroll':
				if (event.target === this.marquee) {
					this.marqueePopup(event);
				}
				break;
			case 'scroll':
				this.screen.endScrolling();
				Cursor.close('cursor-grab');
				break;
			case 'edit':
				if (dragging.active) {
					this.marquee.customUnselect('source');
					this.editAutoTile(dragging.startIndex);
				}
				break;
			case 'increase-priority':
			case 'ready-to-decrease-priority':
				if (dragging.active) {
					const { priorities } = dragging;
					const i = dragging.startIndex;
					const step = event.button === 0 ? 1 : 9;
					priorities[i] = (priorities[i] + step) % 10;
					this.requestRendering();
					Scene.requestRendering();
					File.planToSave!(this.meta);
				}
				break;
			case 'increase-tag':
			case 'ready-to-decrease-tag':
				break;
			case 'ready-to-increase-terrain':
				this.setTerrain(dragging.startX, dragging.startY, 1);
				break;
			case 'ready-to-shift':
				this.marquee.customUnselect('source');
				this.editAutoTile(dragging.startIndex);
				break;
			case 'shift':
				this.marquee.customShiftAutoTile();
				this.screen.endScrolling();
				this.screen.removeScrollListener();
				this.requestRendering();
				Scene.requestRendering();
				Scene.marquee.style.pointerEvents = 'inherit';
				File.planToSave!(this.meta);
				break;
		}
		window.removeEventListener('pointerup', this.pointerup);
		window.removeEventListener('pointermove', this.pointermove);
	}
}.bind(Palette);

Palette.pointermove = function (this: any, event: any) {
	const { dragging } = this;
	if (relate(dragging, event)) {
		switch (dragging.mode) {
			case 'select': {
				dragging.latest = event;
				const marquee = this.marquee;
				const coords = this.getTileCoords(event, true);
				const x = Math.min(coords.x, marquee.originX);
				const y = Math.min(coords.y, marquee.originY);
				const width = Math.abs(coords.x - marquee.originX) + 1;
				const height = Math.abs(coords.y - marquee.originY) + 1;
				if (
					marquee.x !== x ||
					marquee.y !== y ||
					marquee.width !== width ||
					marquee.height !== height
				) {
					marquee.select(x, y, width, height);
				}
				break;
			}
			case 'ready-to-scroll':
			case 'ready-to-decrease-priority':
			case 'ready-to-decrease-tag':
			case 'ready-to-increase-terrain': {
				const distX = event.clientX - dragging.clientX;
				const distY = event.clientY - dragging.clientY;
				this.screen.setScroll(dragging.scrollLeft - distX, dragging.scrollTop - distY);
				if (Math.sqrt(distX ** 2 + distY ** 2) > 4) {
					dragging.mode = 'scroll';
					Cursor.open('cursor-grab');
				}
				break;
			}
			case 'scroll': {
				const distX = event.clientX - dragging.clientX;
				const distY = event.clientY - dragging.clientY;
				this.screen.beginScrolling();
				this.screen.setScroll(dragging.scrollLeft - distX, dragging.scrollTop - distY);
				break;
			}
			case 'edit': {
				const sx = dragging.startX;
				const sy = dragging.startY;
				const { x, y } = this.getTileCoords(event);
				const active = sx === x && sy === y;
				if (dragging.active !== active) {
					(dragging.active = active)
						? this.marquee.customSelect('source')
						: this.marquee.customUnselect('source');
				}
				break;
			}
			case 'increase-priority':
			case 'increase-tag': {
				const sx = dragging.startX;
				const sy = dragging.startY;
				const { x, y } = this.getTileCoords(event);
				const active = sx === x && sy === y;
				if (dragging.active !== active) {
					dragging.active = active;
					this.requestRendering();
				}
				break;
			}
			case 'ready-to-shift': {
				const distX = event.clientX - dragging.clientX;
				const distY = event.clientY - dragging.clientY;
				if (Math.sqrt(distX ** 2 + distY ** 2) > 4) {
					dragging.mode = 'shift';
					dragging.active = false;
					const x = dragging.startX;
					const y = dragging.startY;
					this.requestRendering();
					this.marquee.customSelect('destination', x, y);
					this.screen.addScrollListener('both', this.scaleX / 4, false, () => {
						this.screen.beginScrolling();
						this.updateTransform();
						this.requestRendering();
						this.screen.updateScrollbars();
						this.pointermove(dragging.latest);
					});
					Scene.marquee.style.pointerEvents = 'none';
				}
				break;
			}
			case 'shift': {
				dragging.latest = event;
				const { x, y } = this.getTileCoords(event, true);
				this.marquee.customSelect('destination', x, y);
				break;
			}
		}
	}
}.bind(Palette);

import { paletteStateKeys, getPaletteStore } from '@app/stores/palette';

for (const key of paletteStateKeys) {
	Object.defineProperty(Palette, key, {
		get: () => getPaletteStore()[key],
		set: (value: any) => {
			(getPaletteStore() as any)[key] = value;
		},
		configurable: true
	});
}
