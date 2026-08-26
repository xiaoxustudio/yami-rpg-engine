import { Data } from '@app/data/data-object.ts';
import { Palette } from '@app/palette/palette.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { ImageTexture } from '@app/engine/webgl/image-texture.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';

export const drawTilemap = function (
	this: typeof Scene,
	tilemap: {
		width: number;
		height: number;
		anchorX: number;
		anchorY: number;
		offsetX: number;
		offsetY: number;
		opacity: number;
		enabled: boolean;
		light: string;
		blend: string;
		tilesetMap: { [k: number]: string };
		tiles: { width: number; height: number; rowOffset: number; [k: number]: number };
		[k: string]: unknown;
	},
	id: number
) {
	let layer, opacity;
	const activeId = this.activeTilemapId;
	if (activeId === -1 || id === activeId) {
		layer = 'upper';
		opacity = 1;
	} else if (id < activeId) {
		layer = 'lower';
		opacity = 1;
	} else if (id > activeId) {
		layer = 'upper';
		opacity = 0.25;
	}
	const anchor = this.getParallaxAnchor!(tilemap);
	const tw = this.tileWidth;
	const th = this.tileHeight;
	const pw = tilemap.width * tw;
	const ph = tilemap.height * th;
	const ax = tilemap.anchorX * pw;
	const ay = tilemap.anchorY * ph;
	const ox = anchor.x - ax + tilemap.offsetX;
	const oy = anchor.y - ay + tilemap.offsetY;
	return this.drawTileLayer!(
		layer,
		tilemap.light,
		tilemap.blend,
		tilemap.opacity * opacity! * (tilemap.enabled ? 1 : 0.3),
		tilemap.tilesetMap,
		tilemap.tiles,
		ox,
		oy
	);
};

export const drawTilePreview = function (this: typeof Scene) {
	const marquee = this.marquee;
	if (marquee.visible && marquee.previewTiles) {
		const mm = marquee.tilesetMap;
		const mt = marquee.tiles;
		const coords = this.getConvertedCoords!(marquee);
		let ox = coords.x;
		let oy = coords.y;
		if (this.layer === 'tilemap') {
			const context = this.getGridContext!();
			ox += context.offsetX;
			oy += context.offsetY;
		}
		this.drawTileLayer!('upper', 'global', 'normal', 0.6, mm, mt, ox, oy);
		GL.alpha = 1;
	}
};

export const drawTileLayer = function (
	this: typeof Scene,
	layer: 'upper' | 'lower',
	light: string,
	blend: string,
	opacity: number,
	tilesetMap: { [k: number]: string },
	tiles: { width: number; height: number; rowOffset: number; [k: number]: number },
	ox: number,
	oy: number
) {
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const push = gl.batchRenderer.push;
	const response = gl.batchRenderer.response;
	const textures = this.textures;
	const width = tiles.width;
	const height = tiles.height;
	const tro = tiles.rowOffset;
	const tw = this.tileWidth;
	const th = this.tileHeight;
	const tilesets = Data.tilesets;
	const templates = Data.autotiles.map;
	const scroll = this.rasterizeScrollPosition!(-ox, -oy);
	const sl = scroll.left;
	const st = scroll.top;
	const sr = scroll.right;
	const sb = scroll.bottom;
	const area = Data.config.tileArea;
	const tl = sl - area.expansionLeft;
	const tt = st - area.expansionTop;
	const tr = sr + area.expansionRight;
	const tb = sb + area.expansionBottom;
	const bx = Math.max(Math.floor(tl / tw), 0);
	const by = Math.max(Math.floor(tt / th), 0);
	const ex = Math.min(Math.ceil(tr / tw), width);
	const ey = Math.min(Math.ceil(tb / th), height);
	gl.batchRenderer.setAttrSize(0);
	gl.batchRenderer.setBlendMode(blend);
	for (let y = by; y < ey; y++) {
		for (let x = bx; x < ex; x++) {
			const i = x + y * tro;
			const tile = tiles[i];
			if (tile !== 0) {
				const guid = tilesetMap[tile >> 24];
				const tileset = tilesets[guid];
				if (tileset !== undefined) {
					switch (tileset.type) {
						case 'normal': {
							const texture = textures[tileset.image];
							if (texture instanceof ImageTexture) {
								push(texture.base!.index);
								const sw = tileset.tileWidth;
								const sh = tileset.tileHeight;
								const sx = ((tile >> 8) & 0xff) * sw;
								const sy = ((tile >> 16) & 0xff) * sh;
								const dl = x * tw + (tw - sw) / 2 + tileset.globalOffsetX;
								const dt = y * th + (th - sh) + tileset.globalOffsetY;
								const dr = dl + sw;
								const db = dt + sh;
								let sl = (sx + 0.002) / texture.width;
								let sr = (sx + sw - 0.002) / texture.width;
								if (tile & 0b1) {
									const temporary = sl;
									sl = sr;
									sr = temporary;
								}
								const st = (sy + 0.002) / texture.height;
								const sb = (sy + sh - 0.002) / texture.height;
								const vi = response[0] * 5;
								const si = response[1];
								vertices[vi] = dl;
								vertices[vi + 1] = dt;
								vertices[vi + 2] = sl;
								vertices[vi + 3] = st;
								vertices[vi + 4] = si;
								vertices[vi + 5] = dl;
								vertices[vi + 6] = db;
								vertices[vi + 7] = sl;
								vertices[vi + 8] = sb;
								vertices[vi + 9] = si;
								vertices[vi + 10] = dr;
								vertices[vi + 11] = db;
								vertices[vi + 12] = sr;
								vertices[vi + 13] = sb;
								vertices[vi + 14] = si;
								vertices[vi + 15] = dr;
								vertices[vi + 16] = dt;
								vertices[vi + 17] = sr;
								vertices[vi + 18] = st;
								vertices[vi + 19] = si;
							} else if (texture === undefined) {
								const guid = tileset.image;
								const image = Palette.images[guid];
								if (image instanceof Image) {
									textures.append(new ImageTexture(image));
									x--;
								} else {
									textures.load(guid);
								}
							}
							break;
						}
						case 'auto': {
							const tx = (tile >> 8) & 0xff;
							const ty = (tile >> 16) & 0xff;
							const id = tx + ty * tileset.width;
							const autoTile = tileset.tiles[id];
							if (!autoTile) {
								continue;
							}
							const template = templates[autoTile.template];
							if (template === undefined) {
								continue;
							}
							const nodeId = tile & 0b111111;
							const node = template.nodes[nodeId];
							if (node === undefined) {
								continue;
							}
							const texture = textures[autoTile.image];
							if (texture instanceof ImageTexture) {
								push(texture.base!.index);
								const index = this.animationFrame % node.frames.length;
								const frame = node.frames[index];
								const sw = tileset.tileWidth;
								const sh = tileset.tileHeight;
								const sx = (autoTile.x + (frame & 0xff)) * sw;
								const sy = (autoTile.y + (frame >> 8)) * sh;
								const dl = x * tw + (tw - sw) / 2 + tileset.globalOffsetX;
								const dt = y * th + (th - sh) + tileset.globalOffsetY;
								const dr = dl + sw;
								const db = dt + sh;
								const sl = (sx + 0.002) / texture.width;
								const st = (sy + 0.002) / texture.height;
								const sr = (sx + sw - 0.002) / texture.width;
								const sb = (sy + sh - 0.002) / texture.height;
								const vi = response[0] * 5;
								const si = response[1];
								vertices[vi] = dl;
								vertices[vi + 1] = dt;
								vertices[vi + 2] = sl;
								vertices[vi + 3] = st;
								vertices[vi + 4] = si;
								vertices[vi + 5] = dl;
								vertices[vi + 6] = db;
								vertices[vi + 7] = sl;
								vertices[vi + 8] = sb;
								vertices[vi + 9] = si;
								vertices[vi + 10] = dr;
								vertices[vi + 11] = db;
								vertices[vi + 12] = sr;
								vertices[vi + 13] = sb;
								vertices[vi + 14] = si;
								vertices[vi + 15] = dr;
								vertices[vi + 16] = dt;
								vertices[vi + 17] = sr;
								vertices[vi + 18] = st;
								vertices[vi + 19] = si;
							} else if (texture === undefined) {
								const guid = autoTile.image;
								const image = Palette.images[guid];
								if (image instanceof Image) {
									textures.append(new ImageTexture(image));
									x--;
								} else {
									textures.load(guid);
								}
							}
							break;
						}
					}
				}
			}
		}
	}
	const endIndex = gl.batchRenderer.getEndIndex();
	if (endIndex !== 0) {
		gl.alpha = opacity;
		const program = gl.tileProgram.use();
		const modeMap = this.tilemapLightSamplingModes;
		const lightMode = this.showLight ? light : 'raw';
		const lightModeIndex = modeMap[lightMode];
		const matrix = gl.matrix.project(gl.flip, sr - sl, sb - st).translate(-sl, -st);
		switch (layer) {
			case 'upper':
				gl.uniform1i(program.u_TintMode, 0);
				break;
			case 'lower':
				gl.uniform1i(program.u_TintMode, 1);
				gl.uniform4f(program.u_Tint, -0.2, -0.2, -0.2, 0.8);
				break;
		}
		gl.bindVertexArray(program.vao);
		gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
		gl.uniform1i(program.u_LightMode, lightModeIndex);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, endIndex * 5);
		gl.batchRenderer.draw();
	}
};
