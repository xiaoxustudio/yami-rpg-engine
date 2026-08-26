import { Palette } from './palette.ts';
import { Data } from '@app/data/data-object.ts';
import { File } from '@app/file/file-system-core.ts';
import { SetTileTag } from '@app/module/global.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { useTileNodeWindow } from '@app/composables/useTileNodeWindow';
import { getPaletteStore } from '@app/stores/palette';

Palette.openSelection = function (this: typeof Palette) {
	const tileset = getPaletteStore().tileset;
	const { marquee } = this;
	if (tileset.type === 'auto' && marquee.visible) {
		const { x, y, width, height } = marquee;
		const i = x + y * tileset.width;
		const tile = tileset.tiles[i];
		if (tile !== 0) {
			const template = Data.autotiles.map[tile.template];
			const image = this.images[tile.image];
			if (width === 1 && height === 1 && template !== undefined && image instanceof Image) {
				useTileNodeWindow().open(template.nodes, image, tile.x, tile.y);
			}
		}
	}
};

Palette.editSelection = function (this: typeof Palette) {
	const tileset = getPaletteStore().tileset;
	const { marquee } = this;
	if (tileset.type === 'auto' && marquee.visible) {
		const { x, y, width, height } = marquee;
		const i = x + y * tileset.width;
		if (width === 1 && height === 1 && i < tileset.tiles.length) {
			Palette.editAutoTile(i);
		}
	}
};

Palette.editTagAt = function (this: typeof Palette, x: number, y: number) {
	const tileset = getPaletteStore().tileset;
	const tags = tileset?.tags;
	if (!tags) return;
	const i = x + y * tileset.width;
	if (i < 0 || i >= tags.length) return;
	SetTileTag.open!(tags[i], (tag: unknown) => {
		if (tags[i] === tag) return;
		tags[i] = tag;
		this.updateInfo();
		this.requestRendering();
		Scene.requestRendering();
		File.planToSave!(this.meta);
	});
};
