// AnimationPlayer 的 motions / sprites / images / textures 字段契约。 替代 animation/animation-player.ts:40-43 的 `Record<string, any>` 残留， 收敛为精确接口。

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

export type AnimationTextureMap = Record<string, any | null>;
