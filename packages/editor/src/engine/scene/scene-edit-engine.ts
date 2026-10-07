import { Data } from '@app/data/data-object.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';
import { Palette } from '@app/palette/palette.ts';
import type { SceneShape } from '@app/scene/scene-window.ts';

export type TileBuffer = Uint32Array & {
	width: number;
	height: number;
	rowOffset: number;
	standard?: TileBuffer;
};
type TerrainBuffer = Uint8Array & { width: number; height: number; rowOffset: number };

type SceneEditThis = Pick<
	SceneShape,
	| 'brush'
	| 'editInFillMode'
	| 'editInOvalMode'
	| 'editInPencilMode'
	| 'editInRectMode'
	| 'getNewTilesetIndex'
	| 'height'
	| 'marquee'
	| 'patternOriginX'
	| 'patternOriginY'
	| 'planToSave'
	| 'recordMapData'
	| 'requestRendering'
	| 'restoreMapData'
	| 'setTerrain'
	| 'setTile'
	| 'setTileFrame'
	| 'shiftKey'
	| 'terrains'
	| 'tilemap'
	| 'width'
> & {
	layer: string;
	tilemap: { width: number; height: number } | null;
};

type SceneEditEngineShape = {
	edit: (this: SceneEditThis, x: number, y: number, width: number, height: number) => void;
	editInPencilMode: (
		this: SceneEditThis,
		x: number,
		y: number,
		width: number,
		height: number
	) => void;
	editInRectMode: (
		this: SceneEditThis,
		x: number,
		y: number,
		width: number,
		height: number
	) => void;
	editInOvalMode: (
		this: SceneEditThis,
		x: number,
		y: number,
		width: number,
		height: number
	) => void;
	editInFillMode: (this: SceneEditThis, x: number, y: number) => void;
	setTile: (
		this: SceneEditThis,
		sTiles: TileBuffer,
		sx: number,
		sy: number,
		dx: number,
		dy: number
	) => void;
	setTileFrame: (this: SceneEditThis, x: number, y: number) => void;
	setTerrain: (this: SceneEditThis, x: number, y: number) => void;
	createTiles: (this: SceneEditThis, width: number, height: number) => TileBuffer;
	cloneTiles: (this: SceneEditThis, sTiles: TileBuffer) => TileBuffer;
	createTerrains: (this: SceneEditThis, width: number, height: number) => TerrainBuffer;
	getNewTilesetIndex: (this: SceneEditThis, tilesetMap: Record<string, string>) => number;
};

/** `Partial<>` 是**如实描述**：对象在下面按域挂载，`{}` 时确实一个成员都没有。 */
export const SceneEditEngine: Partial<SceneEditEngineShape> = {};

SceneEditEngine.edit = function (
	this: SceneEditThis,
	x: number,
	y: number,
	width: number,
	height: number
) {
	switch (this.brush) {
		case 'eraser':
		case 'pencil':
			this.editInPencilMode(x, y, width, height);
			break;
		case 'rect':
			this.editInRectMode(x, y, width, height);
			break;
		case 'oval':
			this.editInOvalMode(x, y, width, height);
			break;
		case 'fill':
			this.editInFillMode(x, y);
			break;
	}

	this.requestRendering!();

	this.planToSave!();
};

SceneEditEngine.editInPencilMode = function (
	this: SceneEditThis,
	x: number,
	y: number,
	width: number,
	height: number
) {
	const context = this.tilemap ?? this;
	const mapWidth = context.width;
	const mapHeight = context.height;
	const pox = this.patternOriginX;
	const poy = this.patternOriginY;
	const layer = this.layer;
	const shiftKey = this.shiftKey || Palette.explicit;
	const sTiles = this.marquee.getTiles(true);

	const bx = Math.max(x, 0);
	const by = Math.max(y, 0);
	const ex = Math.min(x + width, mapWidth);
	const ey = Math.min(y + height, mapHeight);
	for (let y = by; y < ey; y++) {
		for (let x = bx; x < ex; x++) {
			if (layer === 'terrain') {
				this.setTerrain(x, y);
			} else {
				this.setTile(sTiles, x - pox, y - poy, x, y);
			}
		}
	}

	if (layer !== 'terrain' && !shiftKey) {
		const bx = Math.max(x - 1, 0);
		const by = Math.max(y - 1, 0);
		const ex = Math.min(x + width + 1, mapWidth);
		const ey = Math.min(y + height + 1, mapHeight);
		for (let y = by; y < ey; y++) {
			for (let x = bx; x < ex; x++) {
				this.setTileFrame(x, y);
			}
		}
	}
};

SceneEditEngine.editInRectMode = function (
	this: SceneEditThis,
	x: number,
	y: number,
	width: number,
	height: number
) {
	const context = this.tilemap ?? this;
	const mapWidth = context.width;
	const mapHeight = context.height;
	const pox = this.patternOriginX;
	const poy = this.patternOriginY;
	const layer = this.layer;
	const shiftKey = this.shiftKey || Palette.explicit;
	const sTiles = this.marquee.getTiles(shiftKey);

	this.restoreMapData();

	const bx = Math.max(x, 0);
	const by = Math.max(y, 0);
	const ex = Math.min(x + width, mapWidth);
	const ey = Math.min(y + height, mapHeight);
	for (let y = by; y < ey; y++) {
		for (let x = bx; x < ex; x++) {
			if (layer === 'terrain') {
				this.setTerrain(x, y);
			} else {
				this.setTile(sTiles, x - pox, y - poy, x, y);
			}
		}
	}

	if (layer !== 'terrain' && !shiftKey) {
		const left = x + 1;
		const top = y + 1;
		const right = x + width - 2;
		const bottom = y + height - 2;
		const bx = Math.max(x - 1, 0);
		const by = Math.max(y - 1, 0);
		const ex = Math.min(x + width + 1, mapWidth);
		const ey = Math.min(y + height + 1, mapHeight);
		for (let y = by; y < ey; y++) {
			for (let x = bx; x < ex; x++) {
				if (x < left || x > right || y < top || y > bottom) {
					this.setTileFrame(x, y);
				}
			}
		}
	}
};

SceneEditEngine.editInOvalMode = function (
	this: SceneEditThis,
	x: number,
	y: number,
	width: number,
	height: number
) {
	const context = this.tilemap ?? this;
	const mapWidth = context.width;
	const mapHeight = context.height;
	const pox = this.patternOriginX;
	const poy = this.patternOriginY;
	const layer = this.layer;
	const shiftKey = this.shiftKey || Palette.explicit;
	const sTiles = this.marquee.getTiles(shiftKey);

	this.restoreMapData();

	const rr = (Math.max(width, height) / 2 - 0.1) ** 2;
	const scale = Math.max(width, height) / Math.min(width, height);
	const ox = x + (width - 1) / 2;
	const oy = y + (height - 1) / 2;
	let ovalWidth!: number | undefined;
	let ovalFlags: Uint8Array = new Uint8Array(0);
	let edgeFlags: Uint8Array = new Uint8Array(0);
	if (layer !== 'terrain' && !shiftKey) {
		const bx = Math.max(x, 0) - 1;
		const by = Math.max(y, 0) - 1;
		const ex = Math.min(x + width, mapWidth) + 1;
		const ey = Math.min(y + height, mapHeight) + 1;
		ovalWidth! = ex - bx;
		ovalFlags = new Uint8Array((ex - bx) * (ey - by));
		edgeFlags = new Uint8Array(ovalFlags.length);
	}
	const bx = Math.max(x, 0);
	const by = Math.max(y, 0);
	const ex = Math.min(x + width, mapWidth);
	const ey = Math.min(y + height, mapHeight);
	for (let y = by; y < ey; y++) {
		for (let x = bx; x < ex; x++) {
			const sumOfSquares =
				width < height
					? ((x - ox) * scale) ** 2 + (y - oy) ** 2
					: (x - ox) ** 2 + ((y - oy) * scale) ** 2;
			if (sumOfSquares < rr) {
				if (layer === 'terrain') {
					this.setTerrain(x, y);
				} else {
					this.setTile(sTiles, x - pox, y - poy, x, y);
					if (!shiftKey) {
						const i = x - bx + 1 + (y - by + 1) * ovalWidth!;
						ovalFlags[i] = 1;
					}
				}
			}
		}
	}

	if (layer !== 'terrain' && !shiftKey) {
		const bx = Math.max(x, 0) - 1;
		const by = Math.max(y, 0) - 1;
		const ex = Math.min(x + width, mapWidth) + 1;
		const ey = Math.min(y + height, mapHeight) + 1;
		const dx = ex - 1;
		const dy = ey - 1;
		for (let y = by; y < dy; y++) {
			for (let x = bx; x < dx; x++) {
				const i = x - bx + (y - by) * ovalWidth!;
				if (x < dx && ovalFlags[i] !== ovalFlags[i + 1]) {
					edgeFlags[i] = 1;
					edgeFlags[i + 1] = 1;
				}
				if (y < dy && ovalFlags[i] !== ovalFlags[i + ovalWidth!]) {
					edgeFlags[i] = 1;
					edgeFlags[i + ovalWidth!] = 1;
				}
				if (x < dx && y < dy && ovalFlags[i] !== ovalFlags[i + 1 + ovalWidth!]) {
					edgeFlags[i] = 1;
					edgeFlags[i + 1 + ovalWidth!] = 1;
				}
				if (x > 0 && y < dy && ovalFlags[i] !== ovalFlags[i - 1 + ovalWidth!]) {
					edgeFlags[i] = 1;
					edgeFlags[i - 1 + ovalWidth!] = 1;
				}
			}
		}

		for (let y = by; y < ey; y++) {
			for (let x = bx; x < ex; x++) {
				const i = x - bx + (y - by) * ovalWidth!;
				if (edgeFlags[i] === 1) {
					this.setTileFrame(x, y);
				}
			}
		}
	}
};

SceneEditEngine.editInFillMode = function (this: SceneEditThis, x: number, y: number) {
	let mapData: Uint32Array = new Uint32Array(0),
		mapWidth: number = 0,
		mapHeight: number = 0,
		bitShift: number = 0;
	let shiftKey, sTiles;
	const layer = this.layer;
	switch (layer) {
		case 'tilemap': {
			const { tilemap } = this;
			mapData = tilemap.tiles;
			mapWidth = tilemap.width;
			mapHeight = tilemap.height;
			bitShift = 6;
			shiftKey = this.shiftKey || Palette.explicit;
			sTiles = this.marquee.getTiles(shiftKey);
			break;
		}
		case 'terrain':
			mapData = this.terrains;
			mapWidth = this.width;
			mapHeight = this.height;
			bitShift = 0;
			break;
	}
	const pox = this.patternOriginX;
	const poy = this.patternOriginY;
	const flags = new Uint8Array(mapWidth * mapHeight);

	let minX = x;
	let minY = y;
	let maxX = x;
	let maxY = y;

	const { min, max } = Math;
	const buffer = GL.arrays[1].uint16.buffer;
	const sLength = min(mapWidth, mapHeight) * 4;
	let openset = new Uint16Array(buffer, 0, sLength);
	let closedset = new Uint16Array(buffer, sLength * 2, sLength);
	let openlength = 2;
	let closedlength = 0;
	openset[0] = x;
	openset[1] = y;
	flags[x + y * mapWidth] = 1;

	const di = x + y * mapWidth;
	const key = mapData[di] >> bitShift;

	const getFlag = (x: number, y: number) => {
		if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) {
			minX = min(x, minX);
			minY = min(y, minY);
			maxX = max(x, maxX);
			maxY = max(y, maxY);
			return -1;
		}

		const fi = x + y * mapWidth;
		if (flags[fi] === 0) {
			const di = x + y * mapWidth;
			if (mapData[di] >> bitShift !== key) {
				minX = min(x, minX);
				minY = min(y, minY);
				maxX = max(x, maxX);
				maxY = max(y, maxY);
				return (flags[fi] = 3);
			}
			closedset[closedlength] = x;
			closedset[closedlength + 1] = y;
			closedlength += 2;
			return (flags[fi] = 1);
		}
		return flags[fi];
	};

	while (openlength > 0) {
		for (let i = 0; i < openlength; i += 2) {
			const x = openset[i];
			const y = openset[i + 1];
			if (layer === 'terrain') {
				this.setTerrain(x, y);
			} else {
				this.setTile(sTiles, x - pox, y - poy, x, y);
			}
			if (getFlag(x - 1, y) === 3) {
				flags[x + y * mapWidth] = 2;
			}
			if (getFlag(x, y - 1) === 3) {
				flags[x + y * mapWidth] = 2;
			}
			if (getFlag(x + 1, y) === 3) {
				flags[x + y * mapWidth] = 2;
			}
			if (getFlag(x, y + 1) === 3) {
				flags[x + y * mapWidth] = 2;
			}
		}
		const temporary = openset;
		openset = closedset;
		closedset = temporary;
		openlength = closedlength;
		closedlength = 0;
	}

	if (layer !== 'terrain' && !shiftKey) {
		const bx = max(minX, 0);
		const by = max(minY, 0);
		const ex = min(maxX + 1, mapWidth);
		const ey = min(maxY + 1, mapHeight);
		for (let y = by; y < ey; y++) {
			for (let x = bx; x < ex; x++) {
				const fi = x + y * mapWidth;
				switch (flags[fi]) {
					case 2:
						this.setTileFrame(x, y);
						{
							const tx = x - 1;
							const fi = tx + y * mapWidth;
							if (
								flags[fi] === 1 &&
								(getFlag(x, y - 1) === 3 || getFlag(x, y + 1) === 3)
							) {
								flags[fi] = 2;
								this.setTileFrame(tx, y);
							}
						}
						{
							const tx = x + 1;
							const fi = tx + y * mapWidth;
							if (
								flags[fi] === 1 &&
								(getFlag(x, y - 1) === 3 || getFlag(x, y + 1) === 3)
							) {
								flags[fi] = 2;
								this.setTileFrame(tx, y);
							}
						}
						{
							const tx = x - 1;
							const ty = y - 1;
							const fi = tx + ty * mapWidth;
							if (flags[fi] === 0 && tx >= 0 && ty >= 0) {
								flags[fi] = 3;
								this.setTileFrame(tx, ty);
							}
						}
						{
							const tx = x + 1;
							const ty = y - 1;
							const fi = tx + ty * mapWidth;
							if (flags[fi] === 0 && tx < mapWidth && ty >= 0) {
								flags[fi] = 3;
								this.setTileFrame(tx, ty);
							}
						}
						{
							const tx = x + 1;
							const ty = y + 1;
							const fi = tx + ty * mapWidth;
							if (flags[fi] === 0 && tx < mapWidth && ty < mapHeight) {
								flags[fi] = 3;
								this.setTileFrame(tx, ty);
							}
						}
						{
							const tx = x - 1;
							const ty = y + 1;
							const fi = tx + ty * mapWidth;
							if (flags[fi] === 0 && tx >= 0 && ty < mapHeight) {
								flags[fi] = 3;
								this.setTileFrame(tx, ty);
							}
						}
						break;
					case 3:
						this.setTileFrame(x, y);
						break;
				}
			}
		}
	}
};

SceneEditEngine.setTile = function (
	this: SceneEditThis,
	sTiles: TileBuffer,
	sx: number,
	sy: number,
	dx: number,
	dy: number
) {
	const sw = sTiles.width;
	const sh = sTiles.height;
	const sro = sTiles.rowOffset;
	sx = ((sx % sw) + sw) % sw;
	sy = ((sy % sh) + sh) % sh;
	const tilemap = this.tilemap;
	const dTiles = tilemap.tiles;
	const dro = dTiles.rowOffset;
	const si = sx + sy * sro;
	const di = dx + dy * dro;
	const sTile = sTiles[si];
	const dTile = dTiles[di];
	if (sTile === 0) {
		if (dTile !== 0) {
			this.recordMapData(di);
			dTiles[di] = 0;
		}
		return;
	}
	const sMap = this.marquee.tilesetMap;
	const rMap = tilemap.reverseMap;
	const guid = sMap[sTile >> 24];
	let index = rMap[guid];
	if (index === undefined) {
		const dMap = tilemap.tilesetMap;
		index = this.getNewTilesetIndex(dMap);
		if (index === 0) return;
		dMap[index] = guid;
		rMap[guid] = index;
	}
	const nTile = (sTile & 0xffffff) | (index << 24);
	if (dTile !== nTile) {
		this.recordMapData(di);
		dTiles[di] = nTile;
	}
};

SceneEditEngine.setTileFrame = function (this: SceneEditThis, x: number, y: number) {
	const tilemap = this.tilemap;
	const width = tilemap.width;
	const height = tilemap.height;
	if (x < 0 || x >= width || y < 0 || y >= height) {
		return;
	}
	const tiles = tilemap.tiles;
	const ro = tiles.rowOffset;
	const ti = x + y * ro;
	const tile = tiles[ti];
	if (tile === 0) {
		return;
	}
	const tilesetMap = tilemap.tilesetMap;
	const tilesets = Data.tilesets;
	const templates = Data.autotiles.map;
	const guid = tilesetMap[tile >> 24];
	const tileset = tilesets[guid];
	if (tileset !== undefined && tileset.type === 'auto') {
		const tx = (tile >> 8) & 0xff;
		const ty = (tile >> 16) & 0xff;
		const id = tx + ty * tileset.width;
		const autoTile = tileset.tiles[id];
		if (!autoTile) {
			return;
		}
		const template = templates[autoTile.template];
		if (template === undefined) {
			return;
		}
		const key = tile >> 8;
		const r = width - 1;
		const b = height - 1;
		const neighbor =
			(+(x > 0 && key !== tiles[ti - 1] >> 8) + 1) |
			((+(x > 0 && y > 0 && key !== tiles[ti - 1 - ro] >> 8) + 1) << 2) |
			((+(y > 0 && key !== tiles[ti - ro] >> 8) + 1) << 4) |
			((+(x < r && y > 0 && key !== tiles[ti + 1 - ro] >> 8) + 1) << 6) |
			((+(x < r && key !== tiles[ti + 1] >> 8) + 1) << 8) |
			((+(x < r && y < b && key !== tiles[ti + 1 + ro] >> 8) + 1) << 10) |
			((+(y < b && key !== tiles[ti + ro] >> 8) + 1) << 12) |
			((+(x > 0 && y < b && key !== tiles[ti - 1 + ro] >> 8) + 1) << 14);
		const nodes = template.nodes;
		const length = nodes.length;
		let nodeIndex = 0;
		for (let i = 0; i < length; i++) {
			const code = nodes[i].rule | neighbor;
			if (
				Math.max(
					code & 0b11,
					(code >> 2) & 0b11,
					(code >> 4) & 0b11,
					(code >> 6) & 0b11,
					(code >> 8) & 0b11,
					(code >> 10) & 0b11,
					(code >> 12) & 0b11,
					(code >> 14) & 0b11
				) !== 0b11
			) {
				nodeIndex = i;
				break;
			}
		}
		const nTile = (key << 8) | nodeIndex;
		if (tiles[ti] !== nTile) {
			this.recordMapData(ti);
			tiles[ti] = nTile;
		}
	}
};

SceneEditEngine.setTerrain = function (this: SceneEditThis, x: number, y: number) {
	const terrain = this.marquee.terrain;
	const terrains = this.terrains;
	const ro = terrains.rowOffset;
	const pi = x + y * ro;
	this.recordMapData(pi);
	terrains[pi] = terrain;
};

SceneEditEngine.createTiles = function (this: SceneEditThis, width: number, height: number) {
	const tiles: TileBuffer = new Uint32Array(width * height) as TileBuffer;
	tiles.width = width;
	tiles.height = height;
	tiles.rowOffset = width;
	return tiles;
};

SceneEditEngine.cloneTiles = function (this: SceneEditThis, sTiles: TileBuffer) {
	const dTiles: TileBuffer = new Uint32Array(sTiles) as TileBuffer;
	dTiles.width = sTiles.width;
	dTiles.height = sTiles.height;
	dTiles.rowOffset = sTiles.rowOffset;
	return dTiles;
};

SceneEditEngine.createTerrains = function (this: SceneEditThis, width: number, height: number) {
	const terrains: TerrainBuffer = new Uint8Array(width * height) as TerrainBuffer;
	terrains.rowOffset = width;
	return terrains;
};

SceneEditEngine.getNewTilesetIndex = function (
	this: SceneEditThis,
	tilesetMap: Record<string, string>
) {
	for (let i = 1; i < 256; i++) {
		if (tilesetMap[i] === undefined) {
			return i;
		}
	}
	return 0;
};
