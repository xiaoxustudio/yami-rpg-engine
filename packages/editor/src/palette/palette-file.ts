import { Palette } from './palette.ts';
import type { EditorProjectShape } from '@app/stores/editor';
import type { FileMeta } from '@app/data/metadata-manifest.ts';
import { clear, hide } from '@app/utils/element-utils.ts';
import { Window } from '@app/tools/window-object.ts';
import { Data } from '@app/data/data-object.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { getPaletteStore } from '@app/stores/palette';

Palette.open = function (
	this: typeof Palette,
	/**
	 * 图块组元数据。
	 *
	 * **口径收紧（2026-09-20，`any-hatches` 收口）**：此前是
	 * `{ guid: string; path?: string } & Record<string, any>` —— 末尾那个索引签名
	 * 让 `meta.` 后面接**任何**名字都能编译。
	 *
	 * 改成已有的具名类型 `FileMeta`（`data/metadata.ts` 的 `Meta` 类实例）：
	 * - 唯一调用方 `inspector/file-tileset-page.ts:73` 传的本来就是 `FileMeta | null`，
	 *   所以这是**把形参对齐到调用方已有的口径**；
	 * - 而且 `FileMeta` 连 `x` / `y`（`number | null`）都有 —— `palette-engine.ts`
	 *   正是往 `Palette.meta.x` / `.y` 写值，两边因此对上了。
	 */
	meta: FileMeta | null
) {
	if (!meta || meta === this.meta) {
		return;
	}
	this.close();
	const data = Data.tilesets[meta.guid];
	if (data) {
		getPaletteStore().state = 'loading';
		this.meta = meta;
		getPaletteStore().tileset = data;
		this.loadImages();
		// 如果在编辑模式中打开普通图块组，则关闭编辑模式
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
