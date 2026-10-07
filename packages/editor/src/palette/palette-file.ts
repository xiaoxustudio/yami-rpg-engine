import { Palette } from './palette.ts';
import type { EditorProjectShape } from '@app/stores/editor';
import type { FileMeta } from '@app/data/metadata-manifest.ts';
import { clear, hide } from '@app/utils/element-utils.ts';
import { Window } from '@app/tools/window-object.ts';
import { Data } from '@app/data/data-object.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { getPaletteStore } from '@app/stores/palette';

Palette.open = function (this: typeof Palette, meta: FileMeta | null) {
	if (!meta || meta === this.meta) {
		return;
	}
	this.close();
	const data = Data.tilesets[meta.guid];
	if (data) {
		getPaletteStore().state = 'loading';
		this.meta = meta;
		getPaletteStore().tileset = data;
		void this.loadImages();
		if (getPaletteStore().mode === 'edit' && data.type === 'normal') {
			this.switchEdit();
		}
	} else {
		Inspector.close('tileset');
		Window.confirm!(
			{
				message: `Failed to read file: ${meta.path}`
			},
			[
				{
					label: 'Confirm'
				}
			]
		);
	}
};

Palette.close = function (this: typeof Palette) {
	if (getPaletteStore().state !== 'closed') {
		getPaletteStore().state = 'closed';
		this.symbol = null;
		this.meta = null;
		getPaletteStore().tileset = null;
		hide(this.window);
		clear(this.marquee);
		this.stopRendering();
	}
};

Palette.suspend = function (this: typeof Palette) {
	if (getPaletteStore().state === 'open') {
		getPaletteStore().state = 'suspended';
		this.stopRendering();
	}
};

Palette.resume = function (this: typeof Palette) {
	if (getPaletteStore().state === 'suspended') {
		getPaletteStore().state = 'open';
		this.resize();
		this.requestRendering();
	}
};

Palette.saveToProject = function (this: typeof Palette, project: EditorProjectShape) {
	const { palette } = project;
	const zoom = getPaletteStore().zoom;
	if (zoom !== null) {
		palette!.zoom = zoom;
	}
};

Palette.loadFromProject = function (this: typeof Palette, project: EditorProjectShape) {
	const { palette } = project;
	this.setZoom(palette!.zoom!);
};
