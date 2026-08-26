import { getDataStore } from '@app/stores/data';
import { append } from '@app/utils/array';
import { Updater } from './updater.ts';

interface TilesetShape {
	width: number;
	height: number;
	terrains?: unknown[];
	tags?: unknown[];
	[key: string]: unknown;
}

function updateTilesets(verNum: number) {
	if (verNum < Updater.getVersionNumber!('1.0.60')) {
		const { manifest, tilesets } = getDataStore().data;
		for (const [guid, tileset] of Object.entries(tilesets! as Record<string, TilesetShape>)) {
			const meta = manifest!.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			const length = tileset.width * tileset.height;
			tileset.terrains = Array.from({ length: length }).fill(0);
			append(getDataStore().data.manifest!.changes as unknown[], meta);
		}
	}
	if (verNum < Updater.getVersionNumber!('1.0.85')) {
		const { manifest, tilesets } = getDataStore().data;
		for (const [guid, tileset] of Object.entries(tilesets! as Record<string, TilesetShape>)) {
			const meta = manifest!.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			const length = tileset.width * tileset.height;
			tileset.tags = Array.from({ length: length }).fill(0);
			append(getDataStore().data.manifest!.changes as unknown[], meta);
		}
	}
}

export function initUpdaterTilesets(): void {
	Updater.updateTilesets = updateTilesets;
}
