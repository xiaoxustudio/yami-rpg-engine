import { drawAndFitImage } from '@app/utils/element-utils';
import { File } from '@app/file/file-system-core.ts';
import { getPaletteStore } from '@app/stores/palette';
import { getAutoTileStore } from '@app/stores/auto-tile';
import type { AutoTile } from '@app/palette/auto-tile.ts';
import { getDevicePixelContentBoxSize } from '@app/utils/css';

type AutoTileNodeData = {
	rule: number;
	frames: number[];
};

type AutoTileTemplateData = {
	id: string;
	name: string;
	cover: number;
	nodes: AutoTileNodeData[];
};

interface AutoTileEngineShape {
	shiftTemplateFrames: (
		this: typeof AutoTile,
		template: AutoTileTemplateData,
		offsetX: number,
		offsetY: number
	) => void;
	generateFrames: (
		this: typeof AutoTile,
		id: number,
		strideX: number,
		strideY: number,
		count: number
	) => void;
	createFrameData: (this: typeof AutoTile) => number;
	updateCanvas: (this: typeof AutoTile) => void;
	drawFrame: (this: typeof AutoTile) => void;
}

export const AutoTileEngine = {} as AutoTileEngineShape;

AutoTileEngine.shiftTemplateFrames = function (
	this: typeof AutoTile,
	template: AutoTileTemplateData,
	offsetX: number,
	offsetY: number
) {
	const sprite = this.image;
	if (!(sprite instanceof Image)) {
		return;
	}
	const tileWidth = getPaletteStore().tileset.tileWidth;
	const tileHeight = getPaletteStore().tileset.tileHeight;
	const hframes = Math.floor(sprite.naturalWidth / tileWidth);
	const vframes = Math.floor(sprite.naturalHeight / tileHeight);
	const ox = ((offsetX % hframes) + hframes) % hframes;
	const oy = ((offsetY % vframes) + vframes) % vframes;
	for (const node of template.nodes) {
		const frames = node.frames;
		const length = frames.length;
		for (let i = 0; i < length; i++) {
			const frame = frames[i];
			const sx = frame & 0xff;
			const sy = frame >> 8;
			const dx = (sx + ox) % hframes;
			const dy = (sy + oy) % vframes;
			frames[i] = dx | (dy << 8);
		}
	}
	this.createFrameItems();
	getAutoTileStore().changed = true;
};

AutoTileEngine.generateFrames = function (
	this: typeof AutoTile,
	id: number,
	strideX: number,
	strideY: number,
	count: number
) {
	const sprite = this.image;
	if (!(sprite instanceof Image)) {
		return;
	}
	const tileWidth = getPaletteStore().tileset.tileWidth;
	const tileHeight = getPaletteStore().tileset.tileHeight;
	const hframes = Math.floor(sprite.naturalWidth / tileWidth);
	const vframes = Math.floor(sprite.naturalHeight / tileHeight);
	const ox = ((strideX % hframes) + hframes) % hframes;
	const oy = ((strideY % vframes) + vframes) % vframes;
	const maximum = this.frameMaximum!;
	const frames = this.frames!;
	const frame = frames[id];
	let x = frame & 0xff;
	let y = frame >> 8;
	count = Math.min(count, maximum - frames.length);
	while (count-- > 0) {
		x = (x + ox) % hframes;
		y = (y + oy) % vframes;
		frames.splice(++id, 0, x | (y << 8));
	}
	this.createFrameItems();
	getAutoTileStore().changed = true;
};

AutoTileEngine.createFrameData = function (this: typeof AutoTile) {
	return 0;
};

AutoTileEngine.updateCanvas = function (this: typeof AutoTile) {
	const canvas = this.canvas!;
	const { width, height } = getDevicePixelContentBoxSize(canvas);
	if (canvas.width !== width) {
		canvas.width = width;
	}
	if (canvas.height !== height) {
		canvas.height = height;
	}
};

AutoTileEngine.drawFrame = function (this: typeof AutoTile) {
	const canvas = this.canvas!;
	const context = canvas.getContext('2d')!;
	const width = canvas.width;
	const height = canvas.height;

	context.clearRect(0, 0, width, height);

	if (!(this.image instanceof Image)) {
		if (this.image === this.noImage) return;
		const guid = getAutoTileStore().imageId;
		if (!guid) {
			return;
		}
		const symbol = (this.image = Symbol());
		return File.get!({
			guid: guid,
			type: 'image'
		}).then((image: HTMLImageElement | null) => {
			if (this.image === symbol) {
				if (image) {
					this.image = image;
					this.drawFrame();
				} else {
					this.image = this.noImage;
				}
			}
		});
	}

	const image = this.image;
	const frames = this.frames!;
	const frame = frames[getAutoTileStore().frameIndex];
	const tileWidth = getPaletteStore().tileset.tileWidth;
	const tileHeight = getPaletteStore().tileset.tileHeight;
	const x = (getAutoTileStore().offsetX + (frame & 0xff)) * tileWidth;
	const y = (getAutoTileStore().offsetY + (frame >> 8)) * tileHeight;

	drawAndFitImage(context, image, x, y, tileWidth, tileHeight);
};
