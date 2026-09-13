import { Data } from '@app/data/data-object.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { Texture } from '@app/engine/webgl/texture.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';

export const createStartPositionTexture = function (this: typeof Scene) {
	let texture = this.startPositionTexture;
	if (texture === null) {
		const canvas = document.createElement('canvas');
		canvas.width = 256;
		canvas.height = 256;
		const context = canvas.getContext('2d')!;
		const y = (canvas.height - 160) / 2 + 160 * 0.85;
		context.fillStyle = 'rgba(0, 255, 255, 0.5)';
		context.fillRect(0, 0, 256, 256);
		context.fillStyle = '#ffffff';
		context.textAlign = 'center';
		context.shadowColor = '#000000';
		context.shadowBlur = 4;
		context.shadowOffsetY = 4;
		context.font = '160px Awesome';
		context.fillText('\uf041', 128, y);
		texture = new Texture();
		texture.fromImage(canvas);
		texture.base.protected = true;
		this.startPositionTexture = texture;
	}
	return texture;
};

export const drawStartPosition = function (this: typeof Scene) {
	const { startPosition } = Data.config;
	if (startPosition.sceneId === this.meta.guid) {
		const tw = this.tileWidth;
		const th = this.tileHeight;
		const sl = this.scrollLeft;
		const st = this.scrollTop;
		const sr = this.scrollRight;
		const sb = this.scrollBottom;
		const dl = (startPosition.x - 0.5) * tw;
		const dt = (startPosition.y - 0.5) * th;
		const dr = dl + tw;
		const db = dt + th;
		if (dl < sr && dt < sb && dr > sl && db > st) {
			const gl = GL;
			const vertices = gl.arrays[0].float32;
			vertices[0] = dl;
			vertices[1] = dt;
			vertices[2] = 0;
			vertices[3] = 0;
			vertices[4] = dl;
			vertices[5] = db;
			vertices[6] = 0;
			vertices[7] = 1;
			vertices[8] = dr;
			vertices[9] = db;
			vertices[10] = 1;
			vertices[11] = 1;
			vertices[12] = dr;
			vertices[13] = dt;
			vertices[14] = 1;
			vertices[15] = 0;

			gl.alpha = 0.5;
			const texture = this.createStartPositionTexture!();
			const program = gl.imageProgram.use();
			gl.matrix.project(gl.flip, sr - sl, sb - st).translate(-sl, -st);
			gl.bindVertexArray(program.vao);
			gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix);
			gl.uniform1i(program.u_LightMode, 0);
			gl.uniform1i(program.u_ColorMode, 0);
			gl.uniform4f(program.u_Tint, 0, 0, 0, 0);
			gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 16);
			gl.bindTexture(gl.TEXTURE_2D, texture.base.glTexture);
			gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0);
			gl.alpha = 1;
		}
	}
};
