/* oxlint-disable eslint/no-restricted-properties */
import { Palette } from './palette.ts';
import { $ } from '@app/utils/dom';
import { addScrollbars, hide, on } from '@app/utils/element-utils.ts';
import { Timer } from '@app/utils/timer';
import { h, render } from 'vue';
import { getPaletteStore } from '@app/stores/palette';
import { AutoTile } from './auto-tile.ts';
import { FrameGenerator } from './tile-frame-generator.ts';
import { TileFrame } from './tile-frame-index.ts';
import { useTileNodeWindow } from '@app/composables/useTileNodeWindow';

Palette.initialize = function (this: typeof Palette) {
	if (!$('#palette-frame')) return;
	this.page = $('#fileTileset');
	this.head = $('#palette-head');
	this.body = $('#palette-body');
	this.window = hide($('#palette-frame'));
	this.canvas = $('#palette-canvas');
	this.screen = $('#palette-screen');
	this.marquee = $('#palette-marquee');
	this.itemScroll = $('#palette-scroll');
	this.itemPriority = $('#palette-priority');
	this.itemTag = $('#palette-tag');
	this.itemTerrain = $('#palette-terrain');
	this.itemEdit = $('#palette-edit');
	this.zoomSlider = $('#palette-zoom');
	addScrollbars(this.screen);

	this.context = this.canvas.getContext('2d', { desynchronized: true });

	this.images = {} as Record<string, HTMLImageElement | symbol | null>;

	this.zoomTimer = new Timer({
		duration: 80,
		update: (timer: Timer) => {
			if (getPaletteStore().state === 'open') {
				const { elapsed, duration, start, end } = timer;
				const time = elapsed / duration;
				this.scale = start * (1 - time) + end * time;
				this.resize();
				this.requestRendering();
			} else {
				this.scale = timer.end;
				return false;
			}
		}
	});

	const marquee = this.marquee;
	const createSelection = (id: string) => {
		const host = document.createElement('div');
		render(h('selection', { id }), host);
		const element = host.firstElementChild as HTMLElement & { x: number; y: number };
		host.removeChild(element);
		return element;
	};
	const source = createSelection('source-selection');
	const destination = createSelection('destination-selection');
	const selections: Record<'source' | 'destination', HTMLElement & { x: number; y: number }> = {
		source,
		destination
	};

	marquee.customSelect = function (
		this: HTMLElement & { scaleX: number; scaleY: number },
		key: 'source' | 'destination',
		x: number,
		y: number
	) {
		const selection = selections[key];
		const scaleX = this.scaleX;
		const scaleY = this.scaleY;
		const realX = x * scaleX;
		const realY = y * scaleY;
		const realWidth = scaleX;
		const realHeight = scaleY;
		selection.x = x;
		selection.y = y;
		if (selection === destination && source.x === x && source.y === y) {
			return selection.remove();
		}
		if (!selection.parentNode) {
			this.appendChild(selection);
		}
		selection.style.left = `${realX}px`;
		selection.style.top = `${realY}px`;
		selection.style.width = `${realWidth}px`;
		selection.style.height = `${realHeight}px`;
	};

	// 选框区域自定义方法 - 取消选择
	marquee.customUnselect = function (this: HTMLElement, key: 'source' | 'destination') {
		selections[key].remove();
	};

	marquee.customShiftAutoTile = function (this: HTMLElement) {
		source.remove();
		destination.remove();
		const { x: sx, y: sy } = source;
		const { x: dx, y: dy } = destination;
		if (sx !== dx || sy !== dy) {
			const tileset = getPaletteStore().tileset;
			if (!tileset) return;
			const tiles = tileset.tiles;
			const priorities = tileset.priorities;
			const terrains = tileset.terrains;
			const ro = tileset.width;
			const si = sx + sy * ro;
			const di = dx + dy * ro;
			if (tiles[si]) {
				if (tiles[di]) {
					const tile = tiles[si];
					const priority = priorities[si];
					const terrain = terrains[si];
					tiles[si] = tiles[di];
					priorities[si] = priorities[di];
					terrains[si] = terrains[di];
					tiles[di] = tile;
					priorities[di] = priority;
					terrains[di] = terrain;
				} else {
					tiles[di] = tiles[si];
					priorities[di] = priorities[si];
					terrains[di] = terrains[si];
					tiles[si] = 0;
					priorities[si] = 0;
					terrains[si] = 0;
				}
			}
		}
	};

	window.addEventListener('themechange', this.themechange);
	on(this.page, 'resize', this.windowResize);
	on($('#fileTileset-general-detail'), 'toggle', this.windowResize);
	// keydown/wheel 经 Vue 模板转发（FileTilesetPage @keydown/@wheel）
	on(this.screen, 'userscroll', this.screenUserscroll);
	on(this.screen, 'blur', this.screenBlur);
	// marquee pointerdown/doubleclick 经 Vue 模板转发（FileTilesetPage @pointerdown/@doubleclick）；pointermove/pointerleave 仍由 switch 系列动态挂接

	AutoTile.initialize!();
	FrameGenerator.initialize!();
	TileFrame.initialize!();
	useTileNodeWindow().initialize();
};
