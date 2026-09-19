import { screenScrollData } from '@app/engine/screen-scroll-data';
import { UI } from './ui-window.ts';
import type { UIShape } from './ui-window.ts';
import { File } from '@app/file/file-system-core.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { registerWindowKeydown } from '@app/tools/window-keydown-registry';
import { hasClass, read } from '@app/utils/element-utils.ts';
import { StageColor } from '@app/utils/stage-color';
import { getUIStore } from '@app/stores/ui';
import { roundTo } from '@app/utils/math';

UI.switchSettings = function (this: UIShape) {
	if (!hasClass(Inspector.fileUI.button, 'selected')) {
		Inspector.open!('fileUI', UI);
	} else {
		Inspector.close!();
	}
};

UI.planToSave = function (this: UIShape) {
	File.planToSave!(this.meta);
};

UI.saveToConfig = function (this: UIShape, config: { colors: Record<string, string> }) {
	config.colors.uiBackground = this.background.hex;
	config.colors.uiForeground = this.foreground.hex;
};

UI.loadFromConfig = function (this: UIShape, config: { colors: Record<string, string> }) {
	// `background` / `foreground` 的真源是 store 的 `loadFromConfig`（见 `stores/ui.ts`），
	// 这里只维护遗留单例上的那一份，给仍读 `this.background` 的路径（如 `saveToConfig`）用。
	this.background = new StageColor(config.colors.uiBackground, () => this.requestRendering!());
	this.foreground = new StageColor(config.colors.uiForeground, () => {
		if (getUIStore().state === 'open') {
			// `root` 已迁到 store；`this.root` 是 `undefined`（2026-09-18）。
			getUIStore().root?.resize();
			this.requestRendering!();
		}
	});
};

UI.saveToProject = function (
	this: UIShape,
	project: { ui: { zoom?: number } & Record<string, unknown>; uiPrefabs?: string[] }
) {
	const { ui, uiPrefabs } = project;
	ui.zoom = getUIStore().zoom ?? ui.zoom;
	UI.clearInvalidPrefabs!(uiPrefabs ?? []);
};

UI.loadFromProject = function (this: UIShape, project: { ui: { zoom: number } }) {
	const { ui } = project;
	this.setZoom!(ui.zoom);
};

UI.webglRestored = function (this: UIShape, _event: Event) {
	if (getUIStore().state === 'open') {
		UI.requestRendering!();
	}
};

UI.windowResize = function (this: UIShape, _event: Event) {
	this.updateHead!();
	if (getUIStore().state === 'open') {
		this.resize!();
		this.updateCamera!();
		this.requestRendering!();
	}
}.bind(UI);

UI.themechange = function (this: UIShape, _event: Event) {
	this.requestRendering!();
}.bind(UI);

UI.localizationchange = function (this: UIShape, _event: Event) {
	this.updateAllTexts!();
}.bind(UI);

UI.keydown = function (this: UIShape, event: KeyboardEvent) {
	if (getUIStore().state === 'open' && UI.dragging === null) {
		if (event.ctrlKey || event.metaKey) {
			return;
		} else if (event.altKey) {
			switch (event.code) {
				case 'KeyS':
					UI.switchSettings!();
					break;
			}
		} else {
			return;
		}
	}
};

registerWindowKeydown('ui', UI.keydown);

UI.headPointerdown = function (this: UIShape, event: PointerEvent) {
	if (!(event.target instanceof HTMLInputElement)) {
		event.preventDefault();
		if (document.activeElement !== UI.screen) {
			UI.screen.focus();
		}
	}
};

UI.switchPointerdown = function (this: UIShape, event: PointerEvent) {
	switch (event.button) {
		case 0: {
			const element = event.target as HTMLElement;
			if (hasClass(element, 'item')) {
				switch (element.getAttribute('value')) {
					case 'settings':
						return UI.switchSettings!();
				}
			}
			break;
		}
	}
};

UI.shortcutPointerdown = function (this: UIShape, event: PointerEvent) {
	switch (event.button) {
		case 0: {
			const element = event.target as HTMLElement;
			if (hasClass(element, 'item')) {
				UI.create!(element.getAttribute('value'), 0, 0);
			}
			break;
		}
	}
};

UI.zoomFocus = function (this: UIShape, _event: Event) {
	UI.screen.focus();
};

UI.zoomInput = function (this: UIShape, _event: Event & { value?: number }) {
	UI.setZoom!(read(this));
};

UI.screenKeydown = function (this: UIShape, event: KeyboardEvent) {
	if (getUIStore().state === 'open' && this.dragging === null) {
		if (event.ctrlKey || event.metaKey) {
			switch (event.code) {
				case 'KeyX':
					this.copy!();
					this.delete!();
					return;
				case 'KeyC':
					this.copy!();
					return;
				case 'KeyV':
					this.paste!();
					return;
				case 'KeyD':
					this.duplicate!();
					return;
				case 'ArrowLeft':
				case 'ArrowUp':
				case 'ArrowRight':
				case 'ArrowDown':
					break;
				default:
					return;
			}
		}
		if (event.altKey) {
			return;
		}
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				this.revealTarget!();
				break;
			case 'Slash':
				this.toggle!();
				break;
			case 'Delete':
				this.delete!();
				break;
			case 'Escape':
				this.setTarget!(null);
				break;
			case 'KeyA':
				if ((this.translationKey & 0b0001) === 0) {
					this.translationKey |= 0b0001;
					this.translationTimer!.add();
					this.screen.beginScrolling();
					window.addEventListener('keyup', this.translationKeyup);
				}
				break;
			case 'KeyW':
				if ((this.translationKey & 0b0010) === 0) {
					this.translationKey |= 0b0010;
					this.translationTimer!.add();
					this.screen.beginScrolling();
					window.addEventListener('keyup', this.translationKeyup);
				}
				break;
			case 'KeyD':
				if ((this.translationKey & 0b0100) === 0) {
					this.translationKey |= 0b0100;
					this.translationTimer!.add();
					this.screen.beginScrolling();
					window.addEventListener('keyup', this.translationKeyup);
				}
				break;
			case 'KeyS':
				if ((this.translationKey & 0b1000) === 0) {
					this.translationKey |= 0b1000;
					this.translationTimer!.add();
					this.screen.beginScrolling();
					window.addEventListener('keyup', this.translationKeyup);
				}
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
			case 'ArrowRight':
			case 'ArrowDown':
				if (getUIStore().target !== null) {
					event.preventDefault();
					const transform = getUIStore().target!.transform;
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
					if (event.ctrlKey || event.metaKey) {
						const ax = roundTo(transform.anchorX - offsetX * 0.5, 4);
						const ay = roundTo(transform.anchorY - offsetY * 0.5, 4);
						return this.shiftAnchor!(ax, ay);
					}
					if (event.shiftKey) {
						offsetX *= 10;
						offsetY *= 10;
					}
					const x = roundTo(transform.x + offsetX, 4);
					const y = roundTo(transform.y + offsetY, 4);
					this.shiftTarget!(x, y);
				}
				break;
			case 'Minus':
			case 'NumpadSubtract':
				this.setZoom!(getUIStore().zoom! - 1);
				break;
			case 'Equal':
			case 'NumpadAdd':
				this.setZoom!(getUIStore().zoom! + 1);
				break;
			case 'Digit0':
			case 'Numpad0':
				this.setZoom!(2);
				break;
		}
	}
}.bind(UI);

UI.translationKeyup = function (this: UIShape, event?: KeyboardEvent) {
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
		this.translationTimer!.remove();
		this.screen.endScrolling();
		window.removeEventListener('keyup', this.translationKeyup);
	}
}.bind(UI);

UI.screenWheel = function (this: UIShape, event: WheelEvent) {
	if (getUIStore().state === 'open' && this.dragging === null) {
		event.preventDefault();
		if (event.deltaY !== 0) {
			const step = event.deltaY > 0 ? -1 : 1;
			this.setZoom!(getUIStore().zoom! + step);
		}
	}
}.bind(UI);

UI.screenUserscroll = function (this: UIShape, _event: Event) {
	if (getUIStore().state === 'open') {
		screenScrollData(this.screen).rawScrollLeft = this.screen.scrollLeft;
		screenScrollData(this.screen).rawScrollTop = this.screen.scrollTop;
		this.updateTransform!();
		this.requestRendering!();
		this.marquee.resize();
		this.screen.updateScrollbars();
	}
}.bind(UI);

UI.screenBlur = function (this: UIShape, _event: FocusEvent) {
	this.translationKeyup!();
	this.pointerup!();
	// this.marqueePointerleave!()
}.bind(UI);
