import { GL } from './webgl-init.ts';

type CallbackStore = { [k: string]: Array<(base: BaseTexture) => void> };

export class BaseTexture {
	[k: symbol]: string | CallbackStore | undefined;
	[k: string]: unknown;
	glTexture: WebGLTexture | null;
	width: number;
	height: number;
	format: number;
	magFilter!: number;
	minFilter!: number;
	image!: HTMLImageElement | HTMLCanvasElement | null;
	refCount!: number;
	constructor() {
		this.glTexture = GL.createTexture();
		this.width = 0;
		this.height = 0;
		this.format = GL.RGBA;
	}

	restoreNormalTexture(): void {
		this.glTexture = GL.createTexture();
		const { format, width, height } = this;
		GL.bindTexture(GL.TEXTURE_2D, this.glTexture);
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, this.magFilter);
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, this.minFilter);
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
		GL.texImage2D(GL.TEXTURE_2D, 0, format, width, height, 0, format, GL.UNSIGNED_BYTE, null);
	}

	restoreImageTexture(): void {
		this.glTexture = GL.createTexture();
		const { width, height } = this;
		GL.bindTexture(GL.TEXTURE_2D, this.glTexture);
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, this.magFilter);
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, this.minFilter);
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
		GL.texImage2D(
			GL.TEXTURE_2D,
			0,
			GL.RGBA,
			width,
			height,
			0,
			GL.RGBA,
			GL.UNSIGNED_BYTE,
			this.image
		);
	}

	on(type: string, callback: (base: BaseTexture) => void) {
		let cache = this[BaseTexture.CALLBACK];
		if (cache === type) {
			callback(this);
			return;
		}
		if (cache === undefined) {
			cache = this[BaseTexture.CALLBACK] = { load: [], error: [] };
		}
		if (typeof cache === 'object') {
			cache[type].push(callback);
		}
	}

	reply(type: string) {
		const cache = this[BaseTexture.CALLBACK];
		if (typeof cache === 'object') {
			for (const callback of cache[type]) {
				callback(this);
			}
		}
		this[BaseTexture.CALLBACK] = type;
	}

	static CALLBACK = Symbol('LOAD_CALLBACK');
}
