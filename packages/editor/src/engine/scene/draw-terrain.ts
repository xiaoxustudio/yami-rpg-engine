import { Scene } from '@app/scene/scene-window.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';

export const drawTerrainLayer = function (this: typeof Scene) {
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const terrains = this.terrains;
	const tro = terrains.rowOffset;
	const width = this.width;
	const height = this.height;
	const tw = this.tileWidth;
	const th = this.tileHeight;
	const sl = this.scrollLeft;
	const st = this.scrollTop;
	const sr = this.scrollRight;
	const sb = this.scrollBottom;
	const bx = Math.max(Math.floor(sl / tw), 0);
	const by = Math.max(Math.floor(st / th), 0);
	const ex = Math.min(Math.ceil(sr / tw), width);
	const ey = Math.min(Math.ceil(sb / th), height);
	let vi = 0;
	let flag = false;

	for (let y = by; y < ey; y++) {
		for (let x = bx; x < ex; x++) {
			const i = x + y * tro;
			if (terrains[i] === 0b10) {
				if (flag) {
					continue;
				} else {
					flag = true;
					vertices[vi] = x;
					vertices[vi + 1] = y;
					vertices[vi + 2] = x;
					vertices[vi + 3] = y + 1;
				}
			} else if (flag) {
				flag = false;
				vertices[vi + 4] = x;
				vertices[vi + 5] = y + 1;
				vertices[vi + 6] = x;
				vertices[vi + 7] = y;
				vi += 8;
			}
		}
		if (flag) {
			flag = false;
			vertices[vi + 4] = ex;
			vertices[vi + 5] = y + 1;
			vertices[vi + 6] = ex;
			vertices[vi + 7] = y;
			vi += 8;
		}
	}
	const mi1 = vi;

	for (let y = by; y < ey; y++) {
		for (let x = bx; x < ex; x++) {
			const i = x + y * tro;
			if (terrains[i] === 0b01) {
				if (flag) {
					continue;
				} else {
					flag = true;
					vertices[vi] = x;
					vertices[vi + 1] = y;
					vertices[vi + 2] = x;
					vertices[vi + 3] = y + 1;
				}
			} else if (flag) {
				flag = false;
				vertices[vi + 4] = x;
				vertices[vi + 5] = y + 1;
				vertices[vi + 6] = x;
				vertices[vi + 7] = y;
				vi += 8;
			}
		}
		if (flag) {
			flag = false;
			vertices[vi + 4] = ex;
			vertices[vi + 5] = y + 1;
			vertices[vi + 6] = ex;
			vertices[vi + 7] = y;
			vi += 8;
		}
	}
	const mi2 = vi;

	const ox = 0.5 / this.scaleX / tw;
	const oy = 0.5 / this.scaleY / th;
	for (let y = by; y <= ey; y++) {
		for (let x = bx; x < ex; x++) {
			const i = x + y * tro;
			if (
				y < ey && terrains[i] === 0b10
					? y === 0 || terrains[i - tro] !== 0b10
					: y !== 0 && terrains[i - tro] === 0b10
			) {
				if (flag) {
					continue;
				} else {
					flag = true;
					vertices[vi] = x;
					vertices[vi + 1] = y + oy;
				}
			} else if (flag) {
				flag = false;
				vertices[vi + 2] = x + ox * 2;
				vertices[vi + 3] = y + oy;
				vi += 4;
			}
		}
		if (flag) {
			flag = false;
			vertices[vi + 2] = ex + ox * 2;
			vertices[vi + 3] = y + oy;
			vi += 4;
		}
	}

	for (let x = bx; x <= ex; x++) {
		for (let y = by; y < ey; y++) {
			const i = x + y * tro;
			if (
				x < ex && terrains[i] === 0b10
					? x === 0 || terrains[i - 1] !== 0b10
					: x !== 0 && terrains[i - 1] === 0b10
			) {
				if (flag) {
					continue;
				} else {
					flag = true;
					vertices[vi] = x + ox;
					vertices[vi + 1] = y;
				}
			} else if (flag) {
				flag = false;
				vertices[vi + 2] = x + ox;
				vertices[vi + 3] = y + oy * 2;
				vi += 4;
			}
		}
		if (flag) {
			flag = false;
			vertices[vi + 2] = x + ox;
			vertices[vi + 3] = ey + oy * 2;
			vi += 4;
		}
	}
	const mi3 = vi;

	for (let y = by; y <= ey; y++) {
		for (let x = bx; x < ex; x++) {
			const i = x + y * tro;
			if (
				y < ey && terrains[i] === 0b01
					? y === 0 || terrains[i - tro] === 0b00
					: y !== 0 && terrains[i - tro] === 0b01
			) {
				if (flag) {
					continue;
				} else {
					flag = true;
					vertices[vi] = x;
					vertices[vi + 1] = y + oy;
				}
			} else if (flag) {
				flag = false;
				vertices[vi + 2] = x + ox * 2;
				vertices[vi + 3] = y + oy;
				vi += 4;
			}
		}
		if (flag) {
			flag = false;
			vertices[vi + 2] = ex + ox * 2;
			vertices[vi + 3] = y + oy;
			vi += 4;
		}
	}

	for (let x = bx; x <= ex; x++) {
		for (let y = by; y < ey; y++) {
			const i = x + y * tro;
			if (
				x < ex && terrains[i] === 0b01
					? x === 0 || terrains[i - 1] === 0b00
					: x !== 0 && terrains[i - 1] === 0b01
			) {
				if (flag) {
					continue;
				} else {
					flag = true;
					vertices[vi] = x + ox;
					vertices[vi + 1] = y;
				}
			} else if (flag) {
				flag = false;
				vertices[vi + 2] = x + ox;
				vertices[vi + 3] = y + oy * 2;
				vi += 4;
			}
		}
		if (flag) {
			flag = false;
			vertices[vi + 2] = x + ox;
			vertices[vi + 3] = ey + oy * 2;
			vi += 4;
		}
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
		if (mi1 !== mi2) {
			gl.vertexAttrib4f(program.a_Color, 0, 0, 1, 0.25);
			gl.drawElements(gl.TRIANGLES, (mi2 - mi1) * 0.75, gl.UNSIGNED_INT, mi1 * 3);
		}
		if (mi1 !== 0) {
			gl.vertexAttrib4f(program.a_Color, 1, 0, 0, 0.25);
			gl.drawElements(gl.TRIANGLES, mi1 * 0.75, gl.UNSIGNED_INT, 0);
		}
		if (mi3 !== vi) {
			gl.vertexAttrib4f(program.a_Color, 0, 0, 1, 1);
			gl.drawArrays(gl.LINES, mi3 / 2, (vi - mi3) / 2);
		}
		if (mi2 !== mi3) {
			gl.vertexAttrib4f(program.a_Color, 1, 0, 0, 1);
			gl.drawArrays(gl.LINES, mi2 / 2, (mi3 - mi2) / 2);
		}
	}
};
