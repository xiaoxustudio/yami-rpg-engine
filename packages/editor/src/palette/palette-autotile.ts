import { Palette } from './palette.ts';
import { AutoTile } from './auto-tile.ts';
import { File } from '@app/file/file-system-core.ts';
import { GlobalClipboard } from '@app/utils/clipboard';
import { getPaletteStore } from '@app/stores/palette';

Palette.editAutoTile = function (this: typeof Palette, index: number) {
	if (getPaletteStore().tileset.type === 'auto') {
		const tiles = getPaletteStore().tileset.tiles;
		if (index < tiles.length) {
			const tile = tiles[index];
			this.openIndex = index;
			AutoTile.open!(tile || AutoTile.create!());
		}
	}
};

Palette.copyAutoTile = function (this: typeof Palette, index: number) {
	if (getPaletteStore().tileset.type === 'auto') {
		const tileset = getPaletteStore().tileset;
		const tiles = tileset.tiles;
		const priorities = tileset.priorities;
		const terrains = tileset.terrains;
		if (tiles[index]) {
			GlobalClipboard.write('yami.tile', {
				tile: tiles[index],
				priority: priorities[index],
				terrain: terrains[index]
			});
		}
	}
};

Palette.pasteAutoTile = function (this: typeof Palette, index: number) {
	if (getPaletteStore().tileset.type === 'auto') {
		const tileset = getPaletteStore().tileset;
		const tiles = tileset.tiles;
		const priorities = tileset.priorities;
		const terrains = tileset.terrains;
		const copy = GlobalClipboard.read('yami.tile');
		if (copy && index < tiles.length) {
			tiles[index] = copy.tile;
			priorities[index] = copy.priority;
			terrains[index] = copy.terrain;
			this.requestRendering();
			File.planToSave!(this.meta);
		}
	}
};

Palette.deleteAutoTile = function (this: typeof Palette, index: number) {
	if (getPaletteStore().tileset.type === 'auto') {
		const tileset = getPaletteStore().tileset;
		const tiles = tileset.tiles;
		const priorities = tileset.priorities;
		const terrains = tileset.terrains;
		if (tiles[index]) {
			tiles[index] = 0;
			priorities[index] = 0;
			terrains[index] = 0;
			this.requestRendering();
			File.planToSave!(this.meta);
		}
	}
};
