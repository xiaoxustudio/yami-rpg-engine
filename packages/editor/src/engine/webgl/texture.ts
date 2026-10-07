import { GL } from './webgl-init.ts';
import type { BaseTexture } from './base-texture.ts';

export class Texture {
	complete!: boolean;
	base: BaseTexture | null = null;
	gl: typeof GL;
	x!: number;
	y!: number;
	width!: number;
	height!: number;
	declare on: (type: string, callback: (...args: unknown[]) => void) => void;
	declare reply: (type: string, ...args: unknown[]) => void;

	constructor(options: Record<string, unknown> = {}) {
		if (new.target !== Texture) {
			return;
		}

		this.complete = true;
		this.base = GL.createNormalTexture(options);
		this.gl = GL;
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
	}

	clip(x: number, y: number, width: number, height: number) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		return this;
	}

	clear(red = 0, green = 0, blue = 0, alpha = 0) {
		const gl = this.gl;
		gl.bindFBO(gl.frameBuffer);
		gl.framebufferTexture2D(
			gl.FRAMEBUFFER,
			gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D,
			this.base!.glTexture,
			0
		);
		gl.clearColor(red, green, blue, alpha);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.unbindFBO();
	}

	resize(width: number, height: number) {
		const { gl, base } = this;
		const { format } = base!;
		base!.width = Math.min(width, gl.maxTexSize);
		base!.height = Math.min(height, gl.maxTexSize);
		gl.bindTexture(gl.TEXTURE_2D, base!.glTexture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			format,
			base!.width,
			base!.height,
			0,
			format,
			gl.UNSIGNED_BYTE,
			null
		);
		return this.clip(0, 0, base!.width, base!.height);
	}

	fromImage(image: HTMLImageElement | HTMLCanvasElement | null) {
		if (!image) return this.resize(0, 0);
		if (image.width === 0 && image.height === 0) {
			return this.resize(0, 0);
		}
		const gl = this.gl;
		const base = this.base!;
		const format = base.format;
		base.image = image;
		base.width = Math.min(image.width, gl.maxTexSize);
		base.height = Math.min(image.height, gl.maxTexSize);
		gl.bindTexture(gl.TEXTURE_2D, base.glTexture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			format,
			base.width,
			base.height,
			0,
			format,
			gl.UNSIGNED_BYTE,
			image
		);
		return this.clip(0, 0, base.width, base.height);
	}

	getImageData(x: number, y: number, width: number, height: number) {
		const gl = this.gl;
		const base = this.base;
		if (base instanceof WebGLTexture) {
			const imageData = gl.context2d.createImageData(width, height);
			const { buffer, length } = imageData.data;
			const uint8 = new Uint8Array(buffer, 0, length);
			gl.bindFramebuffer(gl.FRAMEBUFFER, gl.frameBuffer);
			gl.framebufferTexture2D(
				gl.FRAMEBUFFER,
				gl.COLOR_ATTACHMENT0,
				gl.TEXTURE_2D,
				(base as { glTexture?: WebGLTexture | null }).glTexture,
				0
			);
			gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, uint8);
			if (gl.binding) gl.bindFBO(gl.binding);
			else gl.unbindFBO();
			return imageData;
		}
		return null;
	}

	destroy() {
		if (this.base) {
			this.complete = false;
			this.gl.textureManager.delete(this.base);
			this.base = null;
		}
	}
}
