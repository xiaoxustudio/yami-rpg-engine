import { Data } from '@app/data/data-object.ts';
import { Scene } from '@app/scene/scene-window.ts';
import type { SceneMarqueeSaveData } from '@app/scene/scene-window.ts';
import type { TileBuffer } from '@app/engine/scene/scene-edit-engine.ts';
import { elementDataOf } from '@ui-kit';

interface SceneMarqueeData {
	key: string | null;
}
const marqueeData = (el: unknown): SceneMarqueeData => elementDataOf<SceneMarqueeData>(el);

interface SceneMarqueeEngineShape {
	save: (this: typeof Scene.marquee, key?: string | null) => void;
	switch: (this: typeof Scene.marquee, key: string) => void;
	resize: (this: typeof Scene.marquee) => void;
	clear: (this: typeof Scene.marquee) => void;
	select: (
		this: typeof Scene.marquee,
		x?: number,
		y?: number,
		width?: number,
		height?: number
	) => void;
	selectInPencilMode: (
		this: typeof Scene.marquee,
		x?: number,
		y?: number,
		width?: number,
		height?: number
	) => void;
	selectInRectMode: (
		this: typeof Scene.marquee,
		x?: number,
		y?: number,
		width?: number,
		height?: number
	) => void;
	selectInCopyMode: (
		this: typeof Scene.marquee,
		x?: number,
		y?: number,
		width?: number,
		height?: number
	) => void;
	selectInObjectMode: (this: typeof Scene.marquee, x: number, y: number) => void;
	getTiles: (this: typeof Scene.marquee, raw: boolean) => unknown;
}

export const SceneMarqueeEngine = {} as SceneMarqueeEngineShape;
SceneMarqueeEngine.save = function (this: typeof Scene.marquee, key: string | null = 'default') {
	let data: SceneMarqueeSaveData;
	switch (key) {
		case 'object':
			data = {} as SceneMarqueeSaveData;
			break;
		case 'tile':
			data = {
				x: this.x,
				y: this.y,
				width: this.width,
				height: this.height,
				offsetX: this.offsetX,
				offsetY: this.offsetY,
				tiles: this.tiles
			};
			break;
		case 'terrain':
			data = {
				x: this.x,
				y: this.y,
				width: this.width,
				height: this.height,
				offsetX: this.offsetX,
				offsetY: this.offsetY,
				terrain: this.terrain
			};
			break;
		case 'eraser':
			data = {
				x: this.x,
				y: this.y,
				width: this.width,
				height: this.height,
				offsetX: this.offsetX,
				offsetY: this.offsetY,
				tiles: this.tiles,
				terrain: 0b00
			};
			break;
		default:
			data = {
				x: this.x,
				y: this.y,
				width: this.width,
				height: this.height,
				offsetX: this.offsetX,
				offsetY: this.offsetY
			};
			break;
	}
	this.saveData[key as string] = data;
};

SceneMarqueeEngine.switch = function (this: typeof Scene.marquee, key: string) {
	const data = marqueeData(this);
	if (data.key !== key) {
		this.save(data.key);
		this.restore((data.key = key));
	}
};

SceneMarqueeEngine.resize = function (this: typeof Scene.marquee) {
	if (this.pointerevent !== null) {
		Scene.marqueePointermove!(this.pointerevent);
	}
};

SceneMarqueeEngine.clear = function (this: typeof Scene.marquee) {
	if (this.visible) {
		this.visible = false;
		Scene.requestRendering!();
	}
	if (Scene.info.textContent && !(Scene.layer === 'object' && Scene.target !== null)) {
		Scene.info.textContent = '';
	}
};

SceneMarqueeEngine.select = function (
	this: typeof Scene.marquee,
	x = this.x,
	y = this.y,
	width = this.width,
	height = this.height
) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.visible = true;
	Scene.requestRendering!();
};

SceneMarqueeEngine.selectInPencilMode = function (
	this: typeof Scene.marquee,
	x?: number,
	y?: number,
	width?: number,
	height?: number
) {
	this.backgroundColor = this.backgroundColorNormal;
	this.borderColor = this.borderColorNormal;
	this.previewTiles = true;
	this.select(x, y, width, height);
	const left = this.x - this.offsetX;
	const top = this.y - this.offsetY;
	Scene.info.textContent = `${left},${top}`;
};

SceneMarqueeEngine.selectInRectMode = function (
	this: typeof Scene.marquee,
	x?: number,
	y?: number,
	width?: number,
	height?: number
) {
	this.backgroundColor = this.backgroundColorRect;
	this.borderColor = this.borderColorRect;
	this.previewTiles = false;
	this.select(x, y, width, height);
	Scene.info.textContent = `${this.width} x ${this.height}`;
};

SceneMarqueeEngine.selectInCopyMode = function (
	this: typeof Scene.marquee,
	x?: number,
	y?: number,
	width?: number,
	height?: number
) {
	this.backgroundColor = this.backgroundColorCopy;
	this.borderColor = this.borderColorCopy;
	this.previewTiles = false;
	this.select(x, y, width, height);
	Scene.info.textContent = `${this.width} x ${this.height}`;
};

SceneMarqueeEngine.selectInObjectMode = function (
	this: typeof Scene.marquee,
	x: number,
	y: number
) {
	Scene.info.textContent = `${x},${y}`;
};

SceneMarqueeEngine.getTiles = function (this: typeof Scene.marquee, raw: boolean) {
	const sTiles = this.tiles;
	if (raw) return sTiles;
	let dTiles = sTiles.standard;
	if (dTiles === undefined) {
		dTiles = sTiles;
		const tilesetMap = this.tilesetMap;
		const tilesets = Data.tilesets;
		const length = sTiles.length;
		for (let i = 0; i < length; i++) {
			let tile = sTiles[i];
			if (tile === 0) continue;
			const guid = tilesetMap[tile >> 24];
			const tileset = tilesets[guid];
			if (tileset?.type === 'auto') {
				if (dTiles === sTiles) {
					dTiles = (Scene.cloneTiles as (sTiles: TileBuffer) => TileBuffer)(sTiles);
				}
				dTiles[i] = tile & 0xffffffc0;
			}
		}
		sTiles.standard = dTiles;
	}
	return dTiles;
};
