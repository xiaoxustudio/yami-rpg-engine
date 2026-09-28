import { relate, getRelativeCoords } from '@app/utils/element-utils';
import { paletteEls } from '@app/palette/element-registry';
import { Window } from '@app/tools/window-object.ts';
import { on, rect, css } from '@app/utils/element-utils.ts';

import { AutoTile } from './auto-tile.ts';
import { Palette } from './palette.ts';
import { Cursor } from '@app/composables/usePointerObjectWindow';
import type { YamiElement } from '@app/types/element-api';
import { clamp } from '@app/utils/math';

/** 选框元素（`YMMarqueeArea` 挂上的运行期 API）—— 与 `engine/sprite/sprite.ts` 的 `SpriteMarquee` 同形 */
interface TileFrameMarquee extends YamiElement {
	visible: boolean;
	x: number;
	y: number;
	width: number;
	height: number;
	scaleX: number;
	scaleY: number;
	select(x: number, y: number, width: number, height: number): void;
}

/** 信息文本元素：`marqueePointermove` 直接往它上面写 x/y */
type TileFrameInfoElement = YamiElement & { x: number; y: number };

/**
 * 拖拽期间的指针事件：`marqueePointerdown` 会在**同一个事件对象**上挂这几个字段，
 * `pointermove` / `pointerup` 随后读它（原先靠参数上的 `{ [k: string]: unknown }` 索引签名承接，
 * 这里改成显式可选字段 —— 读侧因此仍需 `!` 或判空，但字段名受检）。
 */
type TileFrameDragEvent = PointerEvent & {
	mode?: string;
	screen?: HTMLElement & { scrollLeft: number; scrollTop: number };
	scrollLeft?: number;
	scrollTop?: number;
};

/**
 * 帧索引窗口单例。
 *
 * 方法在**下面的对象字面量之后**逐个赋上实现（与本仓 `Data` 同一写法）：字面量里只放
 * 取元素的 getter 与三个可变字段，方法不进字面量（进的话要么写 `null` 占位、要么就得
 * 给每个读点补 `!`）。`satisfies Partial<…> as Partial<…> as …` 让「稍后装配」在类型上成立，
 * 读侧（`TileFrame.open` / `AutoTile.editFrame` 那一票）因此都不必补 `!`。
 *
 * 方法成员**不写 `this` 形参**：它们经 `window.addEventListener` / `on(...)` 直接当监听器用，
 * 而监听器位置的 `this` 是元素或 `window` —— 写死 `this: TileFrameShape` 会当场不可比。
 */
interface TileFrameShape {
	get window(): YamiElement;
	get screen(): YamiElement;
	get clip(): YamiElement;
	get mask(): YamiElement;
	get image(): YamiElement;
	get marquee(): TileFrameMarquee;
	get info(): TileFrameInfoElement;
	dragging: TileFrameDragEvent | null;
	hframes: number | null;
	vframes: number | null;
	initialize: () => void;
	open: () => void;
	selectTileFrame: () => void;
	scrollToSelection: () => void;
	getDevicePixelClientBoxSize: (element: HTMLElement) => { width: number; height: number };
	dprchange: (_event: Event) => void;
	windowClosed: (_event: Event) => void;
	keydown: (event: KeyboardEvent) => void;
	marqueePointerdown: (event: TileFrameDragEvent) => void;
	marqueePointermove: (event: PointerEvent) => void;
	marqueePointerleave: (_event: Event) => void;
	pointerup: (event: PointerEvent) => void;
	pointermove: (event: PointerEvent) => void;
}

export const TileFrame = {
	get window() {
		return paletteEls.get('autoTile-frameIndex') as YamiElement;
	},
	get screen() {
		return paletteEls.get('autoTile-frameIndex-screen') as YamiElement;
	},
	get clip() {
		return paletteEls.get('autoTile-frameIndex-image-clip') as YamiElement;
	},
	get mask() {
		return paletteEls.get('autoTile-frameIndex-mask') as YamiElement;
	},
	get image() {
		return paletteEls.get('autoTile-frameIndex-image') as YamiElement;
	},
	get marquee() {
		return paletteEls.get('autoTile-frameIndex-marquee') as TileFrameMarquee;
	},
	get info() {
		return paletteEls.get('autoTile-frameIndex-info') as TileFrameInfoElement;
	},
	dragging: null,
	hframes: null,
	vframes: null
} satisfies Partial<TileFrameShape> as Partial<TileFrameShape> as TileFrameShape;

TileFrame.initialize = function (this: typeof TileFrame) {
	if (!this.window) return;
	window.addEventListener('dprchange', this.dprchange);
	on(this.window, 'closed', this.windowClosed);
	on(this.marquee, 'pointerdown', this.marqueePointerdown);
	on(this.marquee, 'pointermove', this.marqueePointermove);
	on(this.marquee, 'pointerleave', this.marqueePointerleave);
};

TileFrame.open = function (this: typeof TileFrame) {
	const MAX_CONTENT_WIDTH = 1180;
	const MAX_CONTENT_HEIGHT = 696;
	const MIN_CONTENT_WIDTH = 100;
	const MIN_CONTENT_HEIGHT = 100;
	const sprite = AutoTile.image;
	// `AutoTile.image` 有三种状态：`null`（未打开）/ `symbol`（载图中，见 `auto-tile-engine.ts` 的
	// `noImage` 哨兵）/ `HTMLImageElement`（已载入）。本窗口要 `.naturalWidth`/`.src` ⇒ 必须是后者。
	// `AutoTile.editFrame` **已经**按同一条判定（`instanceof Image`）决定要不要打开本窗口，
	// 所以这里的守卫是那条前提的落地（不是新行为路径）。
	if (!(sprite instanceof Image)) return;
	const windowFrame = this.window;
	const screen = this.screen;
	const clip = this.clip;
	const mask = this.mask;
	const image = this.image;
	const marquee = this.marquee;
	const tileWidth = Palette.tileset!.tileWidth;
	const tileHeight = Palette.tileset!.tileHeight;
	// `frames` / `offsetX` / `offsetY` / `frameIndex` 的可空只在「窗口未打开」时成立；
	// 能走到这里说明自动图块窗口正开着且有选中的模板/节点 ⇒ `!`（同 `AutoTile` 里那组不变式）。
	const frames = AutoTile.frames!;
	const offsetX = AutoTile.offsetX!;
	const offsetY = AutoTile.offsetY!;
	const index = frames[AutoTile.frameIndex!];
	const hindex = offsetX + (index & 0xff);
	const vindex = offsetY + (index >> 8);
	const hframes = Math.floor(sprite.naturalWidth / tileWidth);
	const vframes = Math.floor(sprite.naturalHeight / tileHeight);
	const dpr = window.devicePixelRatio;
	const innerWidth = tileWidth * clamp(hframes, 1, 256);
	const innerHeight = tileHeight * clamp(vframes, 1, 256);
	let contentWidth = innerWidth / dpr;
	let contentHeight = innerHeight / dpr;
	this.hframes = hframes;
	this.vframes = vframes;

	// 使用 overflow: auto 浏览器行为有时无法预测
	if (contentWidth > MAX_CONTENT_WIDTH) {
		contentHeight += 12;
		screen.style.overflowX = 'scroll';
	} else {
		screen.style.overflowX = 'hidden';
	}
	if (contentHeight > MAX_CONTENT_HEIGHT) {
		contentWidth += 12;
		screen.style.overflowY = 'scroll';
	} else {
		screen.style.overflowY = 'hidden';
	}

	contentWidth = clamp(contentWidth, MIN_CONTENT_WIDTH, MAX_CONTENT_WIDTH);
	contentHeight = clamp(contentHeight, MIN_CONTENT_HEIGHT, MAX_CONTENT_HEIGHT);
	windowFrame.style.width = `${contentWidth}px`;
	windowFrame.style.height = `${contentHeight + 28}px`;
	window.addEventListener('keydown', this.keydown);
	Window.open!('autoTile-frameIndex');

	const screenBox = this.getDevicePixelClientBoxSize(screen);
	const screenWidth = screenBox.width;
	const screenHeight = screenBox.height;
	const left = Math.max(((screenWidth - innerWidth) >> 1) / dpr, 0);
	const top = Math.max(((screenHeight - innerHeight) >> 1) / dpr, 0);
	clip.style.left = `${left}px`;
	clip.style.top = `${top}px`;
	clip.style.width = `${innerWidth / dpr}px`;
	clip.style.height = `${innerHeight / dpr}px`;

	const offsetWidth = offsetX * tileWidth;
	const offsetHeight = offsetY * tileHeight;
	mask.style.borderLeftWidth = `${offsetWidth / dpr}px`;
	mask.style.borderTopWidth = `${offsetHeight / dpr}px`;

	image.src = sprite.src;
	image.style.width = `${sprite.naturalWidth / dpr}px`;
	image.style.height = `${sprite.naturalHeight / dpr}px`;

	marquee.style.left = `${left}px`;
	marquee.style.top = `${top}px`;
	marquee.style.width = `${innerWidth / dpr}px`;
	marquee.style.height = `${innerHeight / dpr}px`;
	marquee.scaleX = tileWidth / dpr;
	marquee.scaleY = tileHeight / dpr;
	marquee.select(hindex, vindex, 1, 1);

	const x = (hindex + 0.5) * tileWidth;
	const y = (vindex + 0.5) * tileHeight;
	screen.scrollLeft = Math.round(x - screenWidth / 2) / dpr;
	screen.scrollTop = Math.round(y - screenHeight / 2) / dpr;
};

TileFrame.selectTileFrame = function (this: typeof TileFrame) {
	let { x, y } = this.marquee;
	// 同上：这是帧索引窗口的框选回调，窗口开着就说明自动图块那一侧的值都在。
	x -= AutoTile.offsetX!;
	y -= AutoTile.offsetY!;
	if (x >= 0 && y >= 0) {
		const frames = AutoTile.frames!;
		const frameIndex = AutoTile.frameIndex!;
		frames[frameIndex] = Math.min(x | (y << 8), 0xffff);
		AutoTile.changed = true;
		AutoTile.updateFrameItem();
		Window.close!('autoTile-frameIndex');
	}
};

TileFrame.scrollToSelection = function (this: typeof TileFrame) {
	const marquee = this.marquee;
	if (marquee.visible) {
		const screen = this.screen;
		const tw = marquee.scaleX;
		const th = marquee.scaleY;
		const ml = marquee.x * tw;
		const mt = marquee.y * th;
		const mr = ml + tw;
		const mb = mt + th;
		const cw = screen.clientWidth;
		const ch = screen.clientHeight;
		const sl = screen.scrollLeft;
		const st = screen.scrollTop;
		const x = Math.min(Math.max(sl, mr - cw), ml);
		const y = Math.min(Math.max(st, mb - ch), mt);
		if (sl !== x || st !== y) {
			screen.scroll(x, y);
		}
	}
};

TileFrame.getDevicePixelClientBoxSize = function (this: typeof TileFrame, element: HTMLElement) {
	const elementRect = rect(element);
	const elementCss = css(element);
	if (elementCss.overflowX === 'scroll') {
		Object.defineProperty(elementRect, 'bottom', {
			value: elementRect.bottom - 12
		});
	}
	if (elementCss.overflowY === 'scroll') {
		Object.defineProperty(elementRect, 'right', {
			value: elementRect.right - 12
		});
	}
	const dpr = window.devicePixelRatio;
	const left = Math.round(elementRect.left * dpr + 1e-5);
	const right = Math.round(elementRect.right * dpr + 1e-5);
	const top = Math.round(elementRect.top * dpr + 1e-5);
	const bottom = Math.round(elementRect.bottom * dpr + 1e-5);
	const width = right - left;
	const height = bottom - top;
	return { width, height };
};

TileFrame.dprchange = function (this: typeof TileFrame, _event: Event) {
	if (this.hframes !== null) {
		const marquee = this.marquee;
		const { x, y, width, height } = marquee;
		this.open();
		marquee.select(x, y, width, height);
	}
}.bind(TileFrame);

TileFrame.windowClosed = function (this: typeof TileFrame, _event: Event) {
	this.hframes = null;
	this.vframes = null;
	this.image.src = '';
	if (this.dragging) {
		this.pointerup(this.dragging);
	}
	window.removeEventListener('keydown', this.keydown);
}.bind(TileFrame);

TileFrame.keydown = function (this: typeof TileFrame, event: KeyboardEvent) {
	event.preventDefault();
	if (this.dragging) {
		return;
	}
	switch (event.code) {
		case 'Enter':
		case 'NumpadEnter':
			this.selectTileFrame();
			break;
		case 'ArrowLeft':
		case 'ArrowUp':
		case 'ArrowRight':
		case 'ArrowDown': {
			let offsetX = 0;
			let offsetY = 0;
			switch (event.code) {
				case 'ArrowLeft':
					offsetX = -1;
					break;
				case 'ArrowUp':
					offsetY = -1;
					break;
				case 'ArrowRight':
					offsetX = +1;
					break;
				case 'ArrowDown':
					offsetY = +1;
					break;
			}
			const marquee = this.marquee;
			// `hframes` / `vframes` 由 `open()` 填、`windowClosed` 置空；而本监听器正是 `open()` 里注册的
			// ⇒ 走到这里必然非空（`!` 只写类型，运行期取值与原先逐字相同）。
			const x = clamp(marquee.x + offsetX, 0, this.hframes! - 1);
			const y = clamp(marquee.y + offsetY, 0, this.vframes! - 1);
			if (marquee.x !== x || marquee.y !== y) {
				marquee.select(x, y, 1, 1);
				this.scrollToSelection();
			}
			break;
		}
	}
}.bind(TileFrame);

TileFrame.marqueePointerdown = function (this: typeof TileFrame, event: TileFrameDragEvent) {
	if (this.dragging) {
		return;
	}
	switch (event.button) {
		case 0: {
			if (event.altKey) {
				this.dragging = event;
				event.mode = 'scroll';
				const screen = (event.target as HTMLElement).parentNode as HTMLElement & {
					scrollLeft: number;
					scrollTop: number;
				};
				// `event` 的声明里已有 `{ [k: string]: unknown }` 索引签名 ⇒ 直接写扩展字段即可，
				// 不需要「断言成另一个形状」。写入的仍是同一个 `[[Set]]`，语义不变。
				event.screen = screen;
				event.scrollLeft = screen.scrollLeft;
				event.scrollTop = screen.scrollTop;
				Cursor.open('cursor-grab');
				window.addEventListener('pointerup', this.pointerup);
				window.addEventListener('pointermove', this.pointermove);
				return;
			}
			const marquee = this.marquee;
			const coords = getRelativeCoords(event, marquee);
			const x = Math.floor(coords.x / marquee.scaleX);
			const y = Math.floor(coords.y / marquee.scaleY);
			marquee.select(x, y, 1, 1);
			this.dragging = event;
			event.mode = 'select';
			window.addEventListener('pointerup', this.pointerup);
			break;
		}
		case 2:
			this.dragging = event;
			event.mode = 'scroll';
			const screen = (event.target as HTMLElement).parentNode as HTMLElement & {
				scrollLeft: number;
				scrollTop: number;
			};
			// 同上：索引签名直接承接扩展字段
			event.screen = screen;
			event.scrollLeft = screen.scrollLeft;
			event.scrollTop = screen.scrollTop;
			Cursor.open('cursor-grab');
			window.addEventListener('pointerup', this.pointerup);
			window.addEventListener('pointermove', this.pointermove);
			break;
	}
}.bind(TileFrame);

TileFrame.marqueePointermove = function (this: typeof TileFrame, event: PointerEvent) {
	const info = this.info;
	const marquee = this.marquee;
	const coords = getRelativeCoords(event, marquee);
	const x = Math.floor(coords.x / marquee.scaleX);
	const y = Math.floor(coords.y / marquee.scaleY);
	if (info.x !== x || info.y !== y) {
		info.x = x;
		info.y = y;
		info.textContent = `${x},${y}`;
	}
}.bind(TileFrame);

TileFrame.marqueePointerleave = function (this: typeof TileFrame, _event: Event) {
	const info = this.info;
	info.x = -1;
	info.y = -1;
	info.textContent = '';
}.bind(TileFrame);

TileFrame.pointerup = function (this: typeof TileFrame, event: PointerEvent) {
	const { dragging } = this;
	if (dragging && relate(dragging, event)) {
		switch (dragging.mode) {
			case 'select': {
				const marquee = this.marquee;
				if (event.target === marquee) {
					const coords = getRelativeCoords(event, marquee);
					const x = Math.floor(coords.x / marquee.scaleX);
					const y = Math.floor(coords.y / marquee.scaleY);
					if (marquee.x === x && marquee.y === y) {
						this.selectTileFrame();
					}
				}
				break;
			}
			case 'scroll':
				Cursor.close('cursor-grab');
				break;
		}
		this.dragging = null;
		window.removeEventListener('pointerup', this.pointerup);
		window.removeEventListener('pointermove', this.pointermove);
	}
}.bind(TileFrame);

TileFrame.pointermove = function (this: typeof TileFrame, event: PointerEvent) {
	const { dragging } = this;
	if (dragging && relate(dragging, event)) {
		switch (dragging.mode) {
			case 'scroll':
				// 这两个字段由 `marqueePointerdown` 在同一个事件对象上写下（`!` 写明这条不变式）
				dragging.screen!.scrollLeft =
					dragging.scrollLeft! + dragging.clientX - event.clientX;
				dragging.screen!.scrollTop = dragging.scrollTop! + dragging.clientY - event.clientY;
				break;
		}
	}
}.bind(TileFrame);
