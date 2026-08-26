import { Scene } from '@app/scene/scene-window.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';

export const drawTileMarquee = function (this: typeof Scene) {
	const marquee = this.marquee;
	if (marquee.visible) {
		const gl = GL;
		const vertices = gl.arrays[0].float32;
		const grid = this.getGridContext!();
		const sx = grid.offsetX;
		const sy = grid.offsetY;
		const tw = this.tileWidth;
		const th = this.tileHeight;
		const scroll = this.rasterizeScrollPosition!(-sx, -sy);
		const sl = scroll.left;
		const st = scroll.top;
		const sr = scroll.right;
		const sb = scroll.bottom;

		const dl = marquee.x;
		const dt = marquee.y;
		const dr = dl + marquee.width;
		const db = dt + marquee.height;
		const ox = 0.5 / this.scaleX / tw;
		const oy = 0.5 / this.scaleY / th;
		vertices[0] = dl + ox;
		vertices[1] = dt + oy;
		vertices[2] = dl + ox;
		vertices[3] = db + oy;
		vertices[4] = dr + ox;
		vertices[5] = db + oy;
		vertices[6] = dr + ox;
		vertices[7] = dt + oy;
		let vi = 8;
		let valid: number | { start: number; count: number } | null = null;
		let invalid: number | { start: number; count: number } | null = null;
		const context = Scene.tilemap ?? Scene;
		const sw = context.width;
		const sh = context.height;
		const mw = marquee.width;
		const mh = marquee.height;
		const bx = marquee.x;
		const by = marquee.y;
		const ex = bx + mw;
		const ey = by + mh;
		const max = Math.max;
		const min = Math.min;
		if (ex > 0 && bx < sw && ey > 0 && by < sh) {
			const dl = max(bx, 0);
			const dt = max(by, 0);
			const dr = min(ex, sw);
			const db = min(ey, sh);
			vertices[vi] = dl;
			vertices[vi + 1] = dt;
			vertices[vi + 2] = dl;
			vertices[vi + 3] = db;
			vertices[vi + 4] = dr;
			vertices[vi + 5] = db;
			vertices[vi + 6] = dr;
			vertices[vi + 7] = dt;
			valid = vi;
			vi += 8;
			if (bx < 0) {
				vertices[vi] = 0;
				vertices[vi + 1] = max(by, 0);
				vertices[vi + 2] = bx;
				vertices[vi + 3] = by;
				vertices[vi + 4] = bx;
				vertices[vi + 5] = ey;
				vertices[vi + 6] = 0;
				vertices[vi + 7] = min(ey, sh);
				invalid = invalid || vi;
				vi += 8;
			}
			if (by < 0) {
				vertices[vi] = max(bx, 0);
				vertices[vi + 1] = 0;
				vertices[vi + 2] = bx;
				vertices[vi + 3] = by;
				vertices[vi + 4] = ex;
				vertices[vi + 5] = by;
				vertices[vi + 6] = min(ex, sw);
				vertices[vi + 7] = 0;
				invalid = invalid || vi;
				vi += 8;
			}
			if (ex > sw) {
				vertices[vi] = sw;
				vertices[vi + 1] = max(by, 0);
				vertices[vi + 2] = ex;
				vertices[vi + 3] = by;
				vertices[vi + 4] = ex;
				vertices[vi + 5] = ey;
				vertices[vi + 6] = sw;
				vertices[vi + 7] = min(ey, sh);
				invalid = invalid || vi;
				vi += 8;
			}
			if (ey > sh) {
				vertices[vi] = max(bx, 0);
				vertices[vi + 1] = sh;
				vertices[vi + 2] = bx;
				vertices[vi + 3] = ey;
				vertices[vi + 4] = ex;
				vertices[vi + 5] = ey;
				vertices[vi + 6] = min(ex, sw);
				vertices[vi + 7] = sh;
				invalid = invalid || vi;
				vi += 8;
			}
		} else {
			vertices[vi] = bx;
			vertices[vi + 1] = by;
			vertices[vi + 2] = bx;
			vertices[vi + 3] = ey;
			vertices[vi + 4] = ex;
			vertices[vi + 5] = ey;
			vertices[vi + 6] = ex;
			vertices[vi + 7] = by;
			invalid = vi;
			vi += 8;
		}
		if (valid !== null) {
			valid = {
				start: (valid as number) * 0.75,
				count: 6
			};
		}
		if (invalid !== null) {
			invalid = {
				start: (invalid as number) * 0.75,
				count: (vi - (invalid as number)) * 0.75
			};
		}
		const program = gl.graphicProgram.use();
		gl.matrix
			.project(gl.flip, sr - sl, sb - st)
			.translate(-sl, -st)
			.scale(tw, th);
		gl.bindVertexArray(program.vao.a10);
		gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi);
		if (valid !== null) {
			gl.vertexAttrib4fv(program.a_Color, marquee.backgroundColor);
			gl.drawElements(
				gl.TRIANGLES,
				(valid as { start: number; count: number }).count,
				gl.UNSIGNED_INT,
				(valid as { start: number; count: number }).start * 4
			);
		}
		if (invalid !== null) {
			gl.vertexAttrib4fv(program.a_Color, marquee.backgroundColorInvalid);
			gl.drawElements(
				gl.TRIANGLES,
				(invalid as { start: number; count: number }).count,
				gl.UNSIGNED_INT,
				(invalid as { start: number; count: number }).start * 4
			);
		}
		gl.vertexAttrib4fv(program.a_Color, marquee.borderColor);
		gl.drawArrays(gl.LINE_LOOP, 0, 4);
	}
};

export const drawTerrainMarquee = function (this: typeof Scene) {
	const marquee = this.marquee;
	if (marquee.visible) {
		const gl = GL;
		const vertices = gl.arrays[0].float32;
		const tw = this.tileWidth;
		const th = this.tileHeight;
		const sl = this.scrollLeft;
		const st = this.scrollTop;
		const sr = this.scrollRight;
		const sb = this.scrollBottom;
		const dl = marquee.x;
		const dt = marquee.y;
		const dr = marquee.x + marquee.width;
		const db = marquee.y + marquee.height;
		const ox = 0.5 / this.scaleX / tw;
		const oy = 0.5 / this.scaleY / th;
		vertices[0] = dl + ox;
		vertices[1] = dt + oy;
		vertices[2] = dl + ox;
		vertices[3] = db + oy;
		vertices[4] = dr + ox;
		vertices[5] = db + oy;
		vertices[6] = dr + ox;
		vertices[7] = dt + oy;
		const program = gl.graphicProgram.use();
		gl.matrix
			.project(gl.flip, sr - sl, sb - st)
			.translate(-sl, -st)
			.scale(tw, th);
		gl.bindVertexArray(program.vao.a10);
		gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 8);
		switch (marquee.terrain) {
			case 0b00:
				gl.vertexAttrib4f(program.a_Color, 0, 1, 0, 0.25);
				break;
			case 0b01:
				gl.vertexAttrib4f(program.a_Color, 0, 0, 1, 0.25);
				break;
			case 0b10:
				gl.vertexAttrib4f(program.a_Color, 1, 0, 0, 0.25);
				break;
		}
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
		gl.vertexAttrib4f(program.a_Color, 1, 1, 1, 1);
		gl.drawArrays(gl.LINE_LOOP, 0, 4);
	}
};
