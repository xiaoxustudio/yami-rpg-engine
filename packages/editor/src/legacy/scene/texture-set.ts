import { Scene } from './scene-window.ts';
import { ImageTexture } from '@/webgl/image-texture.ts';

Scene.Textures = class Textures {
	state: string;

	constructor() {
		this.state = 'open';
		(this as any)[''] = null;
	}

	append(texture: any) {
		if (this.state === 'open') {
			(this as any)[texture.base.guid] = texture;
		}
	}

	load(guid: any) {
		if (!(this as any)[guid]) {
			const texture = new ImageTexture(guid);
			if (texture.complete) {
				(this as any)[guid] = texture;
				return Promise.resolve().then(() => {
					Scene.requestRendering!();
					return texture;
				});
			}
			(this as any)[guid] = new Promise((resolve: any) => {
				texture.on('load', () => {
					if (this.state === 'open' && (this as any)[guid] instanceof Promise) {
						(this as any)[guid] = texture;
						Scene.requestRendering!();
						return resolve(texture);
					}
					texture.destroy();
					return resolve(null);
				});
			});
		}
		return (this as any)[guid];
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
