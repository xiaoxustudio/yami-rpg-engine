import { $, getElementWriter } from '@/util/dom.ts';
import { addClass, disable, enable, read, removeClass } from '@/util/element-utils';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from './inspector.ts';
import { Palette } from '@/palette/palette.ts';
import { Scene } from '@/scene/scene-window.ts';

{
	const FileTileset = {
		target: null as any,
		meta: null as any,
		initialize: null as any,
		create: null as any,
		open: null as any,
		close: null as any,
		update: null as any,
		paramInput: null as any
	};

	FileTileset.initialize = function (this: any) {
		if (!$('#fileTileset-image')) return;
		// 6 控件 input + width/height change 经 Vue 模板转发（FileTilesetPage.vue @input/@change → FileTileset.*）

		Palette.initialize!();
	};

	FileTileset.create = function (this: any, type: any) {
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

	FileTileset.open = function (this: any, tileset: any, meta: any) {
		if (this.meta !== meta) {
			this.target = tileset;
			this.meta = meta;
			Palette.open!(meta);

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

	FileTileset.close = function (this: any) {
		if (this.target) {
			removeClass(Inspector.manager, 'overflow-visible');
			(window as any).Browser?.unselect?.(this.meta);
			Palette.close!();
			this.target = null;
			this.meta = null;
		}
	};

	FileTileset.update = function (this: any, tileset: any, key: any, value: any) {
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

	FileTileset.paramInput = function (this: any, event: any) {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^fileTileset-').test(element.id)) break;
			element = element.parentElement;
		}
		FileTileset.update(FileTileset.target, Inspector.getKey!(element), read(element));
	};

	Inspector.fileTileset = FileTileset;
}
