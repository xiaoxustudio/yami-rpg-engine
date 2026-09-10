import { Palette } from './palette.ts';
import { File } from '@app/file/file-system-core.ts';
import { rect, show, write } from '@app/utils/element-utils.ts';
import { headNavOf, lastNavItemOf } from '@app/engine/layout/layout.ts';
import { getPaletteStore } from '@app/stores/palette';

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
			const dPriorities = Array.from({ length: length }).fill(0);
			const dTerrains = Array.from({ length: length }).fill(0);
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
			const dTiles = Array.from({ length: length }).fill(0);
			const dPriorities = Array.from({ length: length }).fill(0);
			const dTerrains = Array.from({ length: length }).fill(0);
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
		const nav = headNavOf(head);
		const item = lastNavItemOf(nav);
		if (!nav || !item) return;
		const nRect = rect(nav);
		const iRect = rect(item);
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
		if (this.marquee.visible && getPaletteStore().mode === 'normal') this.marquee.select();

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
