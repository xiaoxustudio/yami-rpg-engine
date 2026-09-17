import { Scene } from './scene-window.ts';
import { ImageTexture } from '@app/engine/webgl/image-texture.ts';

Scene.Textures = class Textures {
	state: string;
	[k: string]: unknown;

	constructor() {
		this.state = 'open';
		this[''] = null;
	}

	append(texture: ImageTexture) {
		if (this.state === 'open') {
			this[texture.base!.guid as string] = texture;
		}
	}

	load(guid: string) {
		if (!this[guid]) {
			const texture = new ImageTexture(guid);
			if (texture.complete) {
				this[guid] = texture;
				return Promise.resolve().then(() => {
					Scene.requestRendering!();
					return texture;
				});
			}
			this[guid] = new Promise<ImageTexture | null>((resolve) => {
				texture.on('load', () => {
					if (this.state === 'open' && this[guid] instanceof Promise) {
						this[guid] = texture;
						Scene.requestRendering!();
						return resolve(texture);
					}
					texture.destroy();
					return resolve(null);
				});
			});
		}
		return this[guid];
	}

	destroy() {
		this.state = 'closed';
		for (const texture of Object.values(this)) {
			if (texture instanceof ImageTexture) {
				texture.destroy();
			}
		}
	}
};
