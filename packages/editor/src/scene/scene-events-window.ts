import { Scene } from './scene-window.ts';
import { registerWindowKeydown } from '@app/tools/window-keydown-registry';
import { hasClass, read } from '@app/utils/element-utils.ts';

Scene.webglRestored = function (this: typeof Scene, _event: Event) {
	if (Scene.state === 'open') {
		Scene.requestRendering!();
	}
};

Scene.windowResize = function (this: typeof Scene, _event: Event) {
	this.updateHead();
	if (this.state === 'open') {
		this.resize();
		this.requestRendering!();
	}
}.bind(Scene);

Scene.themechange = function (this: typeof Scene, _event: Event) {
	this.requestRendering!();
}.bind(Scene);

Scene.dprchange = function (this: typeof Scene, _event: Event) {
	if (this.state === 'open') {
		this.updateFont();
	}
}.bind(Scene);

Scene.datachange = function (
	this: typeof Scene,
	event: { key: string; last: { lightArea?: number } }
) {
	if (this.state === 'open') {
		switch (event.key) {
			case 'config':
				this.updateAnimationInterval();
				this.updateLightAreaExpansion(event.last.lightArea);
				break;
			case 'teams':
				this.updateActorTeams();
				break;
		}
	}
}.bind(Scene);

Scene.keydown = function (this: typeof Scene, event: KeyboardEvent) {
	if (Scene.state === 'open' && Scene.dragging === null) {
		if (event.ctrlKey || event.metaKey) {
			return;
		} else if (event.altKey) {
			switch (event.code) {
				case 'KeyS':
					Scene.switchSettings!();
					break;
			}
		} else {
			switch (event.code) {
				case 'Escape':
					Scene.closeTilemap!();
					break;
				case 'Backquote':
					if (Scene.layer !== 'object') Scene.switchLayer!('object');
					else Scene.switchLayer!('terrain');
					break;
				case 'Digit1':
					Scene.openTilemap!(Scene.tilemaps.shortcuts[1]);
					break;
				case 'Digit2':
					Scene.openTilemap!(Scene.tilemaps.shortcuts[2]);
					break;
				case 'Digit3':
					Scene.openTilemap!(Scene.tilemaps.shortcuts[3]);
					break;
				case 'Digit4':
					Scene.openTilemap!(Scene.tilemaps.shortcuts[4]);
					break;
				case 'Digit5':
					Scene.openTilemap!(Scene.tilemaps.shortcuts[5]);
					break;
				case 'Digit6':
					Scene.openTilemap!(Scene.tilemaps.shortcuts[6]);
					break;
				case 'KeyQ':
					Scene.switchBrush!('eraser');
					break;
				case 'KeyE':
					Scene.switchBrush!('pencil');
					break;
				case 'KeyR':
					Scene.switchBrush!('rect');
					break;
				case 'KeyT':
					Scene.switchBrush!('oval');
					break;
				case 'KeyY':
					Scene.switchBrush!('fill');
					break;
			}
		}
	}
};

registerWindowKeydown('scene', Scene.keydown);

Scene.headPointerdown = function (this: typeof Scene, event: PointerEvent) {
	if (!(event.target instanceof HTMLInputElement)) {
		event.preventDefault();
		if (document.activeElement !== Scene.screen) {
			Scene.screen.focus();
		}
	}
};

Scene.switchPointerdown = function (this: typeof Scene, event: PointerEvent) {
	switch (event.button) {
		case 0: {
			const element = event.target as Element;
			if (hasClass(element, 'item')) {
				switch (element.getAttribute('value')) {
					case 'grid':
						return Scene.switchGrid!();
					case 'light':
						return Scene.switchLight!();
					case 'animation':
						return Scene.switchAnimation!();
					case 'settings':
						return Scene.switchSettings!();
				}
			}
			break;
		}
	}
};

Scene.layerPointerdown = function (this: typeof Scene, event: PointerEvent) {
	switch (event.button) {
		case 0:
			if (!Scene.dragging) {
				const element = event.target as Element;
				if (hasClass(element, 'item') && !hasClass(element, 'selected')) {
					const value = element.getAttribute('value');
					switch (value) {
						case 'object':
						case 'terrain':
							Scene.switchLayer!(value);
							break;
						default:
							Scene.openTilemap!(Scene.tilemaps.shortcuts[value!]);
							break;
					}
				}
			}
			break;
	}
};

Scene.brushPointerdown = function (this: typeof Scene, event: PointerEvent) {
	switch (event.button) {
		case 0:
			if (!Scene.dragging) {
				const element = event.target as Element;
				if (hasClass(element, 'item') && !hasClass(element, 'selected')) {
					Scene.switchBrush!(element.getAttribute('value'));
				}
			}
			break;
	}
};

Scene.zoomFocus = function (this: HTMLElement, _event: Event) {
	Scene.screen.focus();
};

Scene.zoomInput = function (this: HTMLElement, _event: Event) {
	Scene.setZoom!(read(this));
};

Scene.screenKeydown = function (this: typeof Scene, event: KeyboardEvent) {
	if (this.state === 'open' && (this.dragging === null || event.code === 'ShiftLeft')) {
		if (event.ctrlKey || event.metaKey) {
			switch (event.code) {
				case 'KeyX':
					this.copy!();
					this.delete();
					break;
				case 'KeyC':
					this.copy!();
					break;
				case 'KeyV':
					this.paste!();
					break;
				case 'KeyD':
					this.duplicate!();
					break;
				case 'ArrowLeft':
				case 'ArrowUp':
				case 'ArrowRight':
				case 'ArrowDown':
					if (
						this.layer === 'object' &&
						(this.target?.class === 'actor' || this.target?.class === 'animation')
					) {
						let angle;
						switch (event.code) {
							case 'ArrowLeft':
								angle = 180;
								break;
							case 'ArrowUp':
								angle = 270;
								break;
							case 'ArrowRight':
								angle = 0;
								break;
							case 'ArrowDown':
								angle = 90;
								break;
						}
						this.redirectTarget(angle);
					}
					break;
			}
		} else if (event.altKey) {
			return;
		} else {
			switch (event.code) {
				case 'ShiftLeft':
					if (!this.shiftKey) {
						this.shiftKey = true;
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
						window.addEventListener('keyup', this.shiftKeyup);
					}
					break;
				case 'Enter':
				case 'NumpadEnter':
					if (this.target) {
						this.listOpen({ value: this.target });
					}
					break;
				case 'Slash':
					this.toggle!();
					break;
				case 'Delete':
					this.delete();
					break;
				case 'Escape':
					this.setTarget(null);
					break;
				case 'KeyA':
					if ((this.translationKey & 0b0001) === 0) {
						this.translationKey |= 0b0001;
						this.translationTimer.add();
						this.screen.beginScrolling();
						window.addEventListener('keyup', this.translationKeyup);
					}
					break;
				case 'KeyW':
					if ((this.translationKey & 0b0010) === 0) {
						this.translationKey |= 0b0010;
						this.translationTimer.add();
						this.screen.beginScrolling();
						window.addEventListener('keyup', this.translationKeyup);
					}
					break;
				case 'KeyD':
					if ((this.translationKey & 0b0100) === 0) {
						this.translationKey |= 0b0100;
						this.translationTimer.add();
						this.screen.beginScrolling();
						window.addEventListener('keyup', this.translationKeyup);
					}
					break;
				case 'KeyS':
					if ((this.translationKey & 0b1000) === 0) {
						this.translationKey |= 0b1000;
						this.translationTimer.add();
						this.screen.beginScrolling();
						window.addEventListener('keyup', this.translationKeyup);
					}
					break;
				case 'ArrowLeft':
				case 'ArrowUp':
				case 'ArrowRight':
				case 'ArrowDown':
					if (this.layer === 'object') {
						event.preventDefault();
						const width = this.width;
						const height = this.height;
						const shift = this.shiftKey;
						let offsetX = 0;
						let offsetY = 0;
						switch (event.code) {
							case 'ArrowLeft':
								offsetX = shift ? -0.1 : -1;
								break;
							case 'ArrowUp':
								offsetY = shift ? -0.1 : -1;
								break;
							case 'ArrowRight':
								offsetX = shift ? +0.1 : +1;
								break;
							case 'ArrowDown':
								offsetY = shift ? +0.1 : +1;
								break;
						}
						switch (this.target?.class) {
							case 'actor': {
								const actor = this.target;
								const size = actor.data?.size ?? 1;
								const radius = Math.max(size, 1) / 2;
								const x = Math.clamp(actor.x + offsetX, radius, width - radius);
								const y = Math.clamp(actor.y + offsetY, radius, height - radius);
								this.shiftTarget(Math.roundTo(x, 4), Math.roundTo(y, 4));
								break;
							}
							case 'region': {
								const region = this.target;
								const rwh = region.width / 2;
								const rhh = region.height / 2;
								const x = Math.clamp(region.x + offsetX, rwh, width - rwh);
								const y = Math.clamp(region.y + offsetY, rhh, height - rhh);
								this.shiftTarget(Math.roundTo(x, 4), Math.roundTo(y, 4));
								break;
							}
							case 'tilemap':
							case 'light':
							case 'animation':
							case 'particle':
							case 'parallax': {
								const target = this.target;
								const x = Math.clamp(target.x + offsetX, 0, width);
								const y = Math.clamp(target.y + offsetY, 0, height);
								this.shiftTarget(Math.roundTo(x, 4), Math.roundTo(y, 4));
								break;
							}
						}
					}
					break;
				case 'Minus':
				case 'NumpadSubtract':
					this.setZoom(this.zoom - 1);
					break;
				case 'Equal':
				case 'NumpadAdd':
					this.setZoom(this.zoom + 1);
					break;
				case 'Digit0':
				case 'Numpad0':
					this.setZoom(2);
					break;
			}
		}
	}
}.bind(Scene);
