import { relate } from '@app/utils/element-utils';
import { Window } from '@app/tools/window-object.ts';
import { $ } from '@app/utils/dom';
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
} from '@app/utils/element-utils.ts';
import { File } from '@app/file/file-system-core.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { Cursor } from '@app/composables/usePointerObjectWindow';
import { Menu } from '@app/components/menu-list.ts';
import { Data } from '@app/data/data-object.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { Layout } from '@app/engine/layout/layout.ts';
import { SetTileTag } from '@app/module/global.ts';
import { AutoTile } from './auto-tile.ts';
import { FrameGenerator } from './tile-frame-generator.ts';
import { TileFrame } from './tile-frame-index.ts';
import { useTileNodeWindow } from '@app/composables/useTileNodeWindow';
import { createGetter } from '@app/i18n';
import type { EditorProjectShape } from '@app/stores/editor';
import { PaletteEngine } from '@app/engine/palette/palette-engine.ts';
import { GlobalClipboard } from '@app/utils/clipboard';

import { Timer } from '@app/utils/timer';
import { h, render } from 'vue';

export const Palette: Record<string, any> = {
	page: null,
	head: null,
	body: null,
	window: null,
	canvas: null,
	context: null,
	screen: null,
	marquee: null,
	itemScroll: null,
	itemPriority: null,
	itemTag: null,
	itemTerrain: null,
	itemEdit: null,
	zoomSlider: null,
	symbol: null,
	meta: null,
	images: null,
	priorities: null,
	terrains: null,
	dragging: null,
	explicit: false,
	openIndex: null,
	gridColor: null,
	zoomTimer: null,
	scale: null,
	scaleX: null,
	scaleY: null,
	scaledTileWidth: null,
	scaledTileHeight: null,
	outerWidth: null,
	outerHeight: null,
	screenWidth: null,
	screenHeight: null,
	scrollLeft: null,
	scrollTop: null,
	scrollRight: null,
	scrollBottom: null,
	centerOffsetX: null,
	centerOffsetY: null,
	paddingLeft: null,
	paddingTop: null,
	centerX: null,
	centerY: null,
	markCanvas: null,
	tilesetMap: {},
	initialize: null,
	open: null,
	close: null,
	suspend: null,
	resume: null,
	setZoom: null,
	setImage: null,
	setSize: null,
	setTileSize: null,
	setTerrain: null,
	loadImages: null,
	updateHead: null,
	resize: null,
	updateInfo: null,
	editAutoTile: null,
	copyAutoTile: null,
	pasteAutoTile: null,
	deleteAutoTile: null,
	openSelection: null,
	editSelection: null,
	editTagAt: null,
	skipScrollEvent: null,
	switchScroll: null,
	switchPriority: null,
	switchTag: null,
	switchTerrain: null,
	switchEdit: null,
	saveToProject: null,
	loadFromProject: null,
	windowResize: null,
	themechange: null,
	screenKeydown: null,
	screenWheel: null,
	screenUserscroll: null,
	screenBlur: null,
	marqueePointerdown: null,
	marqueePointermove: null,
	marqueePointerleave: null,
	marqueeDoubleclick: null,
	marqueePopup: null,
	pointerup: null,
	pointermove: null
};

interface ClipboardShape {
	has(format: string): boolean;
	read(format: string): { tile: unknown; priority: unknown; terrain: unknown } | undefined;
	write(format: string, object: { tile: unknown; priority: unknown; terrain: unknown }): void;
}

Palette.getTileCoords = PaletteEngine.getTileCoords;
Palette.updateCamera = PaletteEngine.updateCamera;
Palette.updateTransform = PaletteEngine.updateTransform;
Palette.updateBackground = PaletteEngine.updateBackground;
Palette.createMarkCanvas = PaletteEngine.createMarkCanvas;
Palette.rebuildMarkCanvas = PaletteEngine.rebuildMarkCanvas;
Palette.ensureMarkPosition = PaletteEngine.ensureMarkPosition;
Palette.drawTileset = PaletteEngine.drawTileset;
Palette.drawTiles = PaletteEngine.drawTiles;
Palette.drawTileGrid = PaletteEngine.drawTileGrid;
Palette.drawPriorities = PaletteEngine.drawPriorities;
Palette.drawTags = PaletteEngine.drawTags;
Palette.drawTerrains = PaletteEngine.drawTerrains;
Palette.selectTiles = PaletteEngine.selectTiles;
Palette.copyTilesFromScene = PaletteEngine.copyTilesFromScene;
Palette.flipTiles = PaletteEngine.flipTiles;
Palette.scrollToSelection = PaletteEngine.scrollToSelection;
Palette.requestRendering = PaletteEngine.requestRendering;
Palette.renderingFunction = PaletteEngine.renderingFunction;
Palette.stopRendering = PaletteEngine.stopRendering;

Palette.initialize = function (this: typeof Palette) {
	if (!$('#palette-frame')) return;
	this.page = $('#fileTileset');
	this.head = $('#palette-head');
	this.body = $('#palette-body');
	this.window = hide($('#palette-frame'));
	this.canvas = $('#palette-canvas');
	this.screen = $('#palette-screen');
	this.marquee = $('#palette-marquee');
	this.itemScroll = $('#palette-scroll');
	this.itemPriority = $('#palette-priority');
	this.itemTag = $('#palette-tag');
	this.itemTerrain = $('#palette-terrain');
	this.itemEdit = $('#palette-edit');
	this.zoomSlider = $('#palette-zoom');
	addScrollbars(this.screen);

	this.context = this.canvas.getContext('2d', { desynchronized: true });

	this.images = {} as Record<string, HTMLImageElement | symbol | null>;

	this.zoomTimer = new Timer({
		duration: 80,
		update: (timer: Timer) => {
			if (getPaletteStore().state === 'open') {
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
	const createSelection = (id: string) => {
		const host = document.createElement('div');
		render(h('selection', { id }), host);
		const element = host.firstElementChild as HTMLElement & { x: number; y: number };
		host.removeChild(element);
		return element;
	};
	const source = createSelection('source-selection');
	const destination = createSelection('destination-selection');
	const selections: Record<'source' | 'destination', HTMLElement & { x: number; y: number }> = {
		source,
		destination
	};

	marquee.customSelect = function (
		this: HTMLElement & { scaleX: number; scaleY: number },
		key: 'source' | 'destination',
		x: number,
		y: number
	) {
		const selection = selections[key];
		const scaleX = this.scaleX;
		const scaleY = this.scaleY;
		const realX = x * scaleX;
		const realY = y * scaleY;
		const realWidth = scaleX;
		const realHeight = scaleY;
		selection.x = x;
		selection.y = y;
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
	marquee.customUnselect = function (this: HTMLElement, key: 'source' | 'destination') {
		selections[key].remove();
	};

	marquee.customShiftAutoTile = function (this: HTMLElement) {
		source.remove();
		destination.remove();
		const { x: sx, y: sy } = source;
		const { x: dx, y: dy } = destination;
		if (sx !== dx || sy !== dy) {
			const tileset = getPaletteStore().tileset;
			if (!tileset) return;
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
	useTileNodeWindow().initialize();
};

Palette.open = function (
	this: typeof Palette,
	meta: { guid: string; path?: string } & Record<string, any>
) {
	if (!meta || meta === this.meta) {
		return;
	}
	this.close();
	const data = Data.tilesets[meta.guid];
	if (data) {
		getPaletteStore().state = 'loading';
		this.meta = meta;
		getPaletteStore().tileset = data;
		this.loadImages();
		// 如果在编辑模式中打开普通图块组，则关闭编辑模式
		if (getPaletteStore().mode === 'edit' && data.type === 'normal') {
			this.switchEdit();
		}
	} else {
		Inspector.close('tileset');
		Window.confirm!(
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

Palette.close = function (this: typeof Palette) {
	if (getPaletteStore().state !== 'closed') {
		getPaletteStore().state = 'closed';
		this.symbol = null;
		this.meta = null;
		getPaletteStore().tileset = null;
		hide(this.window);
		clear(this.marquee);
		this.stopRendering();
	}
};

Palette.suspend = function (this: typeof Palette) {
	if (getPaletteStore().state === 'open') {
		getPaletteStore().state = 'suspended';
		this.stopRendering();
	}
};

Palette.resume = function (this: typeof Palette) {
	if (getPaletteStore().state === 'suspended') {
		getPaletteStore().state = 'open';
		this.resize();
		this.requestRendering();
	}
};

Palette.setZoom = (function IIFE() {
	return function (this: typeof Palette, zoom: number) {
		if (getPaletteStore().zoom !== zoom) {
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
			getPaletteStore().zoom = zoom;
			if (this.zoomSlider) write(this.zoomSlider, zoom);
			if (getPaletteStore().state === 'open') {
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

Palette.setImage = function (this: typeof Palette, image: string) {
	const tileset = getPaletteStore().tileset;
	if (!tileset) return;
	tileset.image = image;
	this.loadImages();
};

Palette.setSize = function (this: typeof Palette, width: number, height: number) {
	const length = width * height;
	const tileset = getPaletteStore().tileset;
	if (!tileset) return;
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

Palette.setTileSize = function (this: typeof Palette, tileWidth: number, tileHeight: number) {
	const tileset = getPaletteStore().tileset;
	if (!tileset) return;
	tileset.tileWidth = tileWidth;
	tileset.tileHeight = tileHeight;
	this.resize();
	this.updateCamera();
	this.requestRendering();
};

Palette.setTerrain = function (this: typeof Palette, x: number, y: number, offset: number) {
	const tileset = getPaletteStore().tileset;
	if (!tileset) return;
	const terrains = tileset.terrains;
	const i = x + y * tileset.width;
	if (tileset.type === 'normal' || tileset.tiles[i] !== 0) {
		terrains[i] = (terrains[i] + 3 + offset) % 3;
		this.requestRendering();
		File.planToSave!(this.meta);
	}
};

Palette.loadImages = async function (this: typeof Palette) {
	const last = (this.images = this.images ?? {});
	const images = { '': null } as Record<string, HTMLImageElement | symbol | null>;
	const promises: Promise<void>[] = [];
	const tileset = getPaletteStore().tileset;
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
						}).then((image: HTMLImageElement) => {
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
								}).then((image: HTMLImageElement) => {
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
			getPaletteStore().state = 'open';
			this.resize();
			this.requestRendering();
		} else {
			getPaletteStore().state = 'suspended';
		}
	}
};

Palette.updateHead = function (this: typeof Palette) {
	const { page, head } = this;
	if (page.clientWidth !== 0) {
		const { nav } = Layout.getGroupOfElement(head);
		const nRect = rect(nav);
		const iRect = rect(nav.lastChild as HTMLElement);
		const left = iRect.right - nRect.left;
		head.style.left = `${left}px`;
	}
};

Palette.resize = function (this: typeof Palette) {
	if (getPaletteStore().state === 'open') {
		const tileset = getPaletteStore().tileset;
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
		this.marquee.visible && getPaletteStore().mode === 'normal' && this.marquee.select();

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

Palette.updateInfo = function (
	this: typeof Palette,
	index: number | null = getPaletteStore().activeIndex
) {
	getPaletteStore().setActiveIndex(index);
};

Palette.editAutoTile = function (this: typeof Palette, index: number) {
	if (getPaletteStore().tileset.type === 'auto') {
		const tiles = getPaletteStore().tileset.tiles;
		if (index < tiles.length) {
			const tile = tiles[index];
			this.openIndex = index;
			AutoTile.open!(tile || AutoTile.create!());
		}
	}
};

Palette.copyAutoTile = function (this: typeof Palette, index: number) {
	if (getPaletteStore().tileset.type === 'auto') {
		const tileset = getPaletteStore().tileset;
		const tiles = tileset.tiles;
		const priorities = tileset.priorities;
		const terrains = tileset.terrains;
		if (tiles[index]) {
			(GlobalClipboard as unknown as ClipboardShape).write('yami.tile', {
				tile: tiles[index],
				priority: priorities[index],
				terrain: terrains[index]
			});
		}
	}
};

Palette.pasteAutoTile = function (this: typeof Palette, index: number) {
	if (getPaletteStore().tileset.type === 'auto') {
		const tileset = getPaletteStore().tileset;
		const tiles = tileset.tiles;
		const priorities = tileset.priorities;
		const terrains = tileset.terrains;
		const copy = (GlobalClipboard as unknown as ClipboardShape).read('yami.tile');
		if (copy && index < tiles.length) {
			tiles[index] = copy.tile;
			priorities[index] = copy.priority;
			terrains[index] = copy.terrain;
			this.requestRendering();
			File.planToSave!(this.meta);
		}
	}
};

Palette.deleteAutoTile = function (this: typeof Palette, index: number) {
	if (getPaletteStore().tileset.type === 'auto') {
		const tileset = getPaletteStore().tileset;
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

Palette.openSelection = function (this: typeof Palette) {
	const tileset = getPaletteStore().tileset;
	const { marquee } = this;
	if (tileset.type === 'auto' && marquee.visible) {
		const { x, y, width, height } = marquee;
		const i = x + y * tileset.width;
		const tile = tileset.tiles[i];
		if (tile !== 0) {
			const template = Data.autotiles.map[tile.template];
			const image = this.images[tile.image];
			if (width === 1 && height === 1 && template !== undefined && image instanceof Image) {
				useTileNodeWindow().open(template.nodes, image, tile.x, tile.y);
			}
		}
	}
};

Palette.editSelection = function (this: typeof Palette) {
	const tileset = getPaletteStore().tileset;
	const { marquee } = this;
	if (tileset.type === 'auto' && marquee.visible) {
		const { x, y, width, height } = marquee;
		const i = x + y * tileset.width;
		if (width === 1 && height === 1 && i < tileset.tiles.length) {
			Palette.editAutoTile(i);
		}
	}
};

Palette.editTagAt = function (this: typeof Palette, x: number, y: number) {
	const tileset = getPaletteStore().tileset;
	const tags = tileset?.tags;
	if (!tags) return;
	const i = x + y * tileset.width;
	if (i < 0 || i >= tags.length) return;
	SetTileTag.open!(tags[i], (tag: unknown) => {
		if (tags[i] === tag) return;
		tags[i] = tag;
		this.updateInfo();
		this.requestRendering();
		Scene.requestRendering();
		File.planToSave!(this.meta);
	});
};

Palette.skipScrollEvent = (function IIFE() {
	const restore = () => {
		if (getPaletteStore().scrollable) {
			on(Palette.screen, 'scroll', Palette.screenUserscroll);
		}
	};
	const restoreDelay = () => {
		requestAnimationFrame(restore);
	};
	return () => {
		if (getPaletteStore().scrollable) {
			off(Palette.screen, 'scroll', Palette.screenUserscroll);
			// 在动画队列中调用此方法就不需要了
			window.event?.type === 'resize'
				? requestAnimationFrame(restoreDelay)
				: requestAnimationFrame(restore);
		}
	};
})();

Palette.switchScroll = (function IIFE() {
	return function (this: typeof Palette, enabled = !getPaletteStore().scrollable) {
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
		getPaletteStore().scrollable = enabled;
	};
})();

Palette.switchPriority = (function IIFE() {
	return function (this: typeof Palette, enabled = getPaletteStore().mode !== 'priority') {
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
		getPaletteStore().mode = enabled ? 'priority' : 'normal';
		this.requestRendering();
	};
})();

Palette.switchTag = (function IIFE() {
	return function (this: typeof Palette, enabled = getPaletteStore().mode !== 'tag') {
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
		getPaletteStore().mode = enabled ? 'tag' : 'normal';
		this.requestRendering();
	};
})();

Palette.switchTerrain = (function IIFE() {
	return function (this: typeof Palette, enabled = getPaletteStore().mode !== 'terrain') {
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
		getPaletteStore().mode = enabled ? 'terrain' : 'normal';
		this.requestRendering();
	};
})();

Palette.switchEdit = (function IIFE() {
	return function (this: typeof Palette, enabled = getPaletteStore().mode !== 'edit') {
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
		getPaletteStore().mode = enabled ? 'edit' : 'normal';
		this.requestRendering();
	};
})();

Palette.saveToProject = function (this: typeof Palette, project: EditorProjectShape) {
	const { palette } = project;
	const zoom = getPaletteStore().zoom;
	if (zoom !== null) {
		palette.zoom = zoom;
	}
};

Palette.loadFromProject = function (this: typeof Palette, project: EditorProjectShape) {
	const { palette } = project;
	this.setZoom(palette.zoom);
};

Palette.windowResize = function (this: typeof Palette, event: Event) {
	if (this.body.clientWidth === 0) {
		return this.suspend();
	}
	this.updateHead();
	switch (getPaletteStore().state) {
		case 'open':
			this.resize();
			this.requestRendering();
			break;
		case 'suspended':
			this.resume();
			break;
	}
}.bind(Palette);

Palette.themechange = function (this: typeof Palette, event: Event) {
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

Palette.screenKeydown = function (this: typeof Palette, event: KeyboardEvent) {
	switch (event.code) {
		case 'Space':
			event.preventDefault();
			break;
	}
	if (getPaletteStore().state === 'open' && Palette.dragging === null) {
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
				const tileset = getPaletteStore().tileset;
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
				Palette.setZoom(getPaletteStore().zoom - 1);
				break;
			case 'Equal':
			case 'NumpadAdd':
				Palette.setZoom(getPaletteStore().zoom + 1);
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
		callback: (timer: Timer) => {
			timerIsWorking = false;
			Palette.screen.endScrolling();
		}
	});
	return function (this: typeof Palette, event: WheelEvent) {
		if (getPaletteStore().scrollable) {
			timer.elapsed = 0;
			if (!timerIsWorking) {
				timerIsWorking = true;
				timer.add();
				this.screen.beginScrolling();
			}
		} else {
			event.preventDefault();
			if (event.deltaY !== 0 && this.dragging === null) {
				this.setZoom(getPaletteStore().zoom + (event.deltaY > 0 ? -1 : 1));
			}
		}
	}.bind(Palette);
})();

Palette.screenUserscroll = function (this: typeof Palette, event: Event) {
	if (getPaletteStore().state === 'open') {
		this.screen.rawScrollLeft = this.screen.scrollLeft;
		this.screen.rawScrollTop = this.screen.scrollTop;
		this.updateTransform();
		this.updateBackground();
		this.requestRendering();
		this.screen.updateScrollbars();
	}
}.bind(Palette);

Palette.screenBlur = function (this: typeof Palette, event: Event) {
	if (this.dragging) {
		this.pointerup(this.dragging);
	}
}.bind(Palette);

Palette.marqueePointerdown = function (
	this: typeof Palette,
	event: PointerEvent & {
		dragKey?: boolean;
		mode?: string;
		scrollLeft?: number;
		scrollTop?: number;
		active?: boolean;
		startX?: number;
		startY?: number;
		startIndex?: number;
		priorities?: number[];
		tags?: number[];
		tiles?: number[];
	}
) {
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
				const tileset = getPaletteStore().tileset;
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
			switch (getPaletteStore().mode) {
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
					const tileset = getPaletteStore().tileset;
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
					const tileset = getPaletteStore().tileset;
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
					const tileset = getPaletteStore().tileset;
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
			switch (getPaletteStore().mode) {
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
					const tileset = getPaletteStore().tileset;
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
					const tileset = getPaletteStore().tileset;
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

Palette.marqueePointermove = function (this: typeof Palette, event: PointerEvent) {
	if (this.dragging === null) {
		const tileset = getPaletteStore().tileset;
		if (!tileset) return;
		const { x, y } = this.getTileCoords(event, true);
		const index = x + y * tileset.width;
		if (getPaletteStore().activeIndex !== index) {
			getPaletteStore().activeIndex = index;
			this.updateInfo(index);
			this.requestRendering();
		}
	}
}.bind(Palette);

Palette.marqueePointerleave = function (this: typeof Palette, event: PointerEvent) {
	if (getPaletteStore().activeIndex !== null) {
		getPaletteStore().activeIndex = null;
		this.updateInfo(null);
		this.requestRendering();
	}
}.bind(Palette);

Palette.marqueeDoubleclick = function (this: typeof Palette, event: PointerEvent) {
	if (getPaletteStore().mode === 'tag') {
		const { x, y } = this.getTileCoords(event, true);
		this.editTagAt(x, y);
		return;
	}
	this.openSelection();
}.bind(Palette);

Palette.marqueePopup = function (this: typeof Palette, event: PointerEvent) {
	if (getPaletteStore().mode === 'edit' && getPaletteStore().tileset.type === 'auto') {
		const { x, y } = this.getTileCoords(event, true);
		const tiles = getPaletteStore().tileset.tiles;
		const index = x + y * getPaletteStore().tileset.width;
		const existing = !!tiles[index];
		const editable = true;
		const copyable = existing;
		const pastable = (GlobalClipboard as unknown as ClipboardShape).has('yami.tile');
		const deletable = existing;
		const get = createGetter('menuTileset');
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

Palette.pointerup = function (this: typeof Palette, event: PointerEvent) {
	const { dragging } = this;
	if (dragging && relate(dragging, event)) {
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

Palette.pointermove = function (this: typeof Palette, event: PointerEvent) {
	const { dragging } = this;
	if (dragging && relate(dragging, event)) {
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

const paletteBridgeKeys = [
	'state',
	'mode',
	'zoom',
	'showGrid',
	'scrollable',
	'activeIndex',
	'tileset'
] as const;
import { getPaletteStore } from '@app/stores/palette';

for (const key of paletteBridgeKeys) {
	Object.defineProperty(Palette, key, {
		get: () => getPaletteStore()[key],
		set: (value: any) => {
			(getPaletteStore() as unknown as Record<string, any>)[key] = value;
		},
		configurable: true
	});
}
