import { Data } from '@app/data/data-object.ts';
import { Animation } from '@app/animation/animation-window.ts';
import { Palette } from '@app/palette/palette.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { ImageTexture } from '@app/engine/webgl/image-texture.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';

export const drawObjectLayer = function (this: typeof Scene) {
	const { max, min, floor, ceil, round } = Math;
	const activeId = this.activeTilemapId;
	const translucent = activeId !== -1 && activeId < 0x20000;
	const animAlpha = translucent ? 0.25 : 1;

	const gl = GL;
	const lightModeMap = this.showLight
		? Animation.Player.lightSamplingModes
		: this.defaultLightSamplingModes;
	const blendModeMap = this.blendModeMap;
	const textures = this.textures;
	const tilesets = Data.tilesets;
	const templates = Data.autotiles.map;
	const area = Data.config.tileArea;
	const lightmap = GL.reflectedLightMap;
	const tw = this.tileWidth;
	const th = this.tileHeight;
	const sl = this.scrollLeft;
	const st = this.scrollTop;
	const sr = this.scrollRight;
	const sb = this.scrollBottom;
	const ll = sl - lightmap.maxExpansionLeft;
	const lt = st - lightmap.maxExpansionTop;
	const lr = sr + lightmap.maxExpansionRight;
	const lb = sb + lightmap.maxExpansionBottom;
	const lw = lr - ll;
	const lh = lb - lt;
	const ly = th / 2 / lh;
	const layers = gl.layers;
	const starts = gl.zeros;
	const ends = gl.arrays[1].uint32;
	const set = gl.arrays[2].uint32;
	const data = gl.arrays[3].float32;
	const datau = gl.arrays[3].uint32;
	let li = 0;
	let si = 2;
	let di = 0;
	const doodads = this.doodads;
	const length = doodads.length;
	for (let i = 0; i < length; i++) {
		const tilemap = doodads[i];
		const id = i | 0x10000;
		const active = id === activeId;
		if (tilemap.hidden && !active) {
			continue;
		}
		const tilesetMap = tilemap.tilesetMap;
		const tiles = tilemap.tiles;
		const width = tiles.width;
		const height = tiles.height;
		const tro = tiles.rowOffset;
		const anchor = this.getParallaxAnchor!(tilemap);
		const ax = tilemap.anchorX * width * tw;
		const ay = tilemap.anchorY * height * th;
		const sox = anchor.x - ax + tilemap.offsetX;
		const soy = anchor.y - ay + tilemap.offsetY;
		const scroll = this.rasterizeScrollPosition!(-sox, -soy);
		const left = scroll.left - area.expansionLeft;
		const top = scroll.top - area.expansionTop;
		const right = scroll.right + area.expansionRight;
		const bottom = scroll.bottom + area.expansionBottom;
		const ox = sl - scroll.left;
		const oy = st - scroll.top;
		const bx = max(floor(left / tw), 0);
		const by = max(floor(top / th), 0);
		const ex = min(ceil(right / tw), width);
		const ey = min(ceil(bottom / th), height);
		let opacity = tilemap.opacity;
		if (translucent && !active) opacity /= 4;
		opacity = Math.round(opacity * 255) << 8;
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
									const tx = (tile >> 8) & 0xff;
									const ty = (tile >> 16) & 0xff;
									const id = tx + ty * tileset.width;
									const tp = tileset.priorities[id] + tileset.globalPriority;
									const sw = tileset.tileWidth;
									const sh = tileset.tileHeight;
									const sx = tx * sw;
									const sy = ty * sh;
									const ax = (x + 0.5) * tw + ox;
									const ay = (y + 1) * th + oy;
									const dl = ax - sw / 2 + tileset.globalOffsetX;
									const dt = ay - sh + tileset.globalOffsetY;
									const dr = dl + sw;
									const db = dt + sh;
									const px = (ax - ll) / lw;
									const py = (ay - lt + tp * th) / lh;
									const key = max(0, min(0x3ffff, round(py * 0x20000 + 0x10000)));
									const anchor =
										round(max(min(px, 1), 0) * 0xffff) |
										(round(max(min(py - ly, 1), 0) * 0xffff) << 16);
									data[di] = texture.base!.index;
									data[di + 1] = dl;
									data[di + 2] = dt;
									data[di + 3] = dr;
									data[di + 4] = db;
									data[di + 5] = (sx + 0.002) / texture.width;
									data[di + 6] = (sy + 0.002) / texture.height;
									data[di + 7] = (sx + sw - 0.002) / texture.width;
									data[di + 8] = (sy + sh - 0.002) / texture.height;
									datau[di + 9] = anchor;
									datau[di + 10] = opacity;
									datau[di + 11] = lightModeMap[tilemap.light];
									datau[di + 12] = blendModeMap[tilemap.blend];
									if (tile & 0b1) {
										data[di + 9] = data[di + 5];
										data[di + 5] = data[di + 7];
										data[di + 7] = data[di + 9];
									}
									if (starts[key] === 0) {
										starts[key] = si;
										layers[li++] = key;
									} else {
										set[ends[key] + 1] = si;
									}
									ends[key] = si;
									set[si++] = di;
									set[si++] = 0;
									di += 13;
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
									const index = this.animationFrame % node.frames.length;
									const frame = node.frames[index];
									const tp = tileset.priorities[id] + tileset.globalPriority;
									const sw = tileset.tileWidth;
									const sh = tileset.tileHeight;
									const sx = (autoTile.x + (frame & 0xff)) * sw;
									const sy = (autoTile.y + (frame >> 8)) * sh;
									const ax = (x + 0.5) * tw + ox;
									const ay = (y + 1) * th + oy;
									const dl = ax - sw / 2 + tileset.globalOffsetX;
									const dt = ay - sh + tileset.globalOffsetY;
									const dr = dl + sw;
									const db = dt + sh;
									const px = (ax - ll) / lw;
									const py = (ay - lt + tp * th) / lh;
									const key = max(0, min(0x3ffff, round(py * 0x20000 + 0x10000)));
									const anchor =
										round(max(min(px, 1), 0) * 0xffff) |
										(round(max(min(py - ly, 1), 0) * 0xffff) << 16);
									data[di] = texture.base!.index;
									data[di + 1] = dl;
									data[di + 2] = dt;
									data[di + 3] = dr;
									data[di + 4] = db;
									data[di + 5] = (sx + 0.002) / texture.width;
									data[di + 6] = (sy + 0.002) / texture.height;
									data[di + 7] = (sx + sw - 0.002) / texture.width;
									data[di + 8] = (sy + sh - 0.002) / texture.height;
									datau[di + 9] = anchor;
									datau[di + 10] = opacity;
									datau[di + 11] = lightModeMap[tilemap.light];
									datau[di + 12] = blendModeMap[tilemap.blend];
									if (starts[key] === 0) {
										starts[key] = si;
										layers[li++] = key;
									} else {
										set[ends[key] + 1] = si;
									}
									ends[key] = si;
									set[si++] = di;
									set[si++] = 0;
									di += 13;
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
	}

	const actors = this.actors;
	const animations = this.animations;
	const particles = this.particles;
	for (let i = 0; i < 3; i++) {
		const kind = (i + 1) << 16;
		if (i <= 1) {
			const list = i === 0 ? actors : animations;
			const length = list.length;
			for (let i = 0; i < length; i++) {
				const object = list[i];
				if (object.hidden) continue;
				const player = object.player;
				if (player.visible) {
					const py = player.anchorY;
					const key = max(0, min(0x3ffff, round(py * 0x20000 + 0x10000)));
					data[di] = i | kind;
					if (starts[key] === 0) {
						starts[key] = si;
						layers[li++] = key;
					} else {
						set[ends[key] + 1] = si;
					}
					ends[key] = si;
					set[si++] = di;
					set[si++] = 0;
					di += 1;
				}
			}
		} else {
			const length = particles.length;
			for (let i = 0; i < length; i++) {
				const object = particles[i];
				if (object.hidden) continue;
				const emitter = object.emitter;
				if (emitter?.visible) {
					const py = emitter.anchorY;
					const key = max(0, min(0x3ffff, round(py * 0x20000 + 0x10000)));
					data[di] = i | kind;
					if (starts[key] === 0) {
						starts[key] = si;
						layers[li++] = key;
					} else {
						set[ends[key] + 1] = si;
					}
					ends[key] = si;
					set[si++] = di;
					set[si++] = 0;
					di += 1;
				}
			}
		}
	}

	if (li !== 0) {
		const vertices = gl.arrays[0].float32;
		const attributes = gl.arrays[0].uint32;
		const blend = gl.batchRenderer.setBlendMode;
		const push = gl.batchRenderer.push;
		const response = gl.batchRenderer.response;
		const program = gl.spriteProgram.use();
		const matrix = gl.matrix.project(gl.flip, sr - sl, sb - st).translate(-sl, -st);
		if (activeId < 0x20000) {
			gl.uniform4f(program.u_Tint, 0, 0, 0, 0);
		} else {
			gl.uniform4f(program.u_Tint, -0.2, -0.2, -0.2, 0.8);
		}
		gl.batchRenderer.bindProgram();
		gl.batchRenderer.setAttrSize(8);
		gl.bindVertexArray(program.vao);
		gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
		const queue = new Uint32Array(layers.buffer, 0, li).sort();
		for (let i = 0; i < li; i++) {
			const key = queue[i];
			let si = starts[key];
			starts[key] = 0;
			do {
				const di = set[si];
				const code = data[di];
				if (code < 0x10000) {
					blend(blendModeMap[datau[di + 12]]);
					push(code);
					const dl = data[di + 1];
					const dt = data[di + 2];
					const dr = data[di + 3];
					const db = data[di + 4];
					const sl = data[di + 5];
					const st = data[di + 6];
					const sr = data[di + 7];
					const sb = data[di + 8];
					const anchor = datau[di + 9];
					const opacity = datau[di + 10];
					const mode = datau[di + 11] << 16;
					const vi = response[0] * 8;
					const param = response[1] | opacity | mode;
					vertices[vi] = dl;
					vertices[vi + 1] = dt;
					vertices[vi + 2] = sl;
					vertices[vi + 3] = st;
					attributes[vi + 4] = param;
					attributes[vi + 5] = 0x00ff00ff;
					attributes[vi + 6] = 0x00ff00ff;
					attributes[vi + 7] = anchor;
					vertices[vi + 8] = dl;
					vertices[vi + 9] = db;
					vertices[vi + 10] = sl;
					vertices[vi + 11] = sb;
					attributes[vi + 12] = param;
					attributes[vi + 13] = 0x00ff00ff;
					attributes[vi + 14] = 0x00ff00ff;
					attributes[vi + 15] = anchor;
					vertices[vi + 16] = dr;
					vertices[vi + 17] = db;
					vertices[vi + 18] = sr;
					vertices[vi + 19] = sb;
					attributes[vi + 20] = param;
					attributes[vi + 21] = 0x00ff00ff;
					attributes[vi + 22] = 0x00ff00ff;
					attributes[vi + 23] = anchor;
					vertices[vi + 24] = dr;
					vertices[vi + 25] = dt;
					vertices[vi + 26] = sr;
					vertices[vi + 27] = st;
					attributes[vi + 28] = param;
					attributes[vi + 29] = 0x00ff00ff;
					attributes[vi + 30] = 0x00ff00ff;
					attributes[vi + 31] = anchor;
				} else if (code < 0x20000) {
					const actor = actors[code & 0x0ffff];
					actor.player.draw(animAlpha * (actor.enabled ? 1 : 0.3));
				} else if (code < 0x30000) {
					const animation = animations[code & 0x0ffff];
					animation.player.draw(animAlpha * (animation.enabled ? 1 : 0.3));
				} else {
					gl.batchRenderer.draw();
					const particle = particles[code & 0x0ffff];
					particle.emitter.draw(animAlpha * (particle.enabled ? 1 : 0.3));
				}
			} while ((si = set[si + 1]) !== 0);
		}
		gl.batchRenderer.draw();
		gl.batchRenderer.unbindProgram();
		gl.blend = 'normal';
	}
};

export const drawNameLayer = function (this: typeof Scene) {
	if (this.target?.name) {
		const gl = GL;
		const sl = this.scrollLeft * this.scaleX;
		const st = this.scrollTop * this.scaleY;
		const stw = this.scaledTileWidth;
		const sth = this.scaledTileHeight;
		const size = GL.context2d.size;
		const color = [0xffffffff];
		const shadow = 0x80000000;
		const target = this.target;
		const x = target.x * stw - sl;
		const y = target.y * sth - st - size - 8;
		gl.fillTextWithOutline(target.name, x, y, color, shadow);
	}
};

export const drawDirectLightLayer = function (this: typeof Scene) {
	if (this.showLight) {
		GL.matrix.reset();
		GL.blend = 'additive';
		GL.drawImage!(GL.directLightMap, 0, 0, GL.width, GL.height);
		GL.blend = 'normal';
	}
};
