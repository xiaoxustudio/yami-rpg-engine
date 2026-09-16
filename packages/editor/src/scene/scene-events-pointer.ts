import { screenScrollData } from '@app/engine/screen-scroll-data';
import { Scene } from './scene-window.ts';
import type { DragEventItem, ScrollableScreen } from './scene-events.ts';
import { relate } from '@app/utils/element-utils';
import { addScrollListener, removeScrollListener } from '@app/utils/scroll-listener';
import { ctrl } from '@app/utils/event-accessors';
import { Data } from '@app/data/data-object.ts';
import { File } from '@app/file/file-system-core.ts';
import { Menu } from '@app/components/menu-list.ts';
import { Directory } from '@app/file/directory-object.ts';
import { FileItem } from '@app/services/file-system/file-item.ts';
import { Reference } from '@app/log/related-references.ts';
import { Palette } from '@app/palette/palette.ts';
import { Title } from '@app/title/title-bar.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { Cursor } from '@app/composables/usePointerObjectWindow';
import type { GlobalClipboardHost } from '@app/utils/clipboard';
import { GlobalClipboard } from '@app/utils/clipboard';
import type { MenuItem } from '@ui-kit';

Scene.marqueePointerdown = function (this: typeof Scene, event: DragEventItem) {
	if (this.dragging) {
		return;
	}
	switch (event.button) {
		case 0: {
			if (event.dragKey) {
				this.dragging = event;
				event.mode = 'scroll';
				event.scrollLeft = this.screen.scrollLeft;
				event.scrollTop = this.screen.scrollTop;
				this.marquee.clear();
				Cursor.open('cursor-grab');
				window.addEventListener('pointerup', this.pointerup);
				window.addEventListener('pointermove', this.pointermove);
				return;
			}
			const marquee = this.marquee;
			switch (this.layer) {
				case 'tilemap':
				case 'terrain': {
					const { x, y } = this.getTileCoords(event, true);
					const context = this.tilemap ?? this;
					const mx = x + marquee.offsetX;
					const my = y + marquee.offsetY;
					const mw = marquee.width;
					const mh = marquee.height;
					const sw = context.width;
					const sh = context.height;
					this.patternOriginX = mx;
					this.patternOriginY = my;
					this.beginMapRecord();
					switch (this.brush) {
						case 'eraser':
						case 'pencil':
							if (mx + mw > 0 && mx < sw && my + mh > 0 && my < sh) {
								this.dragging = event;
								event.mode = this.brush;
								event.pointerdownX = x;
								event.pointerdownY = y;
								window.addEventListener('pointerup', this.pointerup);
								window.addEventListener('pointermove', this.pointermove);
								marquee.selectInPencilMode(mx, my);
								this.edit(marquee.x, marquee.y, marquee.width, marquee.height);
							}
							break;
						case 'rect':
						case 'oval':
							if (mx + mw > 0 && mx < sw && my + mh > 0 && my < sh) {
								const width = 1;
								const height = 1;
								this.dragging = event;
								event.mode = this.brush;
								event.pointerdownX = x;
								event.pointerdownY = y;
								window.addEventListener('pointerup', this.pointerup);
								window.addEventListener('pointermove', this.pointermove);
								marquee.save();
								marquee.selectInRectMode(x, y, width, height);
								this.edit(marquee.x, marquee.y, marquee.width, marquee.height);
							}
							break;
						case 'fill':
							if (x >= 0 && x < sw && y >= 0 && y < sh) {
								marquee.selectInPencilMode(mx, my);
								this.edit(x, y);
								this.saveMapRecord();
							}
							break;
					}
					break;
				}
				case 'object': {
					const { x, y } = this.getTileCoords(event);
					let object;
					if (event.ctrlKey || event.metaKey) {
						switch (this.target?.class) {
							case 'tilemap':
							case 'actor':
							case 'region':
							case 'light':
							case 'animation':
							case 'particle':
							case 'parallax':
								object = this.target;
								break;
						}
					}
					if (object === undefined) {
						object = this.selectObject(x, y);
					}
					if (object) {
						this.dragging = event;
						event.mode = 'object-move';
						event.enabled = false;
						event.latest = event;
						event.startX = object.x;
						event.startY = object.y;
						event.pointerdownX = x;
						event.pointerdownY = y;
						window.addEventListener('pointerup', this.pointerup);
						window.addEventListener('pointermove', this.pointermove);
						addScrollListener(this.screen, 'both', this.scale / 2, false, () => {
							const screen = this.screen as ScrollableScreen;
							this.screen.beginScrolling();
							screenScrollData(screen).rawScrollLeft = screen.scrollLeft;
							screenScrollData(screen).rawScrollTop = screen.scrollTop;
							this.updateTransform();
							this.requestRendering!();
							screen.updateScrollbars();
							this.pointermove(event.latest);
						});
					}
					this.setTarget(object);
					break;
				}
			}
			break;
		}
		case 1:
		case 4:
			this.dragging = event;
			event.mode = 'scroll';
			event.scrollLeft = this.screen.scrollLeft;
			event.scrollTop = this.screen.scrollTop;
			this.marquee.clear();
			Cursor.open('cursor-grab');
			window.addEventListener('pointerup', this.pointerup);
			window.addEventListener('pointermove', this.pointermove);
			break;
		case 2: {
			const marquee = this.marquee;
			switch (this.layer) {
				case 'object':
					this.dragging = event;
					event.mode = 'ready-to-scroll';
					event.scrollLeft = this.screen.scrollLeft;
					event.scrollTop = this.screen.scrollTop;
					window.addEventListener('pointerup', this.pointerup);
					window.addEventListener('pointermove', this.pointermove);
					break;
				case 'tilemap': {
					const { x, y } = this.getTileCoords(event, true);
					const context = this.tilemap ?? this;
					const sw = context.width;
					const sh = context.height;
					if (x >= 0 && x < sw && y >= 0 && y < sh) {
						if (this.brush === 'eraser') {
							this.switchBrush('pencil');
						}
						this.dragging = event;
						event.mode = 'copy';
						event.pointerdownX = x;
						event.pointerdownY = y;
						window.addEventListener('pointerup', this.pointerup);
						window.addEventListener('pointermove', this.pointermove);
						marquee.selectInCopyMode(x, y, 1, 1);
					}
					break;
				}
				case 'terrain':
					this.switchTerrain();
					break;
			}
			break;
		}
		case 3:
			switch (this.layer) {
				case 'tilemap':
					Palette.flipTiles!();
					break;
			}
			break;
	}
}.bind(Scene);

Scene.marqueePointermove = function (this: typeof Scene, event: PointerEvent) {
	const marquee = this.marquee;
	if (!this.dragging) {
		marquee.pointerevent = event;
		switch (this.layer) {
			case 'tilemap':
			case 'terrain': {
				const { x, y } = this.getTileCoords(event, true);
				const context = this.tilemap ?? this;
				const mx = x + marquee.offsetX;
				const my = y + marquee.offsetY;
				const mw = marquee.width;
				const mh = marquee.height;
				const sw = context.width;
				const sh = context.height;
				if (mx + mw > 0 && mx < sw && my + mh > 0 && my < sh) {
					if (mx !== marquee.x || my !== marquee.y || !marquee.visible) {
						marquee.selectInPencilMode(mx, my);
					}
				} else {
					marquee.clear();
				}
				break;
			}
			case 'object':
				if (!this.target) {
					const { x, y } = this.getTileCoords(event, true);
					const sw = this.width;
					const sh = this.height;
					if (x >= 0 && x < sw && y >= 0 && y < sh) {
						if (x !== marquee.x || y !== marquee.y || !marquee.visible) {
							marquee.selectInObjectMode(x, y);
						}
					} else {
						marquee.clear();
					}
				}
				break;
		}
	}
}.bind(Scene);

Scene.marqueePointerleave = function (this: typeof Scene, _event: PointerEvent) {
	if (this.marquee.pointerevent !== null) {
		this.marquee.pointerevent = null;
		if (!this.dragging && !(this.layer === 'object' && this.target !== null)) {
			this.marquee.clear();
		}
	}
}.bind(Scene);

Scene.marqueeDoubleclick = function (this: typeof Scene, event: MouseEvent) {
	switch (this.layer) {
		case 'object':
			if (!this.target) return;
			switch (this.target.class) {
				case 'tilemap':
					this.screenBlur();
					this.openTilemap(this.target);
					break;
				default:
					this.screenBlur();
					this.revealTarget();
					break;
			}
			break;
		case 'tilemap': {
			const { x, y } = this.getTileCoords(event);
			const { width, height } = this.getGridContext();
			if (x < 0 || y < 0 || x >= width || y >= height) {
				this.screenBlur();
				this.closeTilemap();
			}
			break;
		}
	}
}.bind(Scene);

Scene.pointerup = function (this: typeof Scene, event: PointerEvent | undefined) {
	const { dragging } = this;
	if (dragging === null) {
		return;
	}
	if (event === undefined) {
		event = dragging;
	}
	if (dragging && relate(dragging, event)) {
		switch (dragging.mode) {
			case 'eraser':
			case 'pencil': {
				const marquee = this.marquee;
				if (marquee.pointerevent === null) {
					marquee.clear();
				}
				this.saveMapRecord();
				break;
			}
			case 'rect':
			case 'oval': {
				const marquee = this.marquee;
				if (marquee.pointerevent === null) {
					marquee.clear();
				}
				marquee.restore();
				if (marquee.pointerevent !== null) {
					const coords = this.getTileCoords(event, true);
					const x = coords.x + marquee.offsetX;
					const y = coords.y + marquee.offsetY;
					marquee.selectInPencilMode(x, y);
				}
				this.saveMapRecord();
				break;
			}
			case 'copy': {
				const marquee = this.marquee;
				const coords = this.getTileCoords(event, true);
				const context = this.tilemap ?? this;
				const x = Math.clamp(coords.x, 0, context.width - 1);
				const y = Math.clamp(coords.y, 0, context.height - 1);
				marquee.offsetX = marquee.x - x;
				marquee.offsetY = marquee.y - y;
				if (marquee.pointerevent !== null) {
					marquee.selectInPencilMode();
				} else {
					marquee.clear();
				}
				Palette.copyTilesFromScene!(marquee.x, marquee.y, marquee.width, marquee.height);
				break;
			}
			case 'object-move':
				this.screen.endScrolling();
				removeScrollListener(this.screen);
				break;
			case 'ready-to-scroll':
				if (event?.target === this.marquee) {
					const { x, y } = this.getTileCoords(event);
					const object = this.selectObject(x, y);
					this.setTarget(object);
					this.menuPopup(event);
				}
				break;
			case 'scroll':
				this.screen.endScrolling();
				Cursor.close('cursor-grab');
				break;
		}
		this.dragging = null;
		window.removeEventListener('pointerup', this.pointerup);
		window.removeEventListener('pointermove', this.pointermove);
	}
}.bind(Scene);

Scene.pointermove = function (this: typeof Scene, event: PointerEvent) {
	const { dragging, marquee } = this;
	if (dragging && relate(dragging, event)) {
		switch (dragging.mode) {
			case 'eraser':
			case 'pencil': {
				const mw = marquee.width;
				const mh = marquee.height;
				const ox = marquee.offsetX;
				const oy = marquee.offsetY;
				const coords = this.getTileCoords(event, true);
				const context = this.tilemap ?? this;
				const x = Math.clamp(coords.x, 1 - ox - mw, context.width - 1 - ox);
				const y = Math.clamp(coords.y, 1 - oy - mh, context.height - 1 - oy);
				const mx = x + ox;
				const my = y + oy;
				if (mx !== marquee.x || my !== marquee.y) {
					const gapX = Math.abs(mx - marquee.x);
					const gapY = Math.abs(my - marquee.y);

					if ((gapX > 1 && mw < 9) || (gapY > 1 && mh < 9)) {
						const length = Math.max(gapX, gapY);
						const actorOffsetX = (mx - marquee.x) / length;
						const actorOffsetY = (my - marquee.y) / length;
						for (let i = 1; i < length; i++) {
							const mx = marquee.x + Math.round(i * actorOffsetX);
							const my = marquee.y + Math.round(i * actorOffsetY);
							this.edit(mx, my, mw, mh);
						}
					}
					marquee.selectInPencilMode(mx, my);
					this.edit(mx, my, mw, mh);
				}
				break;
			}
			case 'rect':
			case 'oval': {
				const coords = this.getTileCoords(event, true);
				const mx = Math.min(coords.x, dragging.pointerdownX);
				const my = Math.min(coords.y, dragging.pointerdownY);
				const mw = Math.abs(coords.x - dragging.pointerdownX) + 1;
				const mh = Math.abs(coords.y - dragging.pointerdownY) + 1;
				if (
					mx !== marquee.x ||
					my !== marquee.y ||
					mw !== marquee.width ||
					mh !== marquee.height
				) {
					marquee.selectInRectMode(mx, my, mw, mh);
					this.edit(mx, my, mw, mh);
				}
				break;
			}
			case 'copy': {
				const coords = this.getTileCoords(event, true);
				const context = this.tilemap ?? this;
				const x = Math.clamp(coords.x, 0, context.width - 1);
				const y = Math.clamp(coords.y, 0, context.height - 1);
				const mx = Math.min(x, dragging.pointerdownX);
				const my = Math.min(y, dragging.pointerdownY);
				const mw = Math.abs(x - dragging.pointerdownX) + 1;
				const mh = Math.abs(y - dragging.pointerdownY) + 1;
				if (
					mx !== marquee.x ||
					my !== marquee.y ||
					mw !== marquee.width ||
					mh !== marquee.height
				) {
					this.marquee.selectInCopyMode(mx, my, mw, mh);
				}
				break;
			}
			case 'object-move': {
				if (!dragging.enabled) {
					const distX = event.clientX - dragging.clientX;
					const distY = event.clientY - dragging.clientY;
					if (
						Math.sqrt(distX ** 2 + distY ** 2) > 4 ||
						event.timeStamp - dragging.timeStamp >= 500
					) {
						dragging.enabled = true;
					} else {
						break;
					}
				}
				dragging.latest = event;
				const width = this.width;
				const height = this.height;
				const coords = this.getTileCoords(event);
				let x;
				let y;
				const divider = event.ctrlKey || event.metaKey ? 2 : 1;
				switch (this.target?.class) {
					case 'actor': {
						const actor = this.target;
						const size = actor.data?.size ?? 1;
						const radius = Math.max(size, 1) / 2;
						if (this.shiftKey) {
							x = dragging.startX - dragging.pointerdownX + coords.x;
							y = dragging.startY - dragging.pointerdownY + coords.y;
							x = Math.roundTo(Math.clamp(x, radius, width - radius), 4);
							y = Math.roundTo(Math.clamp(y, radius, height - radius), 4);
						} else {
							x =
								dragging.startX -
								Math.floor(dragging.pointerdownX * divider) / divider +
								Math.floor(coords.x * divider) / divider;
							y =
								dragging.startY -
								Math.floor(dragging.pointerdownY * divider) / divider +
								Math.floor(coords.y * divider) / divider;
							x = Math.clamp(x, radius, width - radius);
							y = Math.clamp(y, radius, height - radius);
						}
						this.shiftTarget(x, y);
						break;
					}
					case 'region': {
						const region = this.target;
						const rwh = region.width / 2;
						const rhh = region.height / 2;
						if (this.shiftKey) {
							x = dragging.startX - dragging.pointerdownX + coords.x;
							y = dragging.startY - dragging.pointerdownY + coords.y;
							x = Math.roundTo(Math.clamp(x, rwh, width - rwh), 4);
							y = Math.roundTo(Math.clamp(y, rhh, height - rhh), 4);
						} else {
							x =
								dragging.startX -
								Math.floor(dragging.pointerdownX * divider) / divider +
								Math.floor(coords.x * divider) / divider;
							y =
								dragging.startY -
								Math.floor(dragging.pointerdownY * divider) / divider +
								Math.floor(coords.y * divider) / divider;
							x = Math.clamp(x, rwh, width - rwh);
							y = Math.clamp(y, rhh, height - rhh);
						}
						this.shiftTarget(x, y);
						break;
					}
					case 'tilemap':
					case 'light':
					case 'animation':
					case 'particle':
					case 'parallax':
						if (this.shiftKey) {
							x = dragging.startX - dragging.pointerdownX + coords.x;
							y = dragging.startY - dragging.pointerdownY + coords.y;
							x = Math.roundTo(Math.clamp(x, 0, width), 4);
							y = Math.roundTo(Math.clamp(y, 0, height), 4);
						} else {
							x =
								dragging.startX -
								Math.floor(dragging.pointerdownX * divider) / divider +
								Math.floor(coords.x * divider) / divider;
							y =
								dragging.startY -
								Math.floor(dragging.pointerdownY * divider) / divider +
								Math.floor(coords.y * divider) / divider;
							x = Math.clamp(x, 0, width);
							y = Math.clamp(y, 0, height);
						}
						this.shiftTarget(x, y);
						break;
				}
				break;
			}
			case 'ready-to-scroll': {
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
		}
	}
}.bind(Scene);

Scene.menuPopup = function (this: typeof Scene, event: PointerEvent) {
	const { x, y } = this.getTileCoords(event, true);
	const isInScene = x >= 0 && x < this.width && y >= 0 && y < this.height;
	if (this.target || isInScene) {
		this.translationKeyup();
		const target = this.target;
		const selected = !!target;
		const pastable = (GlobalClipboard as unknown as GlobalClipboardHost).has(
			'yami.scene.object'
		);
		const get = (key: string) => t('menuScene.' + key);
		const menuItems: MenuItem[] = [
			{
				label: get('create'),
				enabled: isInScene,
				submenu: [
					{
						label: get('create.actor'),
						click: () => {
							this.create!('actor', x + 0.5, y + 0.5);
						}
					},
					{
						label: get('create.region'),
						click: () => {
							this.create!('region', x + 0.5, y + 0.5);
						}
					},
					{
						label: get('create.light'),
						click: () => {
							this.create!('light', x + 0.5, y + 0.5);
						}
					},
					{
						label: get('create.animation'),
						click: () => {
							this.create!('animation', x + 0.5, y + 0.5);
						}
					},
					{
						label: get('create.particle'),
						click: () => {
							this.create!('particle', x + 0.5, y + 0.5);
						}
					},
					{
						label: get('create.parallax'),
						click: () => {
							this.create!('parallax', x, y);
						}
					},
					{
						label: get('create.tilemap'),
						click: () => {
							this.create!('tilemap', x, y);
						}
					}
				]
			},
			{
				label: get('toggle'),
				accelerator: '/',
				enabled: selected,
				click: () => {
					this.toggle!();
				}
			},
			{
				type: 'separator'
			},
			{
				label: get('cut'),
				accelerator: ctrl('X'),
				enabled: selected,
				click: () => {
					this.copy!();
					this.delete();
				}
			},
			{
				label: get('copy'),
				accelerator: ctrl('C'),
				enabled: selected,
				click: () => {
					this.copy!();
				}
			},
			{
				label: get('paste'),
				accelerator: ctrl('V'),
				enabled: pastable,
				click: () => {
					this.paste!(x, y);
				}
			},
			{
				label: get('duplicate'),
				accelerator: ctrl('D'),
				enabled: selected,
				click: () => {
					this.duplicate!();
				}
			},
			{
				label: get('delete'),
				accelerator: 'Delete',
				enabled: selected,
				click: () => {
					this.delete();
				}
			},
			{
				label: get('copy-id'),
				enabled: selected,
				click: () => {
					void navigator.clipboard.writeText(target.presetId);
				}
			},
			{
				label: get('find-references'),
				enabled: selected,
				click: () => {
					Reference.openRelated!(target.presetId);
				}
			},
			{
				type: 'separator'
			}
		];
		switch (target?.class) {
			case 'actor':
			case 'animation': {
				const id = target.animationId ?? target.data?.animationId;
				const meta = Data.manifest.guidMap[id];
				menuItems.push({
					label: get('editAnimation'),
					enabled: !!meta,
					click: () => {
						const animFile = Directory.getFile!(meta.path);
						if (animFile) {
							Title.openTab!(animFile);
						}
					}
				});
				break;
			}
			case 'particle': {
				const id = target.particleId;
				const meta = Data.manifest.guidMap[id];
				menuItems.push({
					label: get('editParticle'),
					enabled: !!meta,
					click: () => {
						const particleFile = Directory.getFile!(meta.path);
						if (particleFile) {
							Title.openTab!(particleFile);
						}
					}
				});
				break;
			}
		}
		const file = Scene.getObjectFile!(target);
		if (file !== undefined) {
			menuItems.push({
				label: t('common.findInProject'),
				enabled: file instanceof FileItem,
				click: () => {
					Scene.openFileLocation!(target);
				}
			});
		}
		const { startPosition } = Data.config;
		if (
			startPosition.sceneId === this.meta.guid &&
			Math.floor(startPosition.x) === x &&
			Math.floor(startPosition.y) === y
		) {
			menuItems.push({
				label: get('resetStartPosition'),
				click: () => {
					startPosition.sceneId = '';
					startPosition.x = 0;
					startPosition.y = 0;
					this.requestRendering!();
					File.planToSave!(Data.manifest.project.config);
				}
			});
		} else {
			menuItems.push({
				label: get('setStartPosition'),
				click: () => {
					const { startPosition } = Data.config;
					startPosition.sceneId = this.meta.guid;
					startPosition.x = x + 0.5;
					startPosition.y = y + 0.5;
					this.requestRendering!();
					File.planToSave!(Data.manifest.project.config);
				}
			});
		}
		Menu.popup(
			{
				x: event.clientX,
				y: event.clientY
			},
			menuItems
		);
	}
};
