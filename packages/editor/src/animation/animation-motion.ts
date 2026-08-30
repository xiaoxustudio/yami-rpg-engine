/* oxlint-disable eslint/no-restricted-properties */
import { Animation } from './animation-window.ts';
import type {
	AnimationFrame,
	AnimationLayer,
	AnimationMotion,
	AnimationContext
} from './animation-window.ts';
import { getRelativeCoords } from '@app/utils/element-utils';
import { ANIM_GRID_X, ANIM_GRID_Y } from '@app/constants/editor.ts';
import {
	addClass,
	clear,
	hide,
	read,
	rect,
	removeClass,
	show,
	write
} from '@app/utils/element-utils.ts';
import { Timer } from '@app/utils/timer';
import { Command } from '@app/commands/command-object.ts';
import { Curve } from './curve-window.ts';
import { AudioManager } from '@app/audio/audio-manager.ts';
import { Data } from '@app/data/data-object.ts';
import { Easing } from '@app/data/transition-window.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { Layout } from '@app/engine/layout/layout.ts';
import { GameLocal } from '@app/local/local-object.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string) => getYamiI18n().global.t(key);
import { ImageTexture } from '@app/engine/webgl/image-texture.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';
import { getAnimationStore } from '@app/stores/animation';
Animation.play = function (this: typeof Animation) {
	if (getAnimationStore().playing) {
		return this.stop!();
	}
	if (getAnimationStore().motion === null) return;
	const range = this.getAnimationRange!();
	const player = this.player;
	// 使用animIndex属性来避免加载最后一帧时被取整的情况
	if (player.index < range.end - 1) {
		this.animIndex = player.index;
	} else {
		this.animIndex = -1;
	}
	getAnimationStore().playing = true;
	this.requestAnimation!();
	player.clearParticles();
};

Animation.stop = function (this: typeof Animation) {
	if (getAnimationStore().playing) {
		getAnimationStore().playing = false;
		this.resetSoundContexts!();
		this.loadFrames!(Math.floor(this.animIndex));
	}
};

Animation.copy = function (this: typeof Animation) {
	if (getAnimationStore().state === 'open' && getAnimationStore().motion !== null) {
		this.list.copy(getAnimationStore().motion);
	}
};

Animation.paste = function (this: typeof Animation) {
	if (getAnimationStore().state === 'open' && this.dragging === null) {
		this.list.paste(null);
	}
};

Animation.delete = function (this: typeof Animation) {
	if (
		getAnimationStore().state === 'open' &&
		getAnimationStore().motion !== null &&
		this.dragging === null
	) {
		this.list.delete(getAnimationStore().motion);
	}
};

Animation.undo = function (this: typeof Animation) {
	if (getAnimationStore().state === 'open' && !this.dragging && this.history.canUndo()) {
		this.history.restore('undo');
		this.marquee.resize();
	}
};

Animation.redo = function (this: typeof Animation) {
	if (getAnimationStore().state === 'open' && !this.dragging && this.history.canRedo()) {
		this.history.restore('redo');
		this.marquee.resize();
	}
};

Animation.openLayer = function (this: typeof Animation, layer: AnimationLayer) {
	this.layerList.selectWithNoEvent(layer);
	switch (layer.class) {
		case 'joint':
			Inspector.close!();
			break;
		case 'sprite':
			Inspector.open!('animSpriteLayer', layer);
			break;
		case 'particle':
			Inspector.open!('animParticleLayer', layer);
			break;
		case 'sound':
			Inspector.open!('animSoundLayer', layer);
			break;
	}
};

Animation.previousFrame = function (this: typeof Animation) {
	const { length } = this.player;
	if (length <= 1) return;
	const i = this.player.index;
	const y = this.timelineMarquee.y;
	const x = (i - 1 + length) % length;
	if (y !== -1) {
		this.selectMarquee!(x, y, 1, x);
		this.scrollToMarquee!(false);
	}
	this.loadFrames!(x);
};

Animation.nextFrame = function (this: typeof Animation) {
	const { length } = this.player;
	if (length <= 1) return;
	const i = this.player.index;
	const y = this.timelineMarquee.y;
	const x = (i + 1) % length;
	if (y !== -1) {
		this.selectMarquee!(x, y, 1, x);
		this.scrollToMarquee!(false);
	}
	this.loadFrames!(x);
};

Animation.previousKeyFrame = function (this: typeof Animation) {
	if (this.player.length <= 1) return;
	const contexts = this.player.contexts;
	const index = this.player.index;
	const y = this.timelineMarquee.y;
	if (y !== -1) {
		let x = -1;
		const { frames } = contexts[y].layer;
		for (const frame of frames) {
			if (frame.start < index) {
				x = frame.start;
			} else {
				break;
			}
		}
		if (x === -1 && frames.length !== 0) {
			x = frames[frames.length - 1].start;
		}
		if (x !== -1) {
			this.selectMarquee!(x, y, 1, x);
			this.scrollToMarquee!(false);
			this.loadFrames!(x);
		}
	} else {
		let x = -Infinity;
		const { count } = contexts;
		for (let i = 0; i < count; i++) {
			const { frames } = contexts[i].layer;
			for (const frame of frames) {
				if (frame.start < index) {
					x = Math.max(x, frame.start);
				} else {
					break;
				}
			}
		}
		if (x === -Infinity) {
			for (let i = 0; i < count; i++) {
				const { frames } = contexts[i].layer;
				if (frames.length !== 0) {
					x = Math.max(x, frames[frames.length - 1].start);
				}
			}
		}
		if (x !== -Infinity) {
			this.loadFrames!(x);
		}
	}
};

Animation.nextKeyFrame = function (this: typeof Animation) {
	if (this.player.length <= 1) return;
	const contexts = this.player.contexts;
	const index = this.player.index;
	const y = this.timelineMarquee.y;
	if (y !== -1) {
		let x = -1;
		const { frames } = contexts[y].layer;
		for (const frame of frames) {
			if (frame.start > index) {
				x = frame.start;
				break;
			}
		}
		if (x === -1 && frames.length !== 0) {
			x = frames[0].start;
		}
		if (x !== -1) {
			this.selectMarquee!(x, y, 1, x);
			this.scrollToMarquee!(false);
			this.loadFrames!(x);
		}
	} else {
		let x = Infinity;
		const { count } = contexts;
		for (let i = 0; i < count; i++) {
			const { frames } = contexts[i].layer;
			for (const frame of frames) {
				if (frame.start > index) {
					x = Math.min(x, frame.start);
					break;
				}
			}
		}
		if (x === Infinity) {
			for (let i = 0; i < count; i++) {
				const { frames } = contexts[i].layer;
				if (frames.length !== 0) {
					x = Math.min(x, frames[0].start);
				}
			}
		}
		if (x !== Infinity) {
			this.loadFrames!(x);
		}
	}
};

Animation.setSpeed = (function IIFE() {
	return function (this: typeof Animation, speed: number) {
		getAnimationStore().speed = speed;
	};
})();

Animation.setZoom = (function IIFE() {
	return function (this: typeof Animation, zoom: number) {
		if (getAnimationStore().zoom !== zoom) {
			let scale;
			switch (zoom) {
				case 0:
					scale = 0.25;
					break;
				case 1:
					scale = 0.5;
					break;
				case 2:
					scale = 1;
					break;
				case 3:
					scale = 2;
					break;
				case 4:
					scale = 4;
					break;
				case 5:
					scale = 8;
					break;
				case 6:
					scale = 16;
					break;
				default:
					return;
			}
			getAnimationStore().zoom = zoom;
			if (getAnimationStore().state === 'open') {
				const timer = this.zoomTimer;
				timer.start = this.scale;
				timer.end = scale;
				timer.elapsed = 0;
				timer.add();
			} else {
				this.scale = scale;
			}
		}
	};
})();

Animation.setHover = function (this: typeof Animation, hover: AnimationFrame | null) {
	if (this.hover !== hover) {
		this.hover = hover;
		this.requestRendering!();
	}
};

Animation.setMotion = function (this: typeof Animation, motion: AnimationMotion | null) {
	if (getAnimationStore().motion !== motion) {
		getAnimationStore().motion = motion;
		this.updateMotionItem!();
		this.createDirItems!();
		this.stop!();
		this.stopAnimation!();
		this.stopPlayingSound!();
		this.requestRendering!();
		this.player.destroyUpdatingEmitters();
		if (motion) {
			show(this.timeline);
			this.timeline.updateHead();
			Curve.open!();
			this.setDirection!(getAnimationStore().direction ?? 0);
		} else {
			this.layers = null;
			hide(this.timeline);
			clear(this.layerList);
			clear(this.innerTimelineList);
			this.updatePlayerMotion!();
			this.unselectMarquee!();
			Inspector.close!();
			Curve.close!();
		}
	}
};

Animation.setMotionMode = function (this: typeof Animation, mode: string) {
	if (!getAnimationStore().motion) return;
	const dirCases = getAnimationStore().motion!.dirCases!;
	this.history.save({
		type: 'animation-motion-mode-change',
		motion: getAnimationStore().motion,
		direction: getAnimationStore().direction,
		mode: getAnimationStore().motion!.mode,
		dirCases: dirCases.slice()
	});
	getAnimationStore().motion!.mode = mode;
	const dirs = this.dirTags[mode];
	const length = dirs.length;
	for (let i = dirCases.length; i < length; i++) {
		dirCases[i] = Inspector.animMotion.createDir();
	}
	if (dirCases.length > length) {
		dirCases.length = length;
	}
};

Animation.setDirection = function (this: typeof Animation, direction: number) {
	if (!getAnimationStore().motion) return;
	const dirCases = getAnimationStore().motion!.dirCases!;
	const dirIndex = Math.min(direction, dirCases.length - 1);
	const dirCase = getAnimationStore().motion!.dirCases![dirIndex];
	getAnimationStore().direction = dirIndex;
	this.layers = dirCase.layers;
	this.updatePlayerMotion!();
	this.contextLoaded = false;
	this.layerList.update();
	this.dirList.setDirDirection?.(dirIndex);
	// 标记动作对象为已加载状态 - 以便销毁元素
	if (dirCase.loaded === undefined) {
		Object.defineProperty(dirCase, 'loaded', {
			configurable: true,
			value: true
		});
	}
};

Animation.createDirItems = function (this: typeof Animation) {
	const dirList = this.dirList;
	const motion = getAnimationStore().motion;
	const mode = motion?.mode ?? 'none';
	// 当动作模式发生变化时，更新方向选项
	if (dirList.mode !== mode) {
		dirList.mode = mode;
		const dirs = this.dirTags[mode] ?? [];
		dirList.setDirItems?.(dirs, getAnimationStore().direction);
	}
};

Animation.editMotion = function (this: typeof Animation, motion: AnimationMotion) {
	const proxy = {
		read() {
			return motion.id;
		},
		input(id: string) {
			if (motion.id !== id) {
				Animation.history.save({
					type: 'animation-motion-id-change',
					motion: motion,
					id: motion.id
				});
				motion.id = id;
				Animation.planToSave!();
				Animation.requestRefreshingList!();
			}
		}
	};
	Enum.open!(proxy, 'string');
};

Animation.getNewMotionId = function (this: typeof Animation, callback: (id: string) => void) {
	const proxy = {
		read() {
			return '';
		},
		input(id: string) {
			callback(id);
		}
	};
	Enum.open!(proxy, 'string');
};

Animation.revealTarget = (function IIFE() {
	const timer = new Timer({
		duration: 200,
		update: (timer: Timer) => {
			const { target } = timer;
			if (target === getAnimationStore().target) {
				const easing = Easing.EasingMap.easeInOut;
				const time = easing.ease(timer.elapsed / timer.duration);
				const x = timer.startX * (1 - time) + timer.endX * time;
				const y = timer.startY * (1 - time) + timer.endY * time;
				const screen = Animation.screen;
				const sl = screen.scrollLeft;
				const st = screen.scrollTop;
				Animation.updateCamera!(x, y);
				Animation.updateTransform!();
				if (screen.scrollLeft !== sl || screen.scrollTop !== st) {
					Animation.requestRendering!();
					Animation.marquee.resize();
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
	return function (this: typeof Animation) {
		const target = getAnimationStore().target;
		if (target && !timer.target) {
			const matrix = GL.matrix.reset().multiply(this.targetContext.matrix);
			const x = matrix[6];
			const y = matrix[7];
			const toleranceX = 0.5 / this.scaleX;
			const toleranceY = 0.5 / this.scaleY;
			const { centerX, centerY } = this;
			// 目标和摄像机的位置不一定相等
			if (Math.abs(x - centerX) > toleranceX || Math.abs(y - centerY) > toleranceY) {
				timer.target = target;
				timer.startX = centerX;
				timer.startY = centerY;
				timer.endX = x;
				timer.endY = y;
				timer.elapsed = 0;
				timer.add();
			}
		}
	};
})();

Animation.shiftTarget = function (this: typeof Animation, x: number, y: number) {
	const context = this.targetContext;
	const target = getAnimationStore().target;
	if (context !== null && target !== null) {
		this.planToSave!();
		const map = this.inspectorTypeMap;
		const key = map[context.layer.class];
		const editor = Inspector[key];
		const history = this.history;
		const index = history.index;
		const length = history.length;
		const record = history[index];
		const type = 'animation-target-shift';
		if (
			index !== length - 1 ||
			record === undefined ||
			record.type !== type ||
			record.target !== target
		) {
			history.save({
				type: type,
				editor: editor,
				motion: getAnimationStore().motion,
				direction: getAnimationStore().direction,
				target: target,
				x: target.x,
				y: target.y
			});
		}
		target.x = x;
		target.y = y;
		this.updateFrameContexts!();
		this.requestRendering!();

		if (editor.target === target) {
			write(editor, { x, y });
		}
	}
};

Animation.resizeTarget = function (this: typeof Animation, scaleX: number, scaleY: number) {
	const context = this.targetContext;
	const target = getAnimationStore().target;
	if (context !== null && target !== null) {
		this.planToSave!();
		const map = this.inspectorTypeMap;
		const key = map[context.layer.class];
		const editor = Inspector[key];
		const history = this.history;
		const index = history.index;
		const length = history.length;
		const record = history[index];
		const type = 'animation-target-resize';
		if (
			index !== length - 1 ||
			record === undefined ||
			record.type !== type ||
			record.target !== target
		) {
			history.save({
				type: type,
				editor: editor,
				motion: getAnimationStore().motion,
				direction: getAnimationStore().direction,
				target: target,
				scaleX: target.scaleX,
				scaleY: target.scaleY
			});
		}
		if (scaleX !== undefined) {
			target.scaleX = scaleX;
		}
		if (scaleY !== undefined) {
			target.scaleY = scaleY;
		}
		this.updateFrameContexts!();
		this.requestRendering!();

		if (editor.target === target) {
			write(editor, { scaleX, scaleY });
		}
	}
};

Animation.rotateTarget = function (this: typeof Animation, rotation: number) {
	const context = this.targetContext;
	const target = getAnimationStore().target;
	if (context !== null && target !== null) {
		this.planToSave!();
		const map = this.inspectorTypeMap;
		const key = map[context.layer.class];
		const editor = Inspector[key];
		const history = this.history;
		const index = history.index;
		const length = history.length;
		const record = history[index];
		const type = 'animation-target-rotate';
		if (
			index !== length - 1 ||
			record === undefined ||
			record.type !== type ||
			record.target !== target
		) {
			history.save({
				type: type,
				editor: editor,
				motion: getAnimationStore().motion,
				direction: getAnimationStore().direction,
				target: target,
				rotation: target.rotation
			});
		}
		target.rotation = rotation;
		this.updateFrameContexts!();
		this.requestRendering!();

		if (editor.target === target) {
			write(editor, { rotation });
		}
	}
};

Animation.setControlPoint = function (
	this: typeof Animation,
	point: { x: number; y: number; angle: number } | null
) {
	if (this.controlPointActive !== point) {
		this.controlPointActive = point;
		const points = this.controlPoints;
		let cursor;
		switch (point) {
			case null:
				cursor = '';
				break;
			case points.jointRotate:
			case points.rectRotate.TL:
			case points.rectRotate.TR:
			case points.rectRotate.BL:
			case points.rectRotate.BR:
				cursor = 'alias';
				break;
			case points.rectResize.T:
			case points.rectResize.L:
			case points.rectResize.R:
			case points.rectResize.B:
			case points.rectResize.TL:
			case points.rectResize.TR:
			case points.rectResize.BL:
			case points.rectResize.BR: {
				const angle = Math.modDegrees(point!.angle + this.controlPointRotation, 180);
				if (angle < 22.5 || angle >= 157.5) {
					cursor = 'ew-resize';
				} else if (angle < 67.5) {
					cursor = 'nwse-resize';
				} else if (angle < 112.5) {
					cursor = 'ns-resize';
				} else {
					cursor = 'nesw-resize';
				}
				if (getAnimationStore().mirror)
					switch (cursor) {
						case 'nwse-resize':
							cursor = 'nesw-resize';
							break;
						case 'nesw-resize':
							cursor = 'nwse-resize';
							break;
					}
				break;
			}
		}
		(this.body as HTMLElement).style.cursor = cursor ?? '';
	}
};

Animation.updateMotion = function (this: typeof Animation) {
	const item = read(this.list);
	if (item !== getAnimationStore().motion) {
		this.setMotion!(item);
	}
};

Animation.updateMotionItem = function (this: typeof Animation) {
	const motion = getAnimationStore().motion;
	if (motion !== null) {
		const { list } = this;
		if (read(list) !== motion) {
			list.selectWithNoEvent(motion);
		}
	}
};

Animation.updateTarget = function (this: typeof Animation) {
	if (getAnimationStore().target !== null) {
		const { layer } = this.timelineMarquee;
		if (read(this.layerList) !== layer) {
			this.unselectMarquee!();
		}
	}
};

Animation.updateTargetContext = function (this: typeof Animation) {
	const target = getAnimationStore().target;
	if (target !== null) {
		const { contexts } = this.player;
		const { count } = contexts;
		for (let i = 0; i < count; i++) {
			const context = contexts[i];
			if (context.frame === target) {
				this.targetContext = context;
				return;
			}
		}
	}
	this.targetContext = null;
};

Animation.updatePlayerMotion = function (this: typeof Animation) {
	this.player.motion = getAnimationStore().motion;
	this.player.direction = getAnimationStore().direction;
	this.player.layers = this.layers;
};

Animation.updateFrameContexts = function (this: typeof Animation) {
	const player = this.player;
	const fi = player.index;
	player.updateFrameParameters(player.contexts, fi);
	if (getAnimationStore().showOnionskin) {
		const { length } = player;
		if (length <= 1) return;
		let pi = fi - 1;
		let ni = fi + 1;
		if (getAnimationStore().loop) {
			pi += length;
			pi %= length;
			ni %= length;
		}
		const { prev, next } = player.onionskin;
		player.updateFrameParameters(prev, pi);
		player.updateFrameParameters(next, ni);
	}
};

Animation.updateSoundContexts = function (this: typeof Animation) {
	const player = this.player;
	const index = Math.floor(player.index);
	const contexts = player.contexts;
	const count = contexts.count;
	for (let i = 0; i < count; i++) {
		const context = contexts[i];
		const layer = context.layer;
		if (layer.class === 'sound') {
			const frame = Animation.getFrame!(layer.frames, index);
			// 如果当前帧是关键帧且未播放过，则播放动画音效
			if (frame && frame.start === index && context.version !== index) {
				context.version = index;
				if (frame.sound) {
					AudioManager.se!.play(frame.sound, frame.volume);
				}
			}
		}
	}
};

Animation.resetSoundContexts = function (this: typeof Animation) {
	const player = this.player;
	const contexts = player.contexts;
	const count = contexts.count;
	for (let i = 0; i < count; i++) {
		const context = contexts[i];
		const layer = context.layer;
		if (layer.class === 'sound') {
			context.version = undefined;
		}
	}
};

Animation.stopPlayingSound = function (this: typeof Animation) {
	AudioManager.se?.stop();
};

Animation.updateControlPoints = function (this: typeof Animation, context: AnimationContext) {
	let L, T, R, B;
	const { layer, frame } = context;
	switch (layer.class) {
		case 'sprite': {
			const key = layer.sprite;
			const texture = this.player.textures[key];
			if (texture instanceof ImageTexture) {
				L = -(texture.width * context.anchorX + context.pivotX);
				T = -(texture.height * context.anchorY + context.pivotY);
				R = L + texture.width;
				B = T + texture.height;
			}
			break;
		}
		case 'particle': {
			const emitter = context.emitter;
			if (emitter !== undefined) {
				const rect = emitter.calculateOuterRect();
				emitter.hasArea = rect.hasArea;
				emitter.outerLeft = rect.left;
				emitter.outerTop = rect.top;
				emitter.outerRight = rect.right;
				emitter.outerBottom = rect.bottom;
				emitter.outerWidth = rect.width;
				emitter.outerHeight = rect.height;
				L = rect.left * emitter.scale;
				T = rect.top * emitter.scale;
				R = rect.right * emitter.scale;
				B = rect.bottom * emitter.scale;
			}
			break;
		}
	}
	if (L === undefined || T === undefined || R === undefined || B === undefined) {
		this.controlPointVisible = false;
		return false;
	}
	const POINT_RADIUS = 4 / this.scale;
	const points = this.controlPoints;
	const matrix = context.matrix;
	const a = matrix[0];
	const b = matrix[1];
	const c = matrix[3];
	const d = matrix[4];
	const e = matrix[6];
	const f = matrix[7];
	const x1 = a * L + c * T + e;
	const y1 = b * L + d * T + f;
	const x2 = a * L + c * B + e;
	const y2 = b * L + d * B + f;
	const x3 = a * R + c * B + e;
	const y3 = b * R + d * B + f;
	const x4 = a * R + c * T + e;
	const y4 = b * R + d * T + f;
	const angle1 = Math.atan2(y1 - y2, x1 - x2);
	const angle2 = Math.atan2(y2 - y3, x2 - x3);
	const angle3 = Math.atan2(y3 - y4, x3 - x4);
	const angle4 = Math.atan2(y4 - y1, x4 - x1);
	const ox1 = -Math.cos(angle3) * POINT_RADIUS;
	const oy1 = Math.sin(angle1) * POINT_RADIUS;
	const ox2 = -Math.cos(angle4) * POINT_RADIUS;
	const oy2 = Math.sin(angle2) * POINT_RADIUS;
	const ox3 = Math.cos(angle3) * POINT_RADIUS;
	const oy3 = Math.sin(angle3) * POINT_RADIUS;
	const ox4 = Math.cos(angle4) * POINT_RADIUS;
	const oy4 = Math.sin(angle4) * POINT_RADIUS;

	const { rectRotate } = points;
	rectRotate.TL.x = x1 + (ox1 - ox4) * 3;
	rectRotate.TL.y = y1 + (oy1 - oy4) * 3;
	rectRotate.TR.x = x4 + (ox4 - ox3) * 3;
	rectRotate.TR.y = y4 + (oy4 - oy3) * 3;
	rectRotate.BL.x = x2 + (ox2 - ox1) * 3;
	rectRotate.BL.y = y2 + (oy2 - oy1) * 3;
	rectRotate.BR.x = x3 + (ox3 - ox2) * 3;
	rectRotate.BR.y = y3 + (oy3 - oy2) * 3;
	const { rectResize } = points;
	rectResize.T.x = (x4 + x1) / 2 + ox1;
	rectResize.T.y = (y4 + y1) / 2 + oy1;
	rectResize.L.x = (x1 + x2) / 2 + ox2;
	rectResize.L.y = (y1 + y2) / 2 + oy2;
	rectResize.R.x = (x3 + x4) / 2 + ox4;
	rectResize.R.y = (y3 + y4) / 2 + oy4;
	rectResize.B.x = (x2 + x3) / 2 + ox3;
	rectResize.B.y = (y2 + y3) / 2 + oy3;
	rectResize.TL.x = x1 + ox1 - ox4;
	rectResize.TL.y = y1 + oy1 - oy4;
	rectResize.TR.x = x4 + ox4 - ox3;
	rectResize.TR.y = y4 + oy4 - oy3;
	rectResize.BL.x = x2 + ox2 - ox1;
	rectResize.BL.y = y2 + oy2 - oy1;
	rectResize.BR.x = x3 + ox3 - ox2;
	rectResize.BR.y = y3 + oy3 - oy2;
	let rotation = frame.rotation!;
	let node: AnimationContext | null = context;
	while ((node = node.parent)) {
		const frame = node.frame;
		if (frame !== null) {
			rotation += frame.rotation!;
		}
	}
	this.controlPointRotation = rotation;
	this.controlPointVisible = true;
	return true;
};

Animation.updateHead = function (this: typeof Animation) {
	const { page, head } = this;
	if (page.clientWidth !== 0) {
		const { nav } = Layout.getGroupOfElement(head);
		const nRect = rect(nav);
		const iRect = rect(nav.lastChild as HTMLElement);
		const left = iRect.right - nRect.left;
		head.style.left = `${left}px`;
		const width = nRect.right - iRect.right;
		if (head.width !== width) {
			head.width = width;
			const [start, center, end] = head.children;
			(end as HTMLElement).style.marginLeft = '';
			const sRect = rect(start as HTMLElement);
			const cRect = rect(center as HTMLElement);
			const eRect = rect(end as HTMLElement);
			const spacing = eRect.left - sRect.right - cRect.width;
			const difference = sRect.right - nRect.left - eRect.width;
			const margin = Math.min(spacing, difference);
			(end as HTMLElement).style.marginLeft = `${margin}px`;
		}
	}
};

Animation.resize = function (this: typeof Animation) {
	if (getAnimationStore().state === 'open' && this.screen.clientWidth !== 0) {
		const scale = this.scale;
		const screenBox = CSS.getDevicePixelContentBoxSize(this.screen);
		const screenWidth = screenBox.width;
		const screenHeight = screenBox.height;
		const stageWidth = screenWidth + this.padding;
		const stageHeight = screenHeight + this.padding;
		const innerWidth = Math.round(stageWidth * scale);
		const innerHeight = Math.round(stageHeight * scale);
		const outerWidth = Math.max(screenWidth, innerWidth);
		const outerHeight = Math.max(screenHeight, innerHeight);
		const dpr = window.devicePixelRatio;
		this.outerWidth = outerWidth;
		this.outerHeight = outerHeight;
		this.centerOffsetX = screenWidth / 2;
		this.centerOffsetY = screenHeight / 2;
		this.scaleX = innerWidth / stageWidth;
		this.scaleY = innerHeight / stageHeight;
		this.marquee.style.width = `${outerWidth / dpr}px`;
		this.marquee.style.height = `${outerHeight / dpr}px`;
		GL.resize!(screenWidth, screenHeight);
		this.updateCamera!();
		this.updateTransform!();
		this.marquee.resize();
	}
};

Animation.getPointerCoords = (function IIFE() {
	const point = { x: 0, y: 0 };
	return function (this: typeof Animation, event: PointerEvent) {
		const coords = getRelativeCoords(event, this.marquee);
		const dpr = window.devicePixelRatio;
		point.x = (coords.x * dpr - (this.outerWidth >> 1)) / this.scaleX;
		point.y = (coords.y * dpr - (this.outerHeight >> 1)) / this.scaleY;
		if (getAnimationStore().mirror) {
			point.x = -point.x;
		}
		return point;
	};
})();

Animation.getFrameCoords = (function IIFE() {
	const point = { x: 0, y: 0 };
	return function (this: typeof Animation, event: PointerEvent, clamp: boolean = false) {
		const list = this.outerTimelineList;
		const coords = getRelativeCoords(event, list);
		let x = Math.floor(coords.x / ANIM_GRID_X);
		let y = Math.floor(coords.y / ANIM_GRID_Y);
		if (clamp) {
			const sl = list.scrollLeft / ANIM_GRID_X;
			const st = list.scrollTop / ANIM_GRID_Y;
			const sr = list.clientWidth / ANIM_GRID_X + sl;
			const sb = list.clientHeight / ANIM_GRID_Y + st;
			x = Math.clamp(x, Math.floor(sl), Math.ceil(sr) - 1);
			y = Math.clamp(y, Math.floor(st), Math.ceil(sb) - 1);
		}
		point.x = x;
		point.y = y;
		return point;
	};
})();

Animation.getKeyFrame = function (this: typeof Animation, x: number, y: number) {
	if (this.timelineMarquee.isPointIn(x, y)) {
		const { layer, x: sx, length } = this.timelineMarquee;
		const ex = sx + length;
		for (const frame of layer.frames) {
			const start = frame.start;
			const end = frame.end;
			if (sx >= end) continue;
			if (ex <= start) break;
			// 如果指向第一个关键帧则返回有效帧
			return x === start ? frame : null;
		}
	}
	return null;
};

Animation.getLayerIndex = function (this: typeof Animation, layer: AnimationLayer) {
	const timelines = this.innerTimelineList.childNodes;
	const length = timelines.length;
	for (let i = 0; i < length; i++) {
		if ((timelines[i] as HTMLElement & { layer?: unknown }).layer === layer) {
			return i;
		}
	}
	return -1;
};

Animation.getMotionListItems = function (this: typeof Animation, animationId: string) {
	const animations = Data.animations;
	if (!animations) {
		return [
			{
				name: t('common.none'),
				value: ''
			}
		];
	}
	const motions = animations[animationId]?.motions;
	if (!motions)
		return [
			{
				name: t('common.none'),
				value: ''
			}
		];

	if (!('listItems' in motions)) {
		Object.defineProperty(motions, 'listItems', {
			writable: true,
			value: undefined
		});
	}
	const items: { name: string; value: string }[] = [];
	const flags = {} as Record<string, boolean>;
	for (const motion of motions) {
		const enumId = motion.id;
		if (enumId in flags) continue;
		flags[enumId] = true;
		const name = Enum.getString!(enumId)?.name ?? Command.parseUnlinkedId!(enumId);
		items.push({
			name: GameLocal.replace!(name),
			value: enumId
		});
	}
	if (items.length === 0) {
		items.push({
			name: t('common.none'),
			value: ''
		});
	}
	return items;
};

Animation.getSpriteListItems = function (this: typeof Animation, animationId: string) {
	const animations = Data.animations;
	if (!animations) return [{ name: 'No Image', value: '' }];
	const sprites = animations[animationId]?.sprites;
	if (!sprites) return [{ name: 'No Image', value: '' }];

	if (!('listItems' in sprites)) {
		Object.defineProperty(sprites, 'listItems', {
			writable: true,
			value: undefined
		});
	}
	let items = sprites.listItems;
	if (items === undefined) {
		const length = sprites.length;
		const digits = Number.computeIndexDigits(length);
		items = Array.from({ length: length + 1 });
		items[0] = { name: 'No Image', value: '' };
		for (let i = 0; i < length; i++) {
			const index = i.toString().padStart(digits, '0');
			const sprite = sprites[i];
			items[i + 1] = {
				name: `${index}:${sprite.name}`,
				value: sprite.id
			};
		}
		sprites.listItems = items;
	}
	return items;
};

Animation.updateRuler = function (this: typeof Animation) {
	const { outerRuler, innerRuler } = this;
	const width = outerRuler.clientWidth;
	if (width !== 0) {
		const length = Math.ceil((width + 16) / 80) + 1;
		const nodes = innerRuler.childNodes;
		let i = nodes.length;
		if (i !== length) {
			if (i < length) {
				const start = innerRuler.start ?? 0;
				let number = (start + i) * 5;
				while (i < length) {
					const node = document.createElement('div');
					addClass(node, 'box');
					addClass(node, 'timeline-number');
					node.textContent = number.toString();
					innerRuler.appendChild(node);
					number += 5;
					i++;
				}
			} else {
				while (--i >= length) {
					nodes[i].remove();
				}
			}
		}
	}
};

Animation.updateTimeline = function (this: typeof Animation) {
	Animation.createTimelines!();

	Animation.updateTimelineLength!();

	Animation.updateMarquee!();

	Animation.updatePointerArea!();

	Animation.loadFrames!(Animation.player.index, true);
};

Animation.updateTimelineLength = function (this: typeof Animation) {
	this.player.computeLength();
	const end = this.player.length;
	const max = Math.floor(end / 100 + 1) * 100;
	if (this.frameMax !== max) {
		this.frameMax = max;
		this.innerTimelineList.style.width = this.innerPointerArea.style.width = `${max * 16}px`;
	}
};

Animation.updatePointerArea = function (this: typeof Animation) {
	const list = this.outerTimelineList;
	const area = this.outerPointerArea;
	if (list.clientWidth !== 0) {
		if (list.clientWidth < list.scrollWidth) addClass(area, 'has-horiz-scrollbar');
		else removeClass(area, 'has-horiz-scrollbar');
		if (list.clientHeight < list.scrollHeight) addClass(area, 'has-vert-scrollbar');
		else removeClass(area, 'has-vert-scrollbar');
	}
};

Animation.updatePointer = function (this: typeof Animation) {
	const x = Math.floor(this.player.index);
	const { pointer } = this;
	if (pointer.x !== x) {
		pointer.x = x;
		pointer.style.left = `${x * 16}px`;
	}
};

Animation.updateCursor = function (this: typeof Animation, x: number, y: number) {
	const { timelineCursor } = this;
	if (timelineCursor.x !== x || timelineCursor.y !== y) {
		timelineCursor.x = x;
		timelineCursor.y = y;
		if (x !== -1) {
			timelineCursor.style.left = `${x * 16}px`;
			timelineCursor.style.top = `${y * 20}px`;
			show(timelineCursor);
		} else {
			hide(timelineCursor);
		}
	}
};
