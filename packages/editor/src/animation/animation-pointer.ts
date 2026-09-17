import { Animation } from './animation-window.ts';
import { relate, getRelativeCoords } from '@app/utils/element-utils';
import { Cursor } from '@app/composables/usePointerObjectWindow';
import { GL } from '@app/engine/webgl/webgl-init.ts';
import { getAnimationStore } from '@app/stores/animation';
import { isDragKey } from '@app/utils/event-accessors';
import { roundTo, radians, degrees, modRadians } from '@app/utils/math';

Animation.marqueePointerdown = function (
	this: typeof Animation,
	event: PointerEvent & {
		dragKey?: boolean;
		mode?: string;
		scrollLeft?: number;
		scrollTop?: number;
		absoluteAnchorX?: number;
		absoluteAnchorY?: number;
		lastAngle?: number;
		rotationRadians?: number;
		startRotation?: number;
		startScaleX?: number;
		startScaleY?: number;
		startWidth?: number;
		startHeight?: number;
		enabled?: boolean;
		startX?: number;
		startY?: number;
	}
) {
	if (this.dragging || !getAnimationStore().motion) {
		return;
	}
	switch (event.button) {
		case 0: {
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
			if (this.controlPointActive && getAnimationStore().target) {
				const context = this.targetContext;
				const target = getAnimationStore().target!;
				const points = this.controlPoints;
				this.dragging = event;
				switch (this.controlPointActive) {
					case points.jointRotate:
					case points.rectRotate.TL:
					case points.rectRotate.TR:
					case points.rectRotate.BL:
					case points.rectRotate.BR: {
						const rotation = target.rotation;
						const matrix = GL.matrix.set(Animation.matrix).multiply(context.matrix);
						const aax = matrix[6];
						const aay = matrix[7];
						const { x, y } = getRelativeCoords(event, GL.canvas);
						const dpr = window.devicePixelRatio;
						event.mode = 'object-rotate';
						event.absoluteAnchorX = aax;
						event.absoluteAnchorY = aay;
						event.lastAngle = Math.atan2(y * dpr - aay, x * dpr - aax);
						event.rotationRadians = 0;
						event.startRotation = rotation;
						break;
					}
					case points.rectResize.T:
					case points.rectResize.L:
					case points.rectResize.R:
					case points.rectResize.B:
					case points.rectResize.TL:
					case points.rectResize.TR:
					case points.rectResize.BL:
					case points.rectResize.BR: {
						const layer = context.layer;
						event.mode = 'object-resize';
						event.startScaleX = target.scaleX;
						event.startScaleY = target.scaleY;
						switch (context.layer.class) {
							case 'sprite': {
								const key = layer.sprite;
								const texture = this.player.textures[key];
								event.startWidth = texture.width;
								event.startHeight = texture.height;
								break;
							}
							case 'particle': {
								const emitter = context.emitter;
								if (emitter.hasArea) {
									event.startWidth = emitter.outerWidth;
									event.startHeight = emitter.outerHeight;
								}
								break;
							}
						}
						break;
					}
				}
				window.addEventListener('pointerup', this.pointerup);
				window.addEventListener('pointermove', this.pointermove);
				return;
			}
			const { x, y } = this.getPointerCoords!(event);
			let object;
			if ((event.ctrlKey || event.metaKey) && getAnimationStore().target) {
				object = getAnimationStore().target;
			}
			if (object === undefined) {
				object = this.selectObject!(x, y);
			}
			if (object) {
				this.dragging = event;
				event.mode = 'object-move';
				event.enabled = false;
				event.startX = object.x;
				event.startY = object.y;
				window.addEventListener('pointerup', this.pointerup);
				window.addEventListener('pointermove', this.pointermove);
			}
			this.selectFrame!(object);
			break;
		}
		case 2:
			this.dragging = event;
			event.mode = 'ready-to-scroll';
			event.scrollLeft = this.screen.scrollLeft;
			event.scrollTop = this.screen.scrollTop;
			window.addEventListener('pointerup', this.pointerup);
			window.addEventListener('pointermove', this.pointermove);
			break;
	}
}.bind(Animation);

Animation.marqueePointermove = function (this: typeof Animation, event: PointerEvent) {
	if (!this.dragging && getAnimationStore().motion) {
		this.marquee.pointerevent = event;
		const { x, y } = this.getPointerCoords!(event);
		if (getAnimationStore().target) {
			const point = this.selectControlPoint!(x, y);
			if (point) {
				this.setHover!(null);
				this.setControlPoint!(point);
				return;
			}
		}
		if (this.controlPointActive) {
			this.setControlPoint!(null);
		}
		const object = this.selectObject!(x, y);
		this.setHover!(object);
	}
}.bind(Animation);

Animation.marqueePointerleave = function (this: typeof Animation, _event: Event) {
	if (this.marquee.pointerevent) {
		this.marquee.pointerevent = null;
		this.setHover!(null);
	}
}.bind(Animation);

Animation.marqueeDoubleclick = function (this: typeof Animation, _event: Event) {
	if (getAnimationStore().target) {
		this.screenBlur!();
		this.revealTarget!();
	}
}.bind(Animation);

Animation.pointerup = function (this: typeof Animation, event: PointerEvent | undefined) {
	const { dragging } = Animation;
	if (dragging === null) {
		return;
	}
	if (event === undefined) {
		event = dragging;
	}
	if (dragging && relate(dragging, event)) {
		switch (dragging.mode) {
			case 'object-rotate':
			case 'object-resize':
			case 'object-move':
				break;
			case 'ready-to-scroll':
				break;
			case 'scroll':
				Cursor.close('cursor-grab');
				break;
		}
		Animation.dragging = null;
		window.removeEventListener('pointerup', Animation.pointerup);
		window.removeEventListener('pointermove', Animation.pointermove);
	}
};

Animation.pointermove = function (this: typeof Animation, event: PointerEvent) {
	const { dragging } = Animation;
	if (dragging && relate(dragging, event)) {
		const dpr = window.devicePixelRatio;
		switch (dragging.mode) {
			case 'object-rotate':
				if (getAnimationStore().target) {
					const { x, y } = getRelativeCoords(event, GL.canvas);
					const distX = x * dpr - dragging.absoluteAnchorX;
					const distY = y * dpr - dragging.absoluteAnchorY;
					const currentAngle = Math.atan2(distY, distX);
					const angle = modRadians(currentAngle - dragging.lastAngle);
					const increment = angle < Math.PI ? angle : angle - Math.PI * 2;
					dragging.rotationRadians += getAnimationStore().mirror ? -increment : increment;
					let rotation = Math.round(
						dragging.startRotation + degrees(dragging.rotationRadians)
					);
					if (event.shiftKey) {
						rotation = Math.round(rotation / 15) * 15;
					}
					if (getAnimationStore().target!.rotation !== rotation) {
						Animation.rotateTarget!(rotation);
					}
					dragging.lastAngle = currentAngle;
				}
				break;
			case 'object-resize':
				if (getAnimationStore().target) {
					const points = Animation.controlPoints;
					const point = Animation.controlPointActive;
					const angle = radians(point.angle + Animation.controlPointRotation);
					const distX = ((event.clientX - dragging.clientX) * dpr) / Animation.scaleX;
					const distY = ((event.clientY - dragging.clientY) * dpr) / Animation.scaleY;
					const dist = Math.sqrt(distX ** 2 + distY ** 2);
					const distAngle = Math.atan2(
						distY,
						getAnimationStore().mirror ? -distX : distX
					);
					let width = undefined;
					let height = undefined;
					switch (point) {
						case points.rectResize.T:
						case points.rectResize.L:
						case points.rectResize.R:
						case points.rectResize.B: {
							const offset = dist * Math.cos(distAngle - angle);
							switch (point) {
								case points.rectResize.T:
								case points.rectResize.B:
									height = offset;
									break;
								case points.rectResize.L:
								case points.rectResize.R: {
									width = offset;
									break;
								}
							}
							break;
						}
						case points.rectResize.TL:
						case points.rectResize.TR:
						case points.rectResize.BL:
						case points.rectResize.BR:
							if (event.shiftKey) {
								const rectWidth = dragging.startWidth * dragging.startScaleX;
								const rectHeight = dragging.startHeight * dragging.startScaleY;
								const aspectAngle = Math.atan2(rectHeight, rectWidth);
								let startAngle;
								switch (point) {
									case points.rectResize.TL:
									case points.rectResize.BR:
										startAngle = angle - Math.PI / 4 + aspectAngle;
										break;
									case points.rectResize.TR:
									case points.rectResize.BL:
										startAngle = angle + Math.PI / 4 - aspectAngle;
										break;
								}
								const includedAngle = distAngle - startAngle!;
								const offset = dist * Math.cos(includedAngle);
								const offsetX = offset * Math.cos(aspectAngle);
								const offsetY = offset * Math.sin(aspectAngle);
								width = offsetX;
								height = offsetY;
							} else {
								const startAngle = angle - Math.PI / 4;
								const includedAngle = distAngle - startAngle;
								const offsetX = dist * Math.cos(includedAngle);
								const offsetY = dist * Math.sin(includedAngle);
								switch (point) {
									case points.rectResize.TL:
									case points.rectResize.BR:
										width = offsetX;
										height = offsetY;
										break;
									case points.rectResize.TR:
									case points.rectResize.BL:
										width = offsetY;
										height = offsetX;
										break;
								}
							}
							break;
					}
					let scaleX = undefined;
					let scaleY = undefined;
					if (width !== undefined) {
						scaleX = width / dragging.startWidth;
						scaleX = roundTo(dragging.startScaleX + scaleX, 4);
					}
					if (height !== undefined) {
						scaleY = height / dragging.startHeight;
						scaleY = roundTo(dragging.startScaleY + scaleY, 4);
					}
					if (
						(scaleX !== undefined && getAnimationStore().target!.scaleX !== scaleX) ||
						(scaleY !== undefined && getAnimationStore().target!.scaleY !== scaleY)
					) {
						Animation.resizeTarget!(scaleX, scaleY);
					}
				}
				break;
			case 'object-move':
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
				if (getAnimationStore().target) {
					const target = getAnimationStore().target!;
					const mirrorX = getAnimationStore().mirror ? -1 : 1;
					const distX =
						(((event.clientX - dragging.clientX) * dpr) / Animation.scaleX) * mirrorX;
					const distY = ((event.clientY - dragging.clientY) * dpr) / Animation.scaleY;
					let x;
					let y;
					if (event.shiftKey) {
						const angle = Math.atan2(distY, distX);
						const directions = 4;
						const proportion = modRadians(angle) / (Math.PI * 2);
						const section = (proportion * directions + 0.5) % directions;
						switch (Math.floor(section)) {
							case 0:
							case 2:
								x = Math.round(dragging.startX + distX);
								y = dragging.startY;
								break;
							case 1:
							case 3:
								x = dragging.startX;
								y = Math.round(dragging.startY + distY);
								break;
						}
					} else {
						x = Math.round(dragging.startX + distX);
						y = Math.round(dragging.startY + distY);
					}
					if (target.x !== x || target.y !== y) {
						Animation.shiftTarget!(x, y);
					}
				}
				break;
			case 'ready-to-scroll': {
				const distX = event.clientX - dragging.clientX;
				const distY = event.clientY - dragging.clientY;
				Animation.screen.setScroll(dragging.scrollLeft - distX, dragging.scrollTop - distY);
				if (Math.sqrt(distX ** 2 + distY ** 2) > 4) {
					dragging.mode = 'scroll';
					Cursor.open('cursor-grab');
				}
				break;
			}
			case 'scroll': {
				const distX = event.clientX - dragging.clientX;
				const distY = event.clientY - dragging.clientY;
				Animation.screen.setScroll(dragging.scrollLeft - distX, dragging.scrollTop - distY);
				break;
			}
		}
	}
};
