import { $ } from '@app/utils/dom';
import { write } from '@app/utils/element-utils';
import { GL } from '@app/engine/webgl/webgl-init.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from './scene-window.ts';
import { SceneCameraEngine } from '@app/engine/scene/scene-camera-engine.ts';

Scene.getTileCoords = SceneCameraEngine.getTileCoords;
Scene.getConvertedCoords = SceneCameraEngine.getConvertedCoords;
Scene.getParallaxAnchor = SceneCameraEngine.getParallaxAnchor;
Scene.getGridContext = SceneCameraEngine.getGridContext;
Scene.rasterizeScrollPosition = SceneCameraEngine.rasterizeScrollPosition;
Scene.updateLightTexParameters = SceneCameraEngine.updateLightTexParameters;
Scene.updateCamera = SceneCameraEngine.updateCamera;
Scene.updateTransform = SceneCameraEngine.updateTransform;

Scene.setZoom = (function IIFE() {
	return function (this: typeof Scene, zoom: number) {
		const slider = $('#scene-zoom');
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
			if (slider) write(slider, zoom);
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

Scene.setSize = function (this: typeof Scene, width: number, height: number) {
	if (this.width === width && this.height === height) {
		return;
	}
	this.closeMapRecord();
	this.planToSaveTerrains();
	this.history.save({
		type: 'scene-resize',
		editor: Inspector.fileScene,
		width: this.width,
		height: this.height,
		terrains: this.terrains
	});
	const dTerrains = this.createTerrains(width, height);
	const dro = dTerrains.rowOffset;
	const sTerrains = this.terrains;
	const sro = sTerrains.rowOffset;
	const ex = Math.min(width, this.width);
	const ey = Math.min(height, this.height);
	for (let y = 0; y < ey; y++) {
		for (let x = 0; x < ex; x++) {
			const si = x + y * sro;
			const di = x + y * dro;
			dTerrains[di] = sTerrains[si];
		}
	}
	this.terrains = dTerrains;
	this.width = width;
	this.height = height;
	this.resize();
	this.requestRendering!();
};

Scene.setTileSize = function (this: typeof Scene, tileWidth: number, tileHeight: number) {
	this.tileWidth = tileWidth;
	this.tileHeight = tileHeight;
	this.resize();
	this.requestRendering!();
};

Scene.setTilemapSize = function (
	this: typeof Scene,
	tilemap: {
		width: number;
		height: number;
		changed?: boolean;
		tiles: Uint32Array & { rowOffset?: number };
		tilesetMap: Record<string, string>;
	},
	width: number,
	height: number
) {
	if (tilemap.width === width && tilemap.height === height) {
		return;
	}
	this.history.save({
		type: 'scene-tilemap-resize',
		editor: Inspector.sceneTilemap,
		tilemap: tilemap,
		width: tilemap.width,
		height: tilemap.height,
		tiles: tilemap.tiles,
		tilesetMap: tilemap.tilesetMap
	});
	const dTiles = this.createTiles(width, height);
	const dro = dTiles.rowOffset;
	const sTiles = tilemap.tiles;
	const sro = sTiles.rowOffset!;
	const ex = Math.min(width, tilemap.width);
	const ey = Math.min(height, tilemap.height);
	for (let y = 0; y < ey; y++) {
		for (let x = 0; x < ex; x++) {
			const si = x + y * sro;
			const di = x + y * dro;
			dTiles[di] = sTiles[si];
		}
	}
	tilemap.tiles = dTiles;
	tilemap.width = width;
	tilemap.height = height;
	tilemap.changed = true;
	this.marquee.resize();
};

Scene.resize = function (this: typeof Scene) {
	if (this.state === 'open' && this.screen && this.screen.clientWidth !== 0) {
		const scale = this.scale;
		const scaledPadding = Math.round(this.padding * scale);
		const scaledTileWidth = Math.round(this.tileWidth * scale);
		const scaledTileHeight = Math.round(this.tileHeight * scale);
		const innerWidth = this.width * scaledTileWidth;
		const innerHeight = this.height * scaledTileHeight;
		const screenBox = CSS.getDevicePixelContentBoxSize(this.screen);
		const screenWidth = screenBox.width;
		const screenHeight = screenBox.height;
		const paddingLeft = Math.max((screenWidth - innerWidth) >> 1, scaledPadding);
		const paddingTop = Math.max((screenHeight - innerHeight) >> 1, scaledPadding);
		const paddingRight = Math.max(screenWidth - innerWidth - paddingLeft, scaledPadding);
		const paddingBottom = Math.max(screenHeight - innerHeight - paddingTop, scaledPadding);
		const outerWidth = innerWidth + paddingLeft + paddingRight;
		const outerHeight = innerHeight + paddingTop + paddingBottom;
		const dpr = window.devicePixelRatio;
		this.scaleX = scaledTileWidth / this.tileWidth;
		this.scaleY = scaledTileHeight / this.tileHeight;
		this.scaledTileWidth = scaledTileWidth;
		this.scaledTileHeight = scaledTileHeight;
		this.aspectRatio = scaledTileWidth / scaledTileHeight;
		this.outerWidth = outerWidth;
		this.outerHeight = outerHeight;
		this.centerOffsetX =
			outerWidth > screenWidth ? screenWidth / 2 : paddingLeft + innerWidth / 2;
		this.centerOffsetY =
			outerHeight > screenHeight ? screenHeight / 2 : paddingTop + innerHeight / 2;
		this.paddingLeft = paddingLeft;
		this.paddingTop = paddingTop;
		this.marquee.style.width = `${outerWidth / dpr}px`;
		this.marquee.style.height = `${outerHeight / dpr}px`;
		GL.resize!(screenWidth, screenHeight);
		GL.resizeLightMap!();
		this.updateLightTexParameters();
		this.updateCamera();
		this.updateTransform();
		this.marquee.resize();
		this.screen.updateScrollbars();
	}
};
