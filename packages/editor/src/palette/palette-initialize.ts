import { Palette } from './palette.ts';
import type { PaletteCanvasElement, PaletteMarqueeExtensions } from './palette.ts';
import { registryElement } from '@app/utils/element-registry';
import { renderDetached } from '@app/utils/dom';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { paletteEls } from '@app/palette/element-registry';
import { addScrollbars, hide, on } from '@app/utils/element-utils.ts';
import { Timer } from '@app/utils/timer';
import { h } from 'vue';
import { getPaletteStore } from '@app/stores/palette';
import { AutoTile } from './auto-tile.ts';
import { FrameGenerator } from './tile-frame-generator.ts';
import { TileFrame } from './tile-frame-index.ts';
import { useTileNodeWindow } from '@app/composables/useTileNodeWindow';
import type { YamiElement } from '@app/types/element-api';

Palette.initialize = function (this: typeof Palette) {
	if (!paletteEls.get('palette-frame')) return;
	this.page = inspectorEls.get('fileTileset') as YamiElement;
	this.head = paletteEls.get('palette-head') as YamiElement;
	this.body = paletteEls.get('palette-body') as YamiElement;
	this.window = hide(paletteEls.get('palette-frame') as YamiElement);
	// 这块元素就是 `<canvas>`（`Palette.canvas` 上读的是 `.width` / `.height` / `.style` / `.getContext`）
	// —— 走具名注册表收窄（`YamiElement` 与 `HTMLCanvasElement` 互不可赋值，直接 `as` 会被 TS 拒绝）
	this.canvas = registryElement<PaletteCanvasElement>(paletteEls, 'palette-canvas')!;
	this.screen = paletteEls.get('palette-screen') as YamiElement;
	// `marquee` 是 `YMMarqueeArea.vue` 建的组件元素：通用面 + 本域扩展见
	// `PaletteMarqueeExtensions`（`palette.ts`）
	this.marquee = paletteEls.get('palette-marquee') as YamiElement & PaletteMarqueeExtensions;
	this.itemScroll = paletteEls.get('palette-scroll') as YamiElement;
	this.itemPriority = paletteEls.get('palette-priority') as YamiElement;
	this.itemTag = paletteEls.get('palette-tag') as YamiElement;
	this.itemTerrain = paletteEls.get('palette-terrain') as YamiElement;
	this.itemEdit = paletteEls.get('palette-edit') as YamiElement;
	this.zoomSlider = paletteEls.get('palette-zoom') as YamiElement;
	addScrollbars(this.screen);

	// `getContext` 的类型是 `| null`；这块画布只有 2D 这一种用途、后面全程按非空使用 ⇒ 用 `!` 说明前提
	this.context = this.canvas.getContext('2d', { desynchronized: true })!;

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
		// 离屏节点统一走 utils/dom 的 renderDetached（原先 document.createElement + render）
		const element = renderDetached(h('selection', { id })) as HTMLElement & {
			x: number;
			y: number;
		};
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
		// 两个调用形态：带坐标画框（3 参）与只标一侧（1 参，`palette-pointer.ts:451`）。
		// 缺省用 `NaN` 占位 —— 与原来那次 `undefined * scaleX` **逐字等价**（同为 NaN），
		// 所以这下只是把「调用点可以只给一侧」写进类型，运行期没有任何变化。
		x: number = NaN,
		y: number = NaN
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
	on(paletteEls.get('fileTileset-general-detail') as YamiElement, 'toggle', this.windowResize);
	// keydown/wheel 经 Vue 模板转发（FileTilesetPage @keydown/@wheel）
	on(this.screen, 'userscroll', this.screenUserscroll);
	on(this.screen, 'blur', this.screenBlur);
	// marquee pointerdown/doubleclick 经 Vue 模板转发（FileTilesetPage @pointerdown/@doubleclick）；pointermove/pointerleave 仍由 switch 系列动态挂接

	AutoTile.initialize!();
	FrameGenerator.initialize!();
	TileFrame.initialize!();
	useTileNodeWindow().initialize();
};
