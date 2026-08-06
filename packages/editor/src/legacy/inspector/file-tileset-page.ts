import { $, getElementWriter } from '@/util/dom.ts';
import { addClass, disable, enable, read, removeClass } from '@/util/element-utils';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from './inspector.ts';
import { Palette } from '@/palette/palette.ts';
import { Scene } from '@/scene/scene-window.ts';

{
	const FileTileset = {
		target: null,
		meta: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null
	};

	FileTileset.initialize = function () {
		if (!$('#fileTileset-image')) return;
		// 6 控件 input + width/height change 经 Vue 模板转发（FileTilesetPage.vue @input/@change → FileTileset.*）

		Palette.initialize();
	};

	FileTileset.create = function (type) {
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

	FileTileset.open = function (tileset, meta) {
		if (this.meta !== meta) {
			this.target = tileset;
			this.meta = meta;
			Palette.open(meta);

			addClass(Inspector.manager, 'overflow-visible');

			switch (tileset.type) {
				case 'normal':
					enable($('#fileTileset-image'));
					break;
				case 'auto':
					disable($('#fileTileset-image'));
					break;
			}

			const write = getElementWriter('fileTileset', tileset);
			write('image', tileset.image ?? '');
			write('width');
			write('height');
			write('tileWidth');
			write('tileHeight');
			write('globalOffsetX');
			write('globalOffsetY');
			write('globalPriority');
		}
	};

	FileTileset.close = function () {
		if (this.target) {
			removeClass(Inspector.manager, 'overflow-visible');
			(window as any).Browser?.unselect?.(this.meta);
			Palette.close();
			this.target = null;
			this.meta = null;
		}
	};

	FileTileset.update = function (tileset, key, value) {
		File.planToSave(this.meta);
		switch (key) {
			case 'image':
				if (tileset.image !== value) {
					Palette.setImage(value);
				}
				break;
			case 'width':
				if (tileset.width !== value) {
					Palette.setSize(value, tileset.height);
				}
				break;
			case 'height':
				if (tileset.height !== value) {
					Palette.setSize(tileset.width, value);
				}
				break;
			case 'tileWidth':
				if (tileset.tileWidth !== value) {
					Palette.setTileSize(value, tileset.tileHeight);
				}
				break;
			case 'tileHeight':
				if (tileset.tileHeight !== value) {
					Palette.setTileSize(tileset.tileWidth, value);
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
		Scene.requestRendering();
	};

	FileTileset.paramInput = function (event) {
		FileTileset.update(FileTileset.target, Inspector.getKey(this), read(this));
	};

	Inspector.fileTileset = FileTileset;
}
