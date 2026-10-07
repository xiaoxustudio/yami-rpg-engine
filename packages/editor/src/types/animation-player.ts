import type { ImageTexture } from '@app/engine/webgl/image-texture.ts';

export interface AnimationMotion {
	key: string;
	mode: string;
	dirCases: Array<{
		loaded?: unknown;
		layers: Array<{ frames: Array<{ key?: unknown }> }>;
	}>;
	[key: string]: unknown;
}

export interface AnimationSprite {
	id: string;
	hframes: number;
	vframes: number;
	[key: string]: unknown;
}

export type AnimationImageMap = Record<string, string>;

export type AnimationTextureMap = Record<string, ImageTexture | null>;
