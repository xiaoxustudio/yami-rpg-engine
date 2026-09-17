import { Palette } from './palette.ts';
import { relate, removeClass } from '@app/utils/element-utils';
import { addScrollListener, removeScrollListener } from '@app/utils/scroll-listener';
import { File } from '@app/file/file-system-core.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { Cursor } from '@app/composables/usePointerObjectWindow';
import { Menu } from '@app/components/menu-list.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { GlobalClipboard } from '@app/utils/clipboard';
import { getPaletteStore } from '@app/stores/palette';
import { isDragKey } from '@app/utils/event-accessors';

Palette.marqueePointerdown = function (
	this: typeof Palette,
	event: PointerEvent & {
		dragKey?: boolean;
		mode?: string;
		scrollLeft?: number;
		scrollTop?: number;
		active?: boolean;
		startX?: number;
		startY?: number;
		startIndex?: number;
		priorities?: number[];
		tags?: number[];
		tiles?: number[];
	}
) {
	if (this.dragging) {
		return;
	}
	const { x, y } = this.getTileCoords(event, true);
	switch (event.button) {
		case 0: {
			// 濡傛灉姝ｅ湪淇敼鍥惧潡缁勫楂橈紝璁╁畠绔嬪嵆鐢熸晥
			(document.activeElement as HTMLElement | null)?.blur();
			if (isDragKey(event)) {
				this.dragging = event;
				event.mode = 'scroll';
				event.scrollLeft = this.screen.scrollLeft;
				event.scrollTop = this.screen.scrollTop;
				Cursor.open('cursor-grab');
				window.addEventListener('pointerup', this.pointerup);
				window.addEventListener('pointermove', this.pointermove);
				return;
			}
			if (event.ctrlKey || event.metaKey) {
				const tileset = getPaletteStore().tileset;
				if (tileset.type === 'auto') {
					const i = x + y * tileset.width;
					this.dragging = event;
					event.mode = 'edit';
					event.active = true;
					event.startX = x;
					event.startY = y;
					event.startIndex = i;
					this.marqueePointerleave();
					this.marquee.customSelect('source', x, y);
					window.addEventListener('pointerup', this.pointerup);
					window.addEventListener('pointermove', this.pointermove);
					return;
				}
			}
			const { marquee } = this;
			switch (getPaletteStore().mode) {
				case 'normal':
					if (event.shiftKey && marquee.visible) {
						const ox = marquee.originX;
						const oy = marquee.originY;
						const mx = Math.min(x, ox);
						const my = Math.min(y, oy);
						const mw = Math.abs(x - ox) + 1;
						const mh = Math.abs(y - oy) + 1;
						marquee.select(mx, my, mw, mh);
					} else {
						marquee.select(x, y, 1, 1);
						marquee.originX = x;
						marquee.originY = y;
					}
					if (this.explicit) {
						this.explicit = false;
						removeClass(marquee, 'explicit');
					}
					this.dragging = event;
					event.mode = 'select';
					window.addEventListener('pointerup', this.pointerup);
					window.addEventListener('pointermove', this.pointermove);
					addScrollListener(this.screen, 'both', this.scaleX / 4, false, () => {
						this.screen.beginScrolling();
						this.updateTransform();
						this.requestRendering();
						this.screen.updateScrollbars();
						this.pointermove((event as unknown as { latest: never }).latest);
					});
					Scene.marquee.style.pointerEvents = 'none';
					break;
				case 'priority': {
					const tileset = getPaletteStore().tileset;
					const i = x + y * tileset.width;
					this.dragging = event;
					event.mode = 'increase-priority';
					event.active = true;
					event.priorities = tileset.priorities;
					event.startX = x;
					event.startY = y;
					event.startIndex = i;
					this.requestRendering();
					window.addEventListener('pointerup', this.pointerup);
					window.addEventListener('pointermove', this.pointermove);
					break;
				}
				case 'tag': {
					const tileset = getPaletteStore().tileset;
					const i = x + y * tileset.width;
					this.dragging = event;
					event.mode = 'increase-tag';
					event.active = true;
					event.tags = tileset.tags;
					event.startX = x;
					event.startY = y;
					event.startIndex = i;
					this.requestRendering();
					window.addEventListener('pointerup', this.pointerup);
					window.addEventListener('pointermove', this.pointermove);
					break;
				}
				case 'terrain':
					this.setTerrain(x, y, -1);
					// window.addEventListener('pointerup', this.pointerup) window.addEventListener('pointermove', this.pointermove)
					break;
				case 'edit': {
					const tileset = getPaletteStore().tileset;
					const i = x + y * tileset.width;
					switch (tileset.type) {
						case 'normal':
							break;
						case 'auto': {
							const tiles = tileset.tiles;
							if (tiles[i] !== 0) {
								this.dragging = event;
								event.mode = 'ready-to-shift';
								event.active = true;
								event.tiles = tiles;
								event.startX = x;
								event.startY = y;
								event.startIndex = i;
								this.requestRendering();
								marquee.customSelect('source', x, y);
								window.addEventListener('pointerup', this.pointerup);
								window.addEventListener('pointermove', this.pointermove);
							} else {
								event.preventDefault();
								this.editAutoTile(i);
							}
							break;
						}
					}
					break;
				}
			}
			break;
		}
		case 2:
			switch (getPaletteStore().mode) {
				case 'normal':
					this.dragging = event;
					event.mode = 'scroll';
					event.scrollLeft = this.screen.scrollLeft;
					event.scrollTop = this.screen.scrollTop;
					Cursor.open('cursor-grab');
					window.addEventListener('pointerup', this.pointerup);
					window.addEventListener('pointermove', this.pointermove);
					break;
				case 'priority': {
					const tileset = getPaletteStore().tileset;
					const i = x + y * tileset.width;
					this.dragging = event;
					event.mode = 'ready-to-decrease-priority';
					event.active = true;
					event.priorities = tileset.priorities;
					event.startX = x;
					event.startY = y;
					event.startIndex = i;
					event.scrollLeft = this.screen.scrollLeft;
					event.scrollTop = this.screen.scrollTop;
					this.requestRendering();
					window.addEventListener('pointerup', this.pointerup);
					window.addEventListener('pointermove', this.pointermove);
					break;
				}
				case 'tag': {
					const tileset = getPaletteStore().tileset;
					const i = x + y * tileset.width;
					this.dragging = event;
					event.mode = 'ready-to-decrease-tag';
					event.active = true;
					event.tags = tileset.tags;
					event.startX = x;
					event.startY = y;
					event.startIndex = i;
					event.scrollLeft = this.screen.scrollLeft;
					event.scrollTop = this.screen.scrollTop;
					this.requestRendering();
					window.addEventListener('pointerup', this.pointerup);
					window.addEventListener('pointermove', this.pointermove);
					break;
				}
				case 'terrain':
					this.dragging = event;
					event.mode = 'ready-to-increase-terrain';
					event.active = true;
					event.startX = x;
					event.startY = y;
					event.scrollLeft = this.screen.scrollLeft;
					event.scrollTop = this.screen.scrollTop;
					window.addEventListener('pointerup', this.pointerup);
					window.addEventListener('pointermove', this.pointermove);
					break;
				case 'edit':
					this.dragging = event;
					event.mode = 'ready-to-scroll';
					event.scrollLeft = this.screen.scrollLeft;
					event.scrollTop = this.screen.scrollTop;
					window.addEventListener('pointerup', this.pointerup);
					window.addEventListener('pointermove', this.pointermove);
					break;
			}
			break;
	}
}.bind(Palette);

Palette.marqueePointermove = function (this: typeof Palette, event: PointerEvent) {
	if (this.dragging === null) {
		const tileset = getPaletteStore().tileset;
		if (!tileset) return;
		const { x, y } = this.getTileCoords(event, true);
		const index = x + y * tileset.width;
		if (getPaletteStore().activeIndex !== index) {
			getPaletteStore().activeIndex = index;
			this.updateInfo(index);
			this.requestRendering();
		}
	}
}.bind(Palette);

Palette.marqueePointerleave = function (this: typeof Palette, _event: PointerEvent) {
	if (getPaletteStore().activeIndex !== null) {
		getPaletteStore().activeIndex = null;
		this.updateInfo(null);
		this.requestRendering();
	}
}.bind(Palette);

Palette.marqueeDoubleclick = function (this: typeof Palette, event: PointerEvent) {
	if (getPaletteStore().mode === 'tag') {
		const { x, y } = this.getTileCoords(event, true);
		this.editTagAt(x, y);
		return;
	}
	this.openSelection();
}.bind(Palette);

Palette.marqueePopup = function (this: typeof Palette, event: PointerEvent) {
	if (getPaletteStore().mode === 'edit' && getPaletteStore().tileset.type === 'auto') {
		const { x, y } = this.getTileCoords(event, true);
		const tiles = getPaletteStore().tileset.tiles;
		const index = x + y * getPaletteStore().tileset.width;
		const existing = !!tiles[index];
		const editable = true;
		const copyable = existing;
		const pastable = GlobalClipboard.has('yami.tile');
		const deletable = existing;
		const get = (key: string) => t('menuTileset.' + key);
		Menu.popup(
			{
				x: event.clientX,
				y: event.clientY,
				minWidth: 0
			},
			[
				{
					label: get('edit'),
					enabled: editable,
					click: () => {
						this.editAutoTile(index);
					}
				},
				{
					label: get('cut'),
					enabled: copyable,
					click: () => {
						this.copyAutoTile(index);
						this.deleteAutoTile(index);
					}
				},
				{
					label: get('copy'),
					enabled: copyable,
					click: () => {
						this.copyAutoTile(index);
					}
				},
				{
					label: get('paste'),
					enabled: pastable,
					click: () => {
						this.pasteAutoTile(index);
					}
				},
				{
					label: get('delete'),
					enabled: deletable,
					click: () => {
						this.deleteAutoTile(index);
					}
				}
			]
		);
	}
};

Palette.pointerup = function (this: typeof Palette, event: PointerEvent) {
	const { dragging } = this;
	if (dragging && relate(dragging, event)) {
		// 打开窗口时触发的blur事件会导致再次执行pointerup 因此提前重置dragging来避免重复执行
		this.dragging = null;
		try {
			switch (dragging.mode) {
				case 'select': {
					const { x, y, width, height } = this.marquee;
					this.selectTiles(x, y, width, height);
					this.screen.endScrolling();
					removeScrollListener(this.screen);
					Scene.marquee.style.pointerEvents = 'inherit';
					break;
				}
				case 'ready-to-scroll':
					if (event.target === this.marquee) {
						this.marqueePopup(event);
					}
					break;
				case 'scroll':
					this.screen.endScrolling();
					Cursor.close('cursor-grab');
					break;
				case 'edit':
					if (dragging.active) {
						this.marquee.customUnselect('source');
						this.editAutoTile(dragging.startIndex);
					}
					break;
				case 'increase-priority':
				case 'ready-to-decrease-priority':
					if (dragging.active) {
						const { priorities } = dragging;
						const i = dragging.startIndex;
						const step = event.button === 0 ? 1 : 9;
						priorities[i] = (priorities[i] + step) % 10;
						this.requestRendering();
						Scene.requestRendering!();
						File.planToSave!(this.meta);
					}
					break;
				case 'increase-tag':
				case 'ready-to-decrease-tag':
					break;
				case 'ready-to-increase-terrain':
					this.setTerrain(dragging.startX, dragging.startY, 1);
					break;
				case 'ready-to-shift':
					this.marquee.customUnselect('source');
					this.editAutoTile(dragging.startIndex);
					break;
				case 'shift':
					this.marquee.customShiftAutoTile();
					this.screen.endScrolling();
					removeScrollListener(this.screen);
					this.requestRendering();
					Scene.requestRendering!();
					Scene.marquee.style.pointerEvents = 'inherit';
					File.planToSave!(this.meta);
					break;
			}
		} finally {
			// 无论拖拽处理是否抛错都必须移除全局监听，否则残留监听会在后续任意点击中再次触发
			window.removeEventListener('pointerup', this.pointerup);
			window.removeEventListener('pointermove', this.pointermove);
		}
	}
}.bind(Palette);

Palette.pointermove = function (this: typeof Palette, event: PointerEvent) {
	const { dragging } = this;
	if (dragging && relate(dragging, event)) {
		switch (dragging.mode) {
			case 'select': {
				dragging.latest = event;
				const marquee = this.marquee;
				const coords = this.getTileCoords(event, true);
				const x = Math.min(coords.x, marquee.originX);
				const y = Math.min(coords.y, marquee.originY);
				const width = Math.abs(coords.x - marquee.originX) + 1;
				const height = Math.abs(coords.y - marquee.originY) + 1;
				if (
					marquee.x !== x ||
					marquee.y !== y ||
					marquee.width !== width ||
					marquee.height !== height
				) {
					marquee.select(x, y, width, height);
				}
				break;
			}
			case 'ready-to-scroll':
			case 'ready-to-decrease-priority':
			case 'ready-to-decrease-tag':
			case 'ready-to-increase-terrain': {
				const distX = event.clientX - dragging.clientX;
				const distY = event.clientY - dragging.clientY;
				this.screen.setScroll(dragging.scrollLeft - distX, dragging.scrollTop - distY);
				if (Math.sqrt(distX ** 2 + distY ** 2) > 4) {
					dragging.mode = 'scroll';
					Cursor.open('cursor-grab');
				}
				break;
			}
			case 'scroll': {
				const distX = event.clientX - dragging.clientX;
				const distY = event.clientY - dragging.clientY;
				this.screen.beginScrolling();
				this.screen.setScroll(dragging.scrollLeft - distX, dragging.scrollTop - distY);
				break;
			}
			case 'edit': {
				const sx = dragging.startX;
				const sy = dragging.startY;
				const { x, y } = this.getTileCoords(event);
				const active = sx === x && sy === y;
				if (dragging.active !== active) {
					dragging.active = active;
					if (active) this.marquee.customSelect('source');
					else this.marquee.customUnselect('source');
				}
				break;
			}
			case 'increase-priority':
			case 'increase-tag': {
				const sx = dragging.startX;
				const sy = dragging.startY;
				const { x, y } = this.getTileCoords(event);
				const active = sx === x && sy === y;
				if (dragging.active !== active) {
					dragging.active = active;
					this.requestRendering();
				}
				break;
			}
			case 'ready-to-shift': {
				const distX = event.clientX - dragging.clientX;
				const distY = event.clientY - dragging.clientY;
				if (Math.sqrt(distX ** 2 + distY ** 2) > 4) {
					dragging.mode = 'shift';
					dragging.active = false;
					const x = dragging.startX;
					const y = dragging.startY;
					this.requestRendering();
					this.marquee.customSelect('destination', x, y);
					addScrollListener(this.screen, 'both', this.scaleX / 4, false, () => {
						this.screen.beginScrolling();
						this.updateTransform();
						this.requestRendering();
						this.screen.updateScrollbars();
						this.pointermove(dragging.latest);
					});
					Scene.marquee.style.pointerEvents = 'none';
				}
				break;
			}
			case 'shift': {
				dragging.latest = event;
				const { x, y } = this.getTileCoords(event, true);
				this.marquee.customSelect('destination', x, y);
				break;
			}
		}
	}
}.bind(Palette);
