import { screenScrollData } from '@app/engine/screen-scroll-data';
import { Palette } from './palette.ts';
import { addClass, hide, off, on, removeClass, show } from '@app/utils/element-utils.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { Timer } from '@app/utils/timer';
import { getPaletteStore } from '@app/stores/palette';
import { elementDataOf } from '@ui-kit';

/**
 * P4b：选框区域元素上的 `selection`（覆盖层）走显式元素数据。
 * 同一元素上的 `visible` / `x` / `y` / `scaleX`… 不是元素数据——它们由 `YMMarqueeArea.vue`
 * 用 `Object.defineProperty(el, …)` 定义成**组件自己的实例属性**（实例属性优先于原型访问器），
 * 换成元素数据会读到 `undefined`。
 */
interface PaletteMarqueeData {
	selection: HTMLElement | null;
}
const marqueeData = (el: unknown): PaletteMarqueeData => elementDataOf<PaletteMarqueeData>(el);

Palette.skipScrollEvent = (function IIFE() {
	const restore = () => {
		if (getPaletteStore().scrollable) {
			on(Palette.screen, 'scroll', Palette.screenUserscroll);
		}
	};
	const restoreDelay = () => {
		requestAnimationFrame(restore);
	};
	return () => {
		if (getPaletteStore().scrollable) {
			off(Palette.screen, 'scroll', Palette.screenUserscroll);
			// 在动画队列中调用此方法就不需要了
			if (window.event?.type === 'resize') requestAnimationFrame(restoreDelay);
			else requestAnimationFrame(restore);
		}
	};
})();

Palette.switchScroll = (function IIFE() {
	return function (this: typeof Palette, enabled = !getPaletteStore().scrollable) {
		if (enabled) {
			addClass(this.itemScroll, 'selected');
			addClass(this.screen, 'scrollable');
			on(this.screen, 'scroll', this.screenUserscroll);
			off(this.screen, 'userscroll', this.screenUserscroll);
		} else {
			removeClass(this.itemScroll, 'selected');
			removeClass(this.screen, 'scrollable');
			off(this.screen, 'scroll', this.screenUserscroll);
			on(this.screen, 'userscroll', this.screenUserscroll);
		}
		getPaletteStore().scrollable = enabled;
	};
})();

Palette.switchPriority = (function IIFE() {
	return function (this: typeof Palette, enabled = getPaletteStore().mode !== 'priority') {
		if (enabled) {
			addClass(this.itemPriority, 'selected');
			if (this.marquee.visible) hide(marqueeData(this.marquee).selection);
			off(this.marquee, 'doubleclick', this.marqueeDoubleclick);
			on(this.marquee, 'pointermove', this.marqueePointermove);
			on(this.marquee, 'pointerleave', this.marqueePointerleave);
		} else {
			removeClass(this.itemPriority, 'selected');
			if (this.marquee.visible) show(marqueeData(this.marquee).selection);
			off(this.marquee, 'pointermove', this.marqueePointermove);
			off(this.marquee, 'pointerleave', this.marqueePointerleave);
			on(this.marquee, 'doubleclick', this.marqueeDoubleclick);
		}
		removeClass(this.itemTag, 'selected');
		removeClass(this.itemTerrain, 'selected');
		removeClass(this.itemEdit, 'selected');
		getPaletteStore().mode = enabled ? 'priority' : 'normal';
		this.requestRendering();
	};
})();

Palette.switchTag = (function IIFE() {
	return function (this: typeof Palette, enabled = getPaletteStore().mode !== 'tag') {
		if (enabled) {
			addClass(this.itemTag, 'selected');
			if (this.marquee.visible) hide(marqueeData(this.marquee).selection);
			on(this.marquee, 'doubleclick', this.marqueeDoubleclick);
			on(this.marquee, 'pointermove', this.marqueePointermove);
			on(this.marquee, 'pointerleave', this.marqueePointerleave);
		} else {
			removeClass(this.itemTag, 'selected');
			if (this.marquee.visible) show(marqueeData(this.marquee).selection);
			off(this.marquee, 'pointermove', this.marqueePointermove);
			off(this.marquee, 'pointerleave', this.marqueePointerleave);
			on(this.marquee, 'doubleclick', this.marqueeDoubleclick);
		}
		removeClass(this.itemPriority, 'selected');
		removeClass(this.itemTerrain, 'selected');
		removeClass(this.itemEdit, 'selected');
		getPaletteStore().mode = enabled ? 'tag' : 'normal';
		this.requestRendering();
	};
})();

Palette.switchTerrain = (function IIFE() {
	return function (this: typeof Palette, enabled = getPaletteStore().mode !== 'terrain') {
		if (enabled) {
			addClass(this.itemTerrain, 'selected');
			if (this.marquee.visible) hide(marqueeData(this.marquee).selection);
			off(this.marquee, 'doubleclick', this.marqueeDoubleclick);
			on(this.marquee, 'pointermove', this.marqueePointermove);
			on(this.marquee, 'pointerleave', this.marqueePointerleave);
		} else {
			removeClass(this.itemTerrain, 'selected');
			if (this.marquee.visible) show(marqueeData(this.marquee).selection);
			off(this.marquee, 'pointermove', this.marqueePointermove);
			off(this.marquee, 'pointerleave', this.marqueePointerleave);
			on(this.marquee, 'doubleclick', this.marqueeDoubleclick);
		}
		removeClass(this.itemPriority, 'selected');
		removeClass(this.itemTag, 'selected');
		removeClass(this.itemEdit, 'selected');
		getPaletteStore().mode = enabled ? 'terrain' : 'normal';
		this.requestRendering();
	};
})();

Palette.switchEdit = (function IIFE() {
	return function (this: typeof Palette, enabled = getPaletteStore().mode !== 'edit') {
		if (enabled) {
			addClass(this.itemEdit, 'selected');
			if (this.marquee.visible) hide(marqueeData(this.marquee).selection);
			off(this.marquee, 'doubleclick', this.marqueeDoubleclick);
			on(this.marquee, 'pointermove', this.marqueePointermove);
			on(this.marquee, 'pointerleave', this.marqueePointerleave);
		} else {
			removeClass(this.itemEdit, 'selected');
			if (this.marquee.visible) show(marqueeData(this.marquee).selection);
			off(this.marquee, 'pointermove', this.marqueePointermove);
			off(this.marquee, 'pointerleave', this.marqueePointerleave);
			on(this.marquee, 'doubleclick', this.marqueeDoubleclick);
		}
		removeClass(this.itemPriority, 'selected');
		removeClass(this.itemTag, 'selected');
		removeClass(this.itemTerrain, 'selected');
		getPaletteStore().mode = enabled ? 'edit' : 'normal';
		this.requestRendering();
	};
})();

Palette.windowResize = function (this: typeof Palette, _event: Event) {
	if (this.body.clientWidth === 0) {
		return this.suspend();
	}
	this.updateHead();
	switch (getPaletteStore().state) {
		case 'open':
			this.resize();
			this.requestRendering();
			break;
		case 'suspended':
			this.resume();
			break;
	}
}.bind(Palette);

Palette.themechange = function (this: typeof Palette, event: Event) {
	switch (event.value) {
		case 'light':
			this.gridColor = 'rgba(0, 0, 0, 0.5)';
			break;
		case 'dark':
			this.gridColor = 'rgba(255, 255, 255, 0.5)';
			break;
	}
	this.requestRendering();
}.bind(Palette);

Palette.screenKeydown = function (this: typeof Palette, event: KeyboardEvent) {
	switch (event.code) {
		case 'Space':
			event.preventDefault();
			break;
	}
	if (getPaletteStore().state === 'open' && Palette.dragging === null) {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter': {
				event.stopPropagation();
				if (event.ctrlKey || event.metaKey) {
					Palette.editSelection();
				} else {
					Palette.openSelection();
				}
				break;
			}
			case 'ArrowLeft':
			case 'ArrowUp':
			case 'ArrowRight':
			case 'ArrowDown': {
				event.preventDefault();
				const marquee = Palette.marquee;
				if (!marquee.visible) return;
				const tileset = getPaletteStore().tileset;
				const hframes = tileset.width;
				const vframes = tileset.height;
				let mx = marquee.x;
				let my = marquee.y;
				let mw = marquee.width;
				let mh = marquee.height;
				if (event.shiftKey) {
					const ox = marquee.originX;
					const oy = marquee.originY;
					switch (event.code) {
						case 'ArrowLeft':
							if (mx === ox && mw > 1) {
								mw--;
							} else {
								mx--;
								mw++;
							}
							break;
						case 'ArrowRight':
							if (mx === ox) {
								mw++;
							} else {
								mx++;
								mw--;
							}
							break;
						case 'ArrowUp':
							if (my === oy && mh > 1) {
								mh--;
							} else {
								my--;
								mh++;
							}
							break;
						case 'ArrowDown':
							if (my === oy) {
								mh++;
							} else {
								my++;
								mh--;
							}
							break;
					}
					if (mx >= 0 && mx + mw <= hframes && my >= 0 && my + mh <= vframes) {
						marquee.select(mx, my, mw, mh);
						Palette.selectTiles(mx, my, mw, mh);
						Palette.scrollToSelection(true);
						Scene.requestRendering!();
					}
					return;
				}
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
				const x = Math.clamp(mx + offsetX, 0, hframes - mw);
				const y = Math.clamp(my + offsetY, 0, vframes - mh);
				if (mx !== x || my !== y) {
					marquee.select(x, y, mw, mh);
					marquee.originX += x - mx;
					marquee.originY += y - my;
					Palette.selectTiles(x, y, mw, mh);
					Palette.scrollToSelection(false);
					Scene.requestRendering!();
				}
				break;
			}
			case 'Minus':
			case 'NumpadSubtract':
				Palette.setZoom(getPaletteStore().zoom! - 1);
				break;
			case 'Equal':
			case 'NumpadAdd':
				Palette.setZoom(getPaletteStore().zoom! + 1);
				break;
			case 'Digit0':
			case 'Numpad0':
				Palette.setZoom(2);
				break;
		}
	}
};

Palette.screenWheel = (function IIFE() {
	let timerIsWorking = false;
	const timer = new Timer({
		duration: 400,
		callback: (_timer: Timer) => {
			timerIsWorking = false;
			Palette.screen.endScrolling();
		}
	});
	return function (this: typeof Palette, event: WheelEvent) {
		if (getPaletteStore().scrollable) {
			timer.elapsed = 0;
			if (!timerIsWorking) {
				timerIsWorking = true;
				timer.add();
				this.screen.beginScrolling();
			}
		} else {
			event.preventDefault();
			if (event.deltaY !== 0 && this.dragging === null) {
				this.setZoom(getPaletteStore().zoom! + (event.deltaY > 0 ? -1 : 1));
			}
		}
	}.bind(Palette);
})();

Palette.screenUserscroll = function (this: typeof Palette, _event: Event) {
	if (getPaletteStore().state === 'open') {
		screenScrollData(this.screen).rawScrollLeft = this.screen.scrollLeft;
		screenScrollData(this.screen).rawScrollTop = this.screen.scrollTop;
		this.updateTransform();
		this.updateBackground();
		this.requestRendering();
		this.screen.updateScrollbars();
	}
}.bind(Palette);

Palette.screenBlur = function (this: typeof Palette, _event: Event) {
	if (this.dragging) {
		this.pointerup(this.dragging);
	}
}.bind(Palette);
