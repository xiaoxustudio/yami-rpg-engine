import { Timer } from '@app/utils/timer';
import { Easing } from '@app/data/transition-window.ts';
import { addClass, read, removeClass, write } from '@app/utils/element-utils';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from './scene-window.ts';
import { TilemapShortcuts } from './tilemap-shortcut-list.ts';
import { radians } from '@app/utils/math';
Scene.setTarget = function (this: typeof Scene, target: { class: string } | null) {
	if (this.target !== target) {
		if (target !== null && this.tilemap !== null && this.tilemap !== target) {
			this.closeTilemap();
		}
		this.target = target;
		this.updateTargetInfo();
		this.updateTargetItem();
		this.requestRendering!();
		if (target) {
			const map = this.inspectorTypeMap;
			const key = map[target.class];
			Inspector.open!(key, target);
		} else {
			Inspector.close!();
		}
	}
};

Scene.openTilemap = function (this: typeof Scene, tilemap: unknown) {
	if (tilemap instanceof Object && this.tilemap !== tilemap) {
		this.closeTilemap(false);
		this.tilemap = tilemap;
		addClass(this.tilemap.element, 'highlight');
		if (this.tilemap.shortcut !== 0) {
			addClass(TilemapShortcuts.elements[this.tilemap.shortcut], 'selected');
		}
		this.switchLayer('tilemap');
		this.computeActiveTilemapId();
		this.requestRendering!();
		this.marquee.resize();
	}
};

Scene.closeTilemap = function (this: typeof Scene, back = true) {
	if (this.tilemap !== null) {
		removeClass(this.tilemap.element, 'highlight');
		if (this.tilemap.shortcut !== 0) {
			removeClass(TilemapShortcuts.elements[this.tilemap.shortcut], 'selected');
		}
		this.tilemap = null;
		if (back) {
			this.switchLayer('object');
			this.computeActiveTilemapId();
		}
	}
};

Scene.computeActiveTilemapId = function (this: typeof Scene) {
	const { tilemap } = this;
	switch (tilemap?.layer) {
		case 'background':
			this.activeTilemapId = this.backgrounds.indexOf(tilemap);
			break;
		case 'foreground':
			this.activeTilemapId = this.foregrounds.indexOf(tilemap) | 0x20000;
			break;
		case 'object':
			this.activeTilemapId = this.doodads.indexOf(tilemap) | 0x10000;
			break;
		default:
			this.activeTilemapId = -1;
			break;
	}
};

Scene.revealTarget = (function IIFE() {
	const timer = new Timer({
		duration: 200,
		update: (timer: Timer) => {
			const { target } = timer;
			if (target === Scene.target) {
				const easing = Easing.EasingMap.easeInOut;
				const time = easing.ease(timer.elapsed / timer.duration);
				const x = timer.startX * (1 - time) + timer.endX * time;
				const y = timer.startY * (1 - time) + timer.endY * time;
				const screen = Scene.screen;
				const sl = screen.scrollLeft;
				const st = screen.scrollTop;
				Scene.updateCamera!(x, y);
				Scene.updateTransform!();
				if (screen.scrollLeft !== sl || screen.scrollTop !== st) {
					Scene.requestRendering!();
					Scene.marquee.resize();
					Scene.screen.updateScrollbars();
				}
			} else {
				timer.target = null;
				return false;
			}
		},
		callback: (timer: Timer) => {
			timer.target = null;
		}
	});
	return function (this: typeof Scene) {
		const { target, meta } = this;
		const toleranceX = 1 / this.scaledTileWidth / this.scaleX;
		const toleranceY = 1 / this.scaledTileHeight / this.scaleY;
		// 目标和摄像机的位置不一定相等
		if (
			target &&
			!timer.target &&
			(Math.abs(target.x - meta.x) > toleranceX || Math.abs(target.y - meta.y) > toleranceY)
		) {
			timer.target = target;
			timer.startX = meta.x;
			timer.startY = meta.y;
			timer.endX = target.x;
			timer.endY = target.y;
			timer.elapsed = 0;
			timer.add();
		}
	};
})();

Scene.shiftTarget = function (this: typeof Scene, x: number, y: number) {
	const target = this.target;
	const map = this.inspectorTypeMap;
	const key = map[target?.class];
	const editor = Inspector[key];
	if (editor !== undefined && (target.x !== x || target.y !== y)) {
		this.planToSave!();
		const history = this.history;
		const index = history.index;
		const length = history.length;
		const record = history[index];
		const type = 'scene-target-shift';
		if (
			index !== length - 1 ||
			record === undefined ||
			record.type !== type ||
			record.target !== target
		) {
			history.save({
				type: type,
				editor: editor,
				target: target,
				x: target.x,
				y: target.y
			});
		}
		target.x = x;
		target.y = y;
		this.updateTargetInfo();
		this.updateTargetEditor();
		this.requestRendering!();
	}
};

Scene.redirectTarget = function (this: typeof Scene, angle: number) {
	const target = this.target;
	const map = this.inspectorTypeMap;
	const key = map[target?.class];
	const editor = Inspector[key];
	if (editor !== undefined && target.angle !== angle) {
		this.planToSave!();
		const history = this.history;
		const index = history.index;
		const length = history.length;
		const record = history[index];
		const type = 'scene-target-redirect';
		if (
			index !== length - 1 ||
			record === undefined ||
			record.type !== type ||
			record.target !== target
		) {
			history.save({
				type: type,
				editor: editor,
				target: target,
				angle: target.angle
			});
		}
		this.requestRendering!();
		target.angle = angle;
		target.player.setAngle(radians(angle));
		if (editor.target === target) {
			write(editor, { angle });
		}
	}
};

Scene.updateTarget = function (this: typeof Scene) {
	let item = read(this.list);
	if (item?.class === 'folder') {
		item = null;
	}
	if (item !== this.target) {
		this.setTarget(item);
	}
};

Scene.updateTargetInfo = function (this: typeof Scene) {
	if (this.layer === 'object') {
		switch (this.target?.class) {
			case 'tilemap':
			case 'actor':
			case 'region':
			case 'light':
			case 'animation':
			case 'particle':
			case 'parallax': {
				const target = this.target;
				const name = target.name;
				const x = Math.floor(target.x);
				const y = Math.floor(target.y);
				this.info.textContent = `${name} ${x},${y}`;
				break;
			}
			default: {
				const marquee = this.marquee;
				const event = marquee?.pointerevent;
				if (
					event instanceof PointerEvent &&
					typeof marquee.selectInObjectMode === 'function'
				) {
					const { x, y } = this.getTileCoords(event, true);
					const sw = this.width;
					const sh = this.height;
					if (x >= 0 && x < sw && y >= 0 && y < sh) {
						if (x !== marquee.x || y !== marquee.y || !marquee.visible) {
							marquee.selectInObjectMode(x, y);
						}
					} else if (typeof marquee.clear === 'function') {
						marquee.clear();
					}
				} else if (typeof marquee?.clear === 'function') {
					marquee.clear();
				}
				break;
			}
		}
	}
};

Scene.updateTargetItem = function (this: typeof Scene) {
	const { target } = this;
	if (target !== null) {
		const { list } = this;
		if (read(list) !== target) {
			list.selectWithNoEvent(target);
			if (target) {
				list.expandToSelection();
				list.scrollToSelection();
			}
		}
	}
};

Scene.updateTargetEditor = function (this: typeof Scene) {
	const target = this.target;
	const map = this.inspectorTypeMap;
	const key = map[target?.class];
	const editor = Inspector[key];
	if (editor !== undefined && editor.target === target) {
		write(editor, {
			x: target.x,
			y: target.y
		});
	}
};
