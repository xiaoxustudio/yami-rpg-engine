import { Scene } from './scene-window.ts';
import { History } from '@app/legacy/tools/history.ts';
(() => {
	interface TilemapBuffer extends Uint32Array {
		width: number;
		height: number;
		changed?: boolean;
		tilesetMap?: Record<string, string>;
		tiles?: Uint32Array;
	}
	interface MapData {
		tiles?: Uint32Array;
		terrains?: Uint8Array;
		width?: number;
		height?: number;
		length: number;
		[index: number]: number;
	}
	let tilemap: TilemapBuffer | null = null;
	let mapData: MapData | null = null;
	let changes: unknown = null;
	let states: unknown = null;
	let count = 0;
	let length = 0;

	Scene.beginMapRecord = function (this: typeof Scene) {
		switch (this.layer) {
			case 'tilemap':
				tilemap = this.tilemap;
				mapData = (tilemap ? tilemap.tiles : null) as MapData | null;
				break;
			case 'terrain':
				tilemap = null;
				mapData = this.terrains as MapData | null;
				break;
		}
		if (mapData && length < mapData.length) {
			length = mapData.length;
			changes = new Uint32Array(length * 2);
			states = new Uint8Array(length);
		}
	};

	Scene.closeMapRecord = function (this: typeof Scene) {
		if (mapData !== null) {
			tilemap = null;
			mapData = null;
			changes = null;
			states = null;
			count = 0;
			length = 0;
		}
	};

	Scene.saveMapRecord = function (this: typeof Scene) {
		if (count === 0) return;
		if (tilemap) {
			tilemap.changed = true;
			this.history.save({
				type: 'scene-tilemap-change',
				tilemap: tilemap,
				changes: (changes as Uint32Array).slice(0, count),
				tilesetMap: tilemap.tilesetMap
			});
		} else {
			this.planToSaveTerrains();
			this.history.save({
				type: 'scene-terrain-change',
				terrains: mapData,
				changes: (changes as Uint32Array).slice(0, count)
			});
		}
		for (let i = 0; i < count; i += 2) {
			(states as Uint8Array)[(changes as Uint32Array)[i]] = 0;
		}
		count = 0;
	};

	Scene.recordMapData = function (this: typeof Scene, index: number) {
		if ((states as Uint8Array)[index] === 0) {
			(states as Uint8Array)[index] = 1;
			(changes as Uint32Array)[count] = index;
			(changes as Uint32Array)[count + 1] = (mapData as MapData)[index];
			count += 2;
		}
	};

	Scene.restoreMapData = function (this: typeof Scene) {
		const ch = changes as Uint32Array;
		const st = states as Uint8Array;
		const md = mapData as MapData;
		for (let i = count - 2; i >= 0; i -= 2) {
			const index = ch[i];
			md[index] = ch[i + 1];
			st[index] = 0;
		}
		count = 0;
	};

	Scene.undoMapData = function (this: typeof Scene, mapData: MapData, changes: unknown) {
		const ch = changes as Uint32Array;
		const length = ch.length;
		for (let i = length - 1; i > 0; i -= 2) {
			const ti = ch[i - 1];
			const code = ch[i];
			ch[i] = mapData[ti];
			mapData[ti] = code;
		}
	};

	Scene.redoMapData = function (this: typeof Scene, mapData: MapData, changes: unknown) {
		const ch = changes as Uint32Array;
		const length = ch.length;
		for (let i = 1; i < length; i += 2) {
			const ti = ch[i - 1];
			const code = ch[i];
			ch[i] = mapData[ti];
			mapData[ti] = code;
		}
	};
})();

Scene.createHistory = (function IIFE() {
	const onSave = (data: { layer?: string }) => {
		data.layer = Scene.tilemap ?? Scene.layer;
	};
	const onRestore = (data: { layer?: string }) => {
		const { layer } = data;
		switch (layer) {
			case 'object':
			case 'terrain':
				Scene.switchLayer!(layer);
				break;
			default:
				Scene.openTilemap!(layer);
				break;
		}
	};
	return function (this: typeof Scene) {
		const history = new History(100);
		history.onSave = onSave;
		history.onRestore = onRestore;
		return history;
	};
})();
