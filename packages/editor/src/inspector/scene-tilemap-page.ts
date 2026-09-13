import { getElementWriter } from '@app/utils/dom';
import { inspectorEls } from './element-registry.ts';
import { clear, read, write } from '@app/utils/element-utils';
import { Codec } from '@app/engine/codec/codec.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';

{
	interface SceneTilemapLightItem {
		name?: string;
		tip?: string;
		value: string | number;
	}
	interface SceneTilemapLightBox {
		lightItems: {
			all: SceneTilemapLightItem[];
			tile: SceneTilemapLightItem[];
			sprite: SceneTilemapLightItem[];
		};
		dataItems: SceneTilemapLightItem[] | null;
		dataValue: unknown;
		loadItems(items: SceneTilemapLightItem[]): void;
		update(): void;
		setItemNames:
			| ((
					this: SceneTilemapLightBox,
					options: Record<string, string | { name?: string; tip?: string }>
			  ) => void)
			| null;
		[k: string]: unknown;
	}
	interface SceneTilemapShape {
		nameBox: HTMLElement | null;
		lightBox: SceneTilemapLightBox | null;
		target: Record<string, unknown> | null;
		update: ((tilemap: Record<string, unknown>, key: string, value: unknown) => void) | null;
		layerWrite: ((event: Event & { value: unknown }) => void) | null;
		layerInput: ((event: Event) => void) | null;
		[k: string]: unknown;
	}
	const SceneTilemap: SceneTilemapShape = {
		owner: Scene,
		target: null,
		nameBox: null,
		lightBox: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		write: null,
		update: null,
		layerWrite: null,
		layerInput: null
	};

	SceneTilemap.initialize = function () {};

	SceneTilemap.create = function (this: typeof SceneTilemap, width = 4, height = 4) {
		const tiles = Scene.createTiles!(width, height);
		return Codec.decodeTilemap!({
			class: 'tilemap',
			name: 'Tilemap',
			enabled: true,
			hidden: false,
			locked: false,
			presetId: '',
			tilesetMap: {},
			shortcut: Scene.tilemaps.shortcuts.getEmptyIndex(),
			layer: 'background',
			order: 0,
			light: 'global',
			blend: 'normal',
			x: 0,
			y: 0,
			width: width,
			height: height,
			anchorX: 0,
			anchorY: 0,
			offsetX: 0,
			offsetY: 0,
			parallaxFactorX: 1,
			parallaxFactorY: 1,
			opacity: 1,
			code: Codec.encodeTiles!(tiles),
			conditions: [],
			events: [],
			scripts: []
		});
	};

	SceneTilemap.open = function (this: typeof SceneTilemap, tilemap: Record<string, unknown>) {
		if (this.target !== tilemap) {
			this.target = tilemap;

			const write = getElementWriter('sceneTilemap', tilemap);
			write('conditions');
			write('events');
			write('scripts');
			(
				inspectorEls.get('sceneTilemap-vue-mount') as HTMLElement & { sync?: () => void }
			)?.sync?.();
		}
	};

	SceneTilemap.close = function (this: typeof SceneTilemap) {
		if (this.target) {
			Scene.list.unselect(this.target);
			Scene.updateTarget!();
			this.target = null;
			clear(inspectorEls.get('sceneTilemap-conditions'));
			clear(inspectorEls.get('sceneTilemap-events'));
			clear(inspectorEls.get('sceneTilemap-scripts'));
			clear(inspectorEls.get('sceneTilemap-parameter-pane'));
		}
	};

	SceneTilemap.write = function (this: typeof SceneTilemap, _options: Record<string, unknown>) {
		(
			inspectorEls.get('sceneTilemap-vue-mount') as HTMLElement & { sync?: () => void }
		)?.sync?.();
	};

	SceneTilemap.update = function (
		this: typeof SceneTilemap,
		tilemap: Record<string, unknown>,
		key: string,
		value: unknown
	) {
		Scene.planToSave!();
		switch (key) {
			case 'name':
				if (tilemap.name !== value) {
					tilemap.name = value;
					Scene.updateTargetInfo!();
					Scene.list.updateItemName(tilemap);
				}
				break;
			case 'layer':
			case 'order':
				if (tilemap[key] !== value) {
					tilemap[key] = value;
					Scene.loadObjects!();
				}
				break;
			case 'light':
			case 'blend':
			case 'x':
			case 'y':
			case 'anchorX':
			case 'anchorY':
			case 'offsetX':
			case 'offsetY':
			case 'parallaxFactorX':
			case 'parallaxFactorY':
			case 'opacity':
				if (tilemap[key] !== value) {
					tilemap[key] = value;
				}
				break;
			case 'width':
				if (tilemap.width !== value) {
					Scene.setTilemapSize!(tilemap, value, tilemap.height);
				}
				break;
			case 'height':
				if (tilemap.height !== value) {
					Scene.setTilemapSize!(tilemap, tilemap.width, value);
				}
				break;
		}
		Scene.requestRendering!();
	};

	SceneTilemap.layerWrite = function (
		this: typeof SceneTilemap,
		event: Event & { value: unknown }
	) {
		const lightBox =
			SceneTilemap.lightBox ??
			(inspectorEls.get('sceneTilemap-light') as unknown as typeof SceneTilemap.lightBox);
		if (!lightBox?.lightItems) return;
		SceneTilemap.lightBox = lightBox;
		const type = event.value === 'object' ? 'sprite' : 'tile';
		const items = lightBox.lightItems[type];
		if (lightBox.dataItems !== items) {
			lightBox.loadItems(items);
		}
	};

	SceneTilemap.layerInput = function (this: typeof SceneTilemap, _event: Event) {
		if (Inspector.manager.focusing === this) {
			const lightBox = SceneTilemap.lightBox!;
			const value = read(lightBox);
			for (const item of lightBox.dataItems ?? []) {
				if (item.value === value) {
					return;
				}
			}
			write(lightBox, 'raw');
			this.changes = [
				{
					input: lightBox,
					oldValue: value,
					newValue: 'raw'
				}
			];
		}
	};

	Inspector.sceneTilemap = SceneTilemap;
}
