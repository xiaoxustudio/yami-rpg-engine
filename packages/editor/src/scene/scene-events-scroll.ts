import { screenScrollData } from '@app/engine/screen-scroll-data';
import { Scene } from './scene-window.ts';
import type { ScrollableScreen } from './scene-events.ts';

Scene.shiftKeyup = function (this: typeof Scene, event: KeyboardEvent | undefined) {
	if (!this.shiftKey) {
		return;
	}
	switch (event?.code) {
		case 'ShiftLeft':
		case undefined:
			if (this.shiftKey) {
				this.shiftKey = false;
				if (this.dragging) {
					switch (this.dragging?.mode) {
						case 'pencil':
						case 'rect':
						case 'oval': {
							const marquee = this.marquee;
							this.edit(marquee.x, marquee.y, marquee.width, marquee.height);
							break;
						}
						case 'object-move':
							this.pointermove(this.dragging?.latest);
							break;
					}
				}
				window.removeEventListener('keyup', this.shiftKeyup);
			}
			break;
	}
}.bind(Scene);

Scene.translationKeyup = function (this: typeof Scene, event: KeyboardEvent | undefined) {
	if (this.translationKey === 0b0000) {
		return;
	}
	if (event === undefined) {
		this.translationKey = 0b0000;
	} else {
		switch (event.code) {
			case 'KeyA':
				this.translationKey &= 0b1110;
				break;
			case 'KeyW':
				this.translationKey &= 0b1101;
				break;
			case 'KeyD':
				this.translationKey &= 0b1011;
				break;
			case 'KeyS':
				this.translationKey &= 0b0111;
				break;
		}
	}
	if (this.translationKey === 0b0000) {
		this.translationTimer.remove();
		this.screen.endScrolling();
		window.removeEventListener('keyup', this.translationKeyup);
	}
}.bind(Scene);

Scene.screenWheel = function (this: typeof Scene, event: WheelEvent) {
	if (this.state === 'open' && this.dragging === null) {
		event.preventDefault();
		if (event.deltaY !== 0) {
			const step = event.deltaY > 0 ? -1 : 1;
			this.setZoom(this.zoom + step);
		}
	}
}.bind(Scene);

Scene.screenUserscroll = function (this: typeof Scene, _event: Event) {
	if (this.state === 'open') {
		const screen = this.screen as ScrollableScreen;
		screenScrollData(screen).rawScrollLeft = screen.scrollLeft;
		screenScrollData(screen).rawScrollTop = screen.scrollTop;
		this.updateTransform();
		this.requestRendering!();
		this.marquee.resize();
		screen.updateScrollbars();
	}
}.bind(Scene);

Scene.screenBlur = function (this: typeof Scene, _event: FocusEvent) {
	this.shiftKeyup();
	this.translationKeyup();
	this.pointerup();
	// this.marqueePointerleave()
}.bind(Scene);
