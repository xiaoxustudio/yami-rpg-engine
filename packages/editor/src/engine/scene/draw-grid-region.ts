import { Data } from '@app/data/data-object.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';

export const drawGridLayer = function (this: typeof Scene) {
	if (this.showGrid && this.width * this.height) {
		const gl = GL;
		const vertices = gl.arrays[0].float32;
		const context = this.getGridContext!();
		const width = context.width;
		const height = context.height;
		const sx = context.offsetX;
		const sy = context.offsetY;
		const tw = this.tileWidth;
		const th = this.tileHeight;
		const scroll = this.rasterizeScrollPosition!(-sx, -sy);
		const sl = scroll.left;
		const st = scroll.top;
		const sr = scroll.right;
		const sb = scroll.bottom;
		const ox = 0.5 / this.scaleX / tw;
		const oy = 0.5 / this.scaleY / th;
		const bx = Math.max(Math.ceil(sl / tw), 0);
		const by = Math.max(Math.ceil(st / th), 0);
		const ex = Math.min(Math.ceil(sr / tw), width + 1);
		const ey = Math.min(Math.ceil(sb / th), height + 1);
		const left = Math.max(Math.floor(sl / tw), 0);
		const top = Math.max(Math.floor(st / th), 0);
		const right = Math.min(ex, width + 1 / this.scaleX / tw);
		const bottom = Math.min(ey, height + 1 / this.scaleY / th);
		let vi = 0;
		for (let y = by; y < ey; y++) {
			vertices[vi] = left;
			vertices[vi + 1] = y + oy;
			vertices[vi + 2] = right;
			vertices[vi + 3] = y + oy;
			vi += 4;
		}
		for (let x = bx; x < ex; x++) {
			vertices[vi] = x + ox;
			vertices[vi + 1] = top;
			vertices[vi + 2] = x + ox;
			vertices[vi + 3] = bottom;
			vi += 4;
		}
		if (vi !== 0) {
			const program = gl.graphicProgram.use();
			gl.matrix
				.project(gl.flip, sr - sl, sb - st)
				.translate(-sl, -st)
				.scale(tw, th);
			gl.bindVertexArray(program.vao.a10);
			gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix);
			gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi);
			gl.vertexAttrib4f(program.a_Color, 1, 1, 1, 0.5);
			gl.drawArrays(gl.LINES, 0, vi / 2);
		}
	}
};

export const drawRegionLayer = function (this: typeof Scene) {
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const colors = gl.arrays[0].uint32;
	const tw = this.tileWidth;
	const th = this.tileHeight;
	const sl = this.scrollLeft;
	const st = this.scrollTop;
	const sr = this.scrollRight;
	const sb = this.scrollBottom;
	const regions = this.regions;
	const length = regions.length;
	const list = regions.visibleList;
	let li = 0;
	let vi = 0;
	for (let i = 0; i < length; i++) {
		const region = regions[i];
		if (region.hidden) continue;
		const rx = region.x;
		const ry = region.y;
		const rw = region.width;
		const rh = region.height;
		const rl = rx - rw / 2;
		const rt = ry - rh / 2;
		const rr = rl + rw;
		const rb = rt + rh;
		const ml = rl * tw;
		const mt = rt * th;
		const mr = rr * tw;
		const mb = rb * th;
		if (ml < sr && mt < sb && mr > sl && mb > st) {
			const hex = region.color;
			const r = parseInt(hex.slice(0, 2), 16);
			const g = parseInt(hex.slice(2, 4), 16);
			const b = parseInt(hex.slice(4, 6), 16);
			const a = parseInt(hex.slice(6, 8), 16) * (region.enabled ? 1 : 0.5);
			const rgba = r | (g << 8) | (b << 16) | (a << 24);
			list[li++] = region;
			vertices[vi] = rl;
			vertices[vi + 1] = rt;
			colors[vi + 2] = rgba;
			vertices[vi + 3] = rl;
			vertices[vi + 4] = rb;
			colors[vi + 5] = rgba;
			vertices[vi + 6] = rr;
			vertices[vi + 7] = rb;
			colors[vi + 8] = rgba;
			vertices[vi + 9] = rr;
			vertices[vi + 10] = rt;
			colors[vi + 11] = rgba;
			vi += 12;
		}
	}

	const count = list.count;
	for (let i = li; i < count; i++) {
		list[i] = undefined;
	}
	list.count = li;

	if (vi !== 0) {
		const program = gl.graphicProgram.use();
		gl.matrix
			.project(gl.flip, sr - sl, sb - st)
			.translate(-sl, -st)
			.scale(tw, th);
		gl.bindVertexArray(program.vao);
		gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi);
		gl.drawElements(gl.TRIANGLES, vi / 2, gl.UNSIGNED_INT, 0);
	}
};

export const drawRegionBorders = function (this: typeof Scene) {
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const tw = this.tileWidth;
	const th = this.tileHeight;
	const sl = this.scrollLeft;
	const st = this.scrollTop;
	const sr = this.scrollRight;
	const sb = this.scrollBottom;
	const ox = 0.5 / this.scaleX / tw;
	const oy = 0.5 / this.scaleY / th;
	const regions = this.regions.visibleList;
	const count = regions.count;
	let vi = 0;
	for (let i = 0; i < count; i++) {
		const region = regions[i];
		const rx = region.x;
		const ry = region.y;
		const rw = region.width;
		const rh = region.height;
		const dl = rx - rw / 2 + ox;
		const dt = ry - rh / 2 + oy;
		const dr = dl + rw;
		const db = dt + rh;
		vertices[vi] = dl;
		vertices[vi + 1] = dt;
		vertices[vi + 2] = dl;
		vertices[vi + 3] = db;
		vertices[vi + 4] = dl;
		vertices[vi + 5] = db;
		vertices[vi + 6] = dr;
		vertices[vi + 7] = db;
		vertices[vi + 8] = dr;
		vertices[vi + 9] = db;
		vertices[vi + 10] = dr;
		vertices[vi + 11] = dt;
		vertices[vi + 12] = dr;
		vertices[vi + 13] = dt;
		vertices[vi + 14] = dl;
		vertices[vi + 15] = dt;
		vi += 16;
	}
	const { startPosition } = Data.config;
	if (startPosition.sceneId === this.meta.guid) {
		const dl = startPosition.x - 0.5 + ox;
		const dt = startPosition.y - 0.5 + oy;
		const dr = dl + 1;
		const db = dt + 1;
		vertices[vi] = dl;
		vertices[vi + 1] = dt;
		vertices[vi + 2] = dl;
		vertices[vi + 3] = db;
		vertices[vi + 4] = dl;
		vertices[vi + 5] = db;
		vertices[vi + 6] = dr;
		vertices[vi + 7] = db;
		vertices[vi + 8] = dr;
		vertices[vi + 9] = db;
		vertices[vi + 10] = dr;
		vertices[vi + 11] = dt;
		vertices[vi + 12] = dr;
		vertices[vi + 13] = dt;
		vertices[vi + 14] = dl;
		vertices[vi + 15] = dt;
		vi += 16;
	}
	if (vi !== 0) {
		const program = gl.graphicProgram.use();
		gl.matrix
			.project(gl.flip, sr - sl, sb - st)
			.translate(-sl, -st)
			.scale(tw, th);
		gl.bindVertexArray(program.vao.a10);
		gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi);
		gl.vertexAttrib4f(program.a_Color, 1, 1, 1, 1);
		gl.drawArrays(gl.LINES, 0, vi / 2);
	}
};
