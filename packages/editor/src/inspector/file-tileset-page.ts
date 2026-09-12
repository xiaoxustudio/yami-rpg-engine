import { inspectorEls } from './element-registry.ts';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { addClass, disable, enable, read, removeClass } from '@app/utils/element-utils';
import { File } from '@app/file/file-system-core.ts';
import type { FileMeta } from '@app/data/metadata-manifest.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { Palette } from '@app/palette/palette.ts';
import { Scene } from '@app/scene/scene-window.ts';

{
	interface FileTilesetShape {
		target: Record<string, unknown> | null;
		meta: FileMeta | null;
		update: ((tileset: Record<string, unknown>, key: string, value: unknown) => void) | null;
		[k: string]: unknown;
	}
	const FileTileset: FileTilesetShape = {
		target: null,
		meta: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null
	};

	FileTileset.initialize = function () {};

	FileTileset.create = function (this: typeof FileTileset, type: string) {
		switch (type) {
			case 'normal':
				return {
					type: 'normal',
					image: '',
					width: 1,
					height: 1,
					tileWidth: 32,
					tileHeight: 32,
					globalOffsetX: 0,
					globalOffsetY: 0,
					globalPriority: 0,
					priorities: [0],
					terrains: [0],
					tags: [0]
				};
			case 'auto':
				return {
					type: 'auto',
					width: 1,
					height: 1,
					tileWidth: 32,
					tileHeight: 32,
					globalOffsetX: 0,
					globalOffsetY: 0,
					globalPriority: 0,
					tiles: [0],
					priorities: [0],
					terrains: [0],
					tags: [0]
				};
		}
	};

	FileTileset.open = function (
		this: typeof FileTileset,
		tileset: Record<string, unknown>,
		meta: FileMeta | null
	) {
		if (this.meta !== meta) {
			this.target = tileset;
			this.meta = meta;
			Palette.open!(meta);

			addClass(Inspector.manager, 'overflow-visible');

			switch (tileset.type) {
				case 'normal':
					enable(inspectorEls.get('fileTileset-image'));
					break;
				case 'auto':
					disable(inspectorEls.get('fileTileset-image'));
					break;
			}

			(inspectorEls.get('fileTileset') as HTMLElement & { sync?: () => void })?.sync?.();
		}
	};

	FileTileset.close = function (this: typeof FileTileset) {
		if (this.target) {
			removeClass(Inspector.manager, 'overflow-visible');
			getBrowserInstance()?.unselect?.(this.meta);
			Palette.close!();
			this.target = null;
			this.meta = null;
		}
	};

	FileTileset.update = function (
		this: typeof FileTileset,
		tileset: Record<string, unknown>,
		key: string,
		value: unknown
	) {
		File.planToSave!(this.meta);
		switch (key) {
			case 'image':
				if (tileset.image !== value) {
					Palette.setImage!(value);
				}
				break;
			case 'width':
				if (tileset.width !== value) {
					Palette.setSize!(value, tileset.height);
				}
				break;
			case 'height':
				if (tileset.height !== value) {
					Palette.setSize!(tileset.width, value);
				}
				break;
			case 'tileWidth':
				if (tileset.tileWidth !== value) {
					Palette.setTileSize!(value, tileset.tileHeight);
				}
				break;
			case 'tileHeight':
				if (tileset.tileHeight !== value) {
					Palette.setTileSize!(tileset.tileWidth, value);
				}
				break;
			case 'globalOffsetX':
			case 'globalOffsetY':
			case 'globalPriority':
				if (tileset[key] !== value) {
					tileset[key] = value;
				}
				break;
		}
		Scene.requestRendering!();
	};

	FileTileset.paramInput = function (this: typeof FileTileset, event: Event) {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^fileTileset-').test(element.id)) break;
			element = element.parentElement;
		}
		FileTileset.update!(
			FileTileset.target as Record<string, unknown>,
			Inspector.getKey!(element),
			read(element)
		);
	};

	Inspector.fileTileset = FileTileset;
}
