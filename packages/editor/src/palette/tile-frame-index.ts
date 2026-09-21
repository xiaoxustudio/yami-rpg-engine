import { relate, getRelativeCoords } from '@app/utils/element-utils';
import { paletteEls } from '@app/palette/element-registry';
import { Window } from '@app/tools/window-object.ts';
import { on, rect, css } from '@app/utils/element-utils.ts';

import { AutoTile } from './auto-tile.ts';
import { Palette } from './palette.ts';
import { Cursor } from '@app/composables/usePointerObjectWindow';
import type { YamiElement } from '@app/types/element-api';
import { clamp } from '@app/utils/math';

// oxlint-disable-next-line no-explicit-any
export const TileFrame: Record<string, any> = {
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
		return paletteEls.get('autoTile-frameIndex-marquee') as YamiElement;
	},
	get info() {
		return paletteEls.get('autoTile-frameIndex-info') as YamiElement;
	},
	dragging: null,
	hframes: null,
	vframes: null,
	initialize: null,
	open: null,
	selectTileFrame: null,
	scrollToSelection: null,
	getDevicePixelClientBoxSize: null,
	dprchange: null,
	windowClosed: null,
	keydown: null,
	marqueePointerdown: null,
	marqueePointermove: null,
	marqueePointerleave: null,
	pointerup: null,
	pointermove: null
};

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
	const windowFrame = this.window;
	const screen = this.screen;
	const clip = this.clip;
	const mask = this.mask;
	const image = this.image;
	const marquee = this.marquee;
	const tileWidth = Palette.tileset.tileWidth;
	const tileHeight = Palette.tileset.tileHeight;
	const frames = AutoTile.frames;
	const offsetX = AutoTile.offsetX;
	const offsetY = AutoTile.offsetY;
	const index = frames[AutoTile.frameIndex];
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
	x -= AutoTile.offsetX;
	y -= AutoTile.offsetY;
	if (x >= 0 && y >= 0) {
		const { frames, frameIndex } = AutoTile;
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
			const x = clamp(marquee.x + offsetX, 0, this.hframes - 1);
			const y = clamp(marquee.y + offsetY, 0, this.vframes - 1);
			if (marquee.x !== x || marquee.y !== y) {
				marquee.select(x, y, 1, 1);
				this.scrollToSelection();
			}
			break;
		}
	}
}.bind(TileFrame);

TileFrame.marqueePointerdown = function (
	this: typeof TileFrame,
	event: PointerEvent & { [k: string]: unknown }
) {
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
				dragging.screen.scrollLeft = dragging.scrollLeft + dragging.clientX - event.clientX;
				dragging.screen.scrollTop = dragging.scrollTop + dragging.clientY - event.clientY;
				break;
		}
	}
}.bind(TileFrame);
