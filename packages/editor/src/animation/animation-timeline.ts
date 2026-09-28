import { Animation } from './animation-window.ts';
import { createDetachedElement } from '@app/utils/dom';
import type {
	AnimationFrame,
	AnimationLayer,
	AnimationContext,
	AnimationMarquee,
	AnimationFrameData
} from './animation-window.ts';
import { addClass, clear, hide, removeClass, show, write } from '@app/utils/element-utils.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { ImageTexture } from '@app/engine/webgl/image-texture.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';
import { getAnimationStore } from '@app/stores/animation';
import { GlobalClipboard } from '@app/utils/clipboard';
import { elementDataOf } from '@app/utils/element-data';
import { clamp, dist as mathDist } from '@app/utils/math';
import { clone as deepClone } from '@app/utils/object';
import { empty as fnEmpty } from '@app/utils/function';

const Clipboard = GlobalClipboard;

/**
 * 时间轴选框（`Animation.timelineMarquee`）的元素数据视图。
 * `origin` 是本次多选/框选的锚点帧号（`selectMarquee` 写入，扩展选择时用来判断方向）。
 */
interface TimelineMarqueeElementData {
	origin: number;
}

const marqueeData = (el: unknown): TimelineMarqueeElementData =>
	elementDataOf<TimelineMarqueeElementData>(el);

Animation.selectFrame = function (
	this: typeof Animation,
	frame: AnimationFrame | null,
	fStart?: number,
	fLength?: number
) {
	if (!frame) {
		return this.unselectMarquee!();
	}
	let layer;
	const { contexts } = this.player;
	const { count } = contexts;
	for (let i = 0; i < count!; i++) {
		const sLayer = contexts[i].layer;
		if (sLayer.frames.includes(frame)) {
			layer = sLayer;
			break;
		}
	}
	if (!layer) {
		return;
	}
	this.layerList.expandToItem(layer);
	if (Inspector.animSpriteFrame.target !== frame) {
		const list = this.innerTimelineList;
		const timelines = list.childNodes;
		const length = timelines.length;
		for (let y = 0; y < length; y++) {
			if ((timelines[y] as HTMLElement & { layer?: AnimationLayer }).layer === layer) {
				const x = fStart ?? frame.start;
				const w = fLength ?? 1;
				const i = this.player.index;
				this.selectMarquee!(x, y, w, x);
				this.scrollToMarquee!(false);
				if (i < x || i >= x + w) {
					this.loadFrames!(x);
				}
			}
		}
	}
};

Animation.selectMarquee = function (
	this: typeof Animation,
	x: number,
	y: number,
	length: number,
	origin: number | undefined
) {
	this.stop!();
	const timelines = this.innerTimelineList.childNodes;
	const ex = this.frameMax;
	const ey = timelines.length;
	if (x >= 0 && x + length <= ex && y >= 0 && y < ey) {
		const { layer } = timelines[y] as HTMLElement & { layer?: AnimationLayer };
		const marquee = this.timelineMarquee as typeof this.timelineMarquee & {
			layer: AnimationLayer;
		};
		if (marquee.layer !== layer || marquee.x !== x || marquee.length !== length) {
			marquee.layer = layer!;
			marquee.x = x;
			marquee.length = length;
			this.updateMarquee!();

			this.openFrame!();

			this.layerList.selectWithNoEvent(layer);
		}
		if (origin !== undefined) {
			marqueeData(marquee).origin = origin;
		}
	}
};

Animation.unselectMarquee = function (
	this: typeof Animation,
	frame?: AnimationFrame | Record<string, unknown> | null
) {
	const marquee = this.timelineMarquee as typeof this.timelineMarquee & {
		layer: AnimationLayer | null;
	};
	if (frame !== undefined ? getAnimationStore().target === frame : marquee.layer !== null) {
		marquee.layer = null;
		if (getAnimationStore().target !== null) {
			getAnimationStore().target = null;
			this.updateTargetContext!();
			this.requestRendering!();
			Inspector.close!();
		}
		marquee.x = -1;
		marquee.length = -1;
		marqueeData(marquee).origin = -1;
		this.updateMarquee!();
	}
};

Animation.updateMarquee = function (this: typeof Animation) {
	const marquee = this.timelineMarquee as typeof this.timelineMarquee & { layer: AnimationLayer };
	const { layer } = marquee;
	if (layer !== null) {
		const y = this.getLayerIndex!(layer);
		if (y !== -1) {
			const { x, length } = marquee;
			marquee.y = y;
			marquee.style.left = `${x * 16}px`;
			marquee.style.top = `${y * 20}px`;
			marquee.style.width = `${length * 16}px`;
			show(marquee);
			return;
		}
	}
	marquee.y = -1;
	hide(marquee);
};

Animation.scrollToMarquee = function (this: typeof Animation, shiftKey: boolean) {
	const { x, y, length } = this.timelineMarquee as typeof this.timelineMarquee & {
		layer: AnimationLayer;
	};
	const origin = marqueeData(this.timelineMarquee).origin;
	if (y !== -1) {
		const list = this.outerTimelineList;
		const left = list.scrollLeft;
		const min = x * 16 + length * 16 - list.clientWidth;
		const max = x * 16;
		const scrollLeft =
			shiftKey && x === origin && length > 1
				? Math.max(Math.min(left, max), min)
				: Math.min(Math.max(left, min), max);
		const scrollTop = clamp(list.scrollTop, y * 20 + 20 - list.clientHeight, y * 20);
		if (list.scrollLeft !== scrollLeft) {
			list.scrollLeft = scrollLeft;
		}
		if (list.scrollTop !== scrollTop) {
			list.scrollTop = scrollTop;
		}
	}
};

Animation.updateMarqueeShift = function (
	this: typeof Animation,
	x: number,
	y: number,
	length?: number
) {
	const timelines = this.innerTimelineList.childNodes;
	const marquee = this.timelineMarqueeShift;
	marquee.layer =
		(timelines[y] as (HTMLElement & { layer?: AnimationLayer }) | undefined)?.layer ?? null;
	if (marquee.x !== x) {
		marquee.x = x;
		marquee.style.left = `${x * 16}px`;
	}
	if (marquee.y !== y) {
		marquee.y = y;
		marquee.style.top = `${y * 20}px`;
	}
	if (length !== undefined && marquee.length !== length) {
		marquee.length = length;
		marquee.style.width = `${length * 16}px`;
	}
};

Animation.selectFrameRelative = function (this: typeof Animation, direction: string) {
	const marquee = this.timelineMarquee as typeof this.timelineMarquee & { layer: AnimationLayer };
	if (marquee.y === -1) {
		return;
	}
	let { x, y, length } = marquee;
	switch (direction) {
		case 'left':
			x = length > 1 ? x : x - 1;
			break;
		case 'up':
			y = Math.max(y - 1, 0);
			break;
		case 'right':
			x = length > 1 ? x + length - 1 : x + 1;
			break;
		case 'down': {
			const list = this.innerTimelineList;
			const ey = list.childNodes.length;
			y = Math.min(y + 1, ey - 1);
			break;
		}
	}
	this.selectMarquee!(x, y, 1, x);
	this.scrollToMarquee!(false);
	this.loadFrames!(x);
};

Animation.selectFrameAtHomeEnd = function (this: typeof Animation, direction: string) {
	const marquee = this.timelineMarquee as typeof this.timelineMarquee & { layer: AnimationLayer };
	if (marquee.y === -1) {
		return;
	}
	let { layer, x, y, length } = marquee;
	const frames = layer.frames;
	const fLength = frames.length;
	switch (direction) {
		case 'home':
			if (fLength !== 0) {
				const head = frames[0].start;
				x = x !== head || length !== 1 ? head : 0;
			} else {
				x = 0;
			}
			break;
		case 'end':
			if (fLength !== 0) {
				const foot = frames[fLength - 1].end - 1;
				x = x !== foot || length !== 1 ? foot : this.frameMax - 1;
			} else {
				x = this.frameMax - 1;
			}
			break;
	}
	this.selectMarquee!(x, y, 1, x);
	this.scrollToMarquee!(false);
	this.loadFrames!(x);
};

Animation.selectAllFramesOfKey = function (this: typeof Animation) {
	const marquee = this.timelineMarquee as typeof this.timelineMarquee & { layer: AnimationLayer };
	if (marquee.y === -1) {
		return;
	}
	const { layer, y } = marquee;
	const origin = marqueeData(marquee).origin;
	for (const frame of layer.frames) {
		const start = frame.start;
		const end = frame.end;
		if (origin >= end) continue;
		if (origin < start) break;
		this.selectMarquee!(start, y, end - start, origin);
		this.scrollToMarquee!(false);
		return;
	}
};

Animation.multiSelectFramesRelative = function (this: typeof Animation, direction: string) {
	const marquee = this.timelineMarquee as typeof this.timelineMarquee & { layer: AnimationLayer };
	if (marquee.y === -1) {
		return;
	}
	let { x, y, length } = marquee;
	const origin = marqueeData(marquee).origin;
	const forward = x === origin;
	switch (direction) {
		case 'left':
			if (forward && length > 1) {
				length--;
			} else {
				x--;
				length++;
			}
			break;
		case 'right':
			if (forward) {
				length++;
			} else {
				x++;
				length--;
			}
			break;
	}
	this.selectMarquee!(x, y, length);
	this.scrollToMarquee!(true);
	this.loadFrames!(forward ? x + length - 1 : x);
};

Animation.multiSelectFramesToHomeEnd = function (this: typeof Animation, direction: string) {
	const marquee = this.timelineMarquee as typeof this.timelineMarquee & { layer: AnimationLayer };
	if (marquee.y === -1) {
		return;
	}
	let { layer, x, y, length } = marquee;
	const origin = marqueeData(marquee).origin;
	const frames = layer.frames;
	const fLength = frames.length;
	switch (direction) {
		case 'home':
			if (fLength !== 0) {
				const head = frames[0].start;
				x = x === origin ? x + length - 1 : x;
				x = x !== head ? head : 0;
			} else {
				x = 0;
			}
			break;
		case 'end':
			if (fLength !== 0) {
				const foot = frames[fLength - 1].end - 1;
				x = x === origin ? x + length - 1 : x;
				x = x !== foot ? foot : this.frameMax - 1;
			} else {
				x = this.frameMax - 1;
			}
			break;
	}
	const mx = Math.min(x, origin);
	const mw = Math.abs(x - origin) + 1;
	this.selectMarquee!(mx, y, mw, origin);
	this.scrollToMarquee!(true);
	this.loadFrames!(x);
};

Animation.openFrame = function (this: typeof Animation) {
	const marquee = this.timelineMarquee as typeof this.timelineMarquee & { layer: AnimationLayer };
	const { layer, x } = marquee;
	for (const frame of layer.frames) {
		const start = frame.start;
		const end = frame.end;
		if (x >= end) continue;
		if (x < start) break;
		if (getAnimationStore().target !== frame) {
			getAnimationStore().target = frame;
			this.updateTargetContext!();
			this.requestRendering!();
			const map = this.inspectorTypeMap;
			const key = map[layer.class];
			Inspector.open!(key, frame);
		}
		return;
	}
	if (getAnimationStore().target !== null) {
		getAnimationStore().target = null;
		this.updateTargetContext!();
		this.requestRendering!();
		Inspector.close!();
	}
};

Animation.loadTextures = function (this: typeof Animation) {
	if (getAnimationStore().state === 'closed') return;
	const { floor, max } = Math;
	const player = this.player;
	const last = player.textures;
	const textures: Record<string, ImageTexture> = (player.textures = {});
	for (const sprite of this.sprites) {
		const spriteId = sprite.id;
		const imageId = sprite.image;
		const texture = last![spriteId];
		const { hframes, vframes } = sprite;
		if (texture instanceof ImageTexture && texture.base!.guid === imageId) {
			const { base } = texture;
			const b = base!;
			const width = floor(max(b.width / hframes, 1));
			const height = floor(max(b.height / vframes, 1));
			texture.hframes = hframes;
			texture.vframes = vframes;
			texture.width = width;
			texture.height = height;
			textures[spriteId] = texture;
			this.requestRendering!();
			continue;
		}
		if (imageId) {
			const texture = new ImageTexture(imageId);
			texture.on('load', () => {
				if (player.textures === textures) {
					const { base } = texture;
					const b = base!;
					const width = floor(max(b.width / hframes, 1));
					const height = floor(max(b.height / vframes, 1));
					texture.hframes = hframes;
					texture.vframes = vframes;
					texture.width = width;
					texture.height = height;
					textures[spriteId] = texture;
					this.requestRendering!();
				} else {
					texture.destroy();
				}
			});
		}
	}
	for (const spriteId of Object.keys(last)) {
		const texture = last![spriteId];
		if (texture !== textures[spriteId] && texture instanceof ImageTexture) {
			texture.destroy();
		}
	}
};

Animation.loadFrames = function (this: typeof Animation, index: number, forceReload = false) {
	const player = this.player;
	const fe = player.length;
	const fi = Math.min(Math.max(index, 0), fe - 1);
	if (player.index !== fi || forceReload) {
		player.index = fi;

		this.updateFrameContexts!();

		this.updateTargetContext!();

		this.updatePointer!();

		this.requestRendering!();
	}
};

Animation.createTimelines = (function IIFE() {
	const createTimelines = (layers: AnimationLayer[]) => {
		for (const layer of layers) {
			let { timeline } = layer;
			if (timeline === undefined) {
				// 离屏节点统一走 utils/dom 的唯一创建缝隙
				timeline = createDetachedElement();
				addClass(timeline, 'box');
				addClass(timeline, 'timeline-frames');
				timeline.layer = layer;
				Object.defineProperty(layer, 'timeline', {
					configurable: true,
					value: timeline
				});
			}
			clear(timeline);
			Animation.innerTimelineList.appendChild(timeline);
			const frames = layer.frames;
			const count = frames.length;
			for (let i = 0; i < count; i++) {
				const frame = frames[i];
				const start = frame.start;
				const length = frame.end - start;
				const easing = !!frame.easingId;
				let { key } = frame;
				if (key === undefined) {
					// 同上
					key = createDetachedElement();
					addClass(key, 'box');
					addClass(key, 'timeline-key');
					Object.defineProperty(frame, 'key', {
						configurable: true,
						value: key
					});
				}
				key.style.left = `${start * 16}px`;
				if (length !== 1) {
					addClass(key, 'long');
					key.style.width = `${length * 16}px`;
				} else {
					removeClass(key, 'long');
					key.style.width = '16px';
				}
				if (key.easing !== easing) {
					key.easing = easing;
					if (easing) {
						addClass(key, 'easing');
					} else {
						removeClass(key, 'easing');
					}
				}
				timeline.appendChild(key);
			}
			if (layer.expanded) {
				createTimelines(layer.children);
			}
		}
	};
	return function (this: typeof Animation) {
		clear(this.innerTimelineList);
		createTimelines(this.layers);
	};
})();

Animation.getFrame = function (this: typeof Animation, frames: AnimationFrame[], x: number) {
	const length = frames.length;
	for (let i = 0; i < length; i++) {
		const frame = frames[i];
		const start = frame.start;
		const end = frame.end;
		if (x >= end) continue;
		if (x < start) break;
		return frame;
	}
	return null;
};

Animation.sortFrames = function (this: typeof Animation, frames: AnimationFrame[]) {
	let end = 0;
	const length = frames.length;
	for (let i = 0; i < length; i++) {
		let frame = frames[i];
		const start = frame.start;
		if (start < end) {
			frame = this.cloneFrame!(frames, i);
			frame.start = end;
			frame.end += end - start;
		}
		end = frame.end;
	}
};

Animation.shiftFrames = function (
	this: typeof Animation,
	frames: AnimationFrame[],
	start: number,
	offset: number
) {
	const length = frames.length;
	for (let i = start; i < length; i++) {
		const frame = this.cloneFrame!(frames, i);
		frame.start += offset;
		frame.end += offset;
	}
};

Animation.saveFrames = function (
	this: typeof Animation,
	layers: AnimationLayer[],
	sMarquee: AnimationMarquee,
	dMarquee: AnimationMarquee = sMarquee
) {
	const changes: { layer: AnimationLayer; frames: AnimationFrame[] }[] = [];
	for (const layer of layers) {
		const frames = layer.frames.slice();
		changes.push({ layer, frames });
	}
	this.planToSave!();
	this.history.save({
		type: 'animation-frames-change',
		motion: getAnimationStore().motion,
		direction: getAnimationStore().direction,
		changes: changes,
		sMarquee: sMarquee,
		dMarquee: dMarquee
	});
};

Animation.cloneFrame = function (this: typeof Animation, frames: AnimationFrame[], index: number) {
	const frame = frames[index];
	const clone = (frames[index] = deepClone(frame));
	return Object.defineProperty(clone, 'key', {
		configurable: true,
		value: frame.key
	});
};

Animation.insertFrame = function (this: typeof Animation) {
	const marquee = this.timelineMarquee as typeof this.timelineMarquee & { layer: AnimationLayer };
	if (marquee.y === -1) {
		return;
	}
	const { layer, x, length } = marquee;
	const ex = x + length;
	const frames = layer.frames;
	const fLength = frames.length;
	this.saveFrames!([layer], { layer, x, length });
	for (let i = 0; i < fLength; i++) {
		const frame = frames[i];
		const start = frame.start;
		const end = frame.end;
		if (x >= end) continue;
		if (x > start) {
			const insert = deepClone(frame);
			insert.start = x;
			insert.end = Math.max(ex, end);
			this.cloneFrame!(frames, i).end = x;
			frames.splice(i + 1, 0, insert);
		} else if (x === start) {
			const proto = frames[i - 1] ?? frame;
			const insert = deepClone(proto);
			insert.start = x;
			insert.end = ex;
			frames.splice(i, 0, insert);
		} else {
			if (i !== 0) {
				this.cloneFrame!(frames, i - 1).end = x;
			}
			const insert = deepClone(frame);
			insert.start = x;
			insert.end = ex;
			frames.splice(i, 0, insert);
		}
		this.sortFrames!(frames);
		this.updateTimeline!();
		this.openFrame!();
		return;
	}
	const last = frames[fLength - 1];
	let insert = last;
	if (last) {
		insert = deepClone(last);
	} else {
		const map = this.inspectorTypeMap;
		const key = map[layer.class];
		insert = Inspector[key].create();
	}
	if (last && last.end !== x) {
		this.cloneFrame!(frames, fLength - 1).end = x;
	}
	insert.start = x;
	insert.end = ex;
	frames.push(insert);
	this.updateTimeline!();
	this.loadFrames!(x);
	this.openFrame!();
};

Animation.extendFrame = function (this: typeof Animation) {
	const marquee = this.timelineMarquee as typeof this.timelineMarquee & { layer: AnimationLayer };
	if (marquee.y === -1 || !marquee.isExtendable()) {
		return;
	}
	const { layer, x, y: _y, length } = marquee;
	const ex = x + length;
	const frames = layer.frames;
	const fLength = frames.length;
	this.saveFrames!([layer], { layer, x, length });
	for (let i = 0; i < fLength; i++) {
		const frame = frames[i];
		const start = frame.start;
		const end = frame.end;
		if (x >= end) continue;
		if (x >= start) {
			this.cloneFrame!(frames, i).end += length;
			// const next = frames[i + 1] if (next && frame.end > next.start) { this.shiftFrames!(frames, i + 1, frame.end - next.start) }
		} else {
			if (i === 0) return;
			this.cloneFrame!(frames, i - 1).end = ex;
			// if (ex > start) { this.shiftFrames!(frames, i, ex - start) }
		}
		this.sortFrames!(frames);
		this.updateTimeline!();
		this.openFrame!();
		return;
	}
	if (fLength !== 0) {
		this.cloneFrame!(frames, fLength - 1).end = ex;
		this.updateTimeline!();
		this.openFrame!();
	}
};

Animation.deleteFrame = function (this: typeof Animation, shrink = false) {
	const marquee = this.timelineMarquee as typeof this.timelineMarquee & { layer: AnimationLayer };
	if (marquee.y === -1 || (!shrink && !marquee.isSelected())) {
		return;
	}
	const { layer, x, length } = marquee;
	const ex = x + length;
	const frames = layer.frames;
	let i = frames.length;
	this.saveFrames!([layer], { layer, x, length });
	if (shrink)
		block: {
			while (--i >= 0) {
				const frame = frames[i];
				const start = frame.start;
				if (ex > start) {
					if (x <= start) {
						const end = frame.end;
						const extra = Math.max(end - ex, 0);
						this.shiftFrames!(frames, ++i, -length - extra);
					} else {
						this.shiftFrames!(frames, ++i, -length);
					}
					break block;
				}
			}
			this.shiftFrames!(frames, 0, -length);
		}
	while (--i >= 0) {
		const frame = frames[i];
		const start = frame.start;
		const end = frame.end;
		if (ex <= start) continue;
		if (x >= end) break;
		if (x <= start) {
			frames.splice(i, 1);
		} else {
			this.cloneFrame!(frames, i).end = x + Math.max(end - ex, 0);
		}
	}
	this.updateTimeline!();
	this.openFrame!();
};

Animation.copyFrame = function (this: typeof Animation, returnData = false) {
	const marquee = this.timelineMarquee as typeof this.timelineMarquee & { layer: AnimationLayer };
	if (marquee.y === -1) {
		return;
	}
	let { layer, x, length } = marquee;
	const copies: AnimationFrame[] = [];
	const ex = x + length;
	const frames = layer.frames;
	const fLength = frames.length;
	for (let i = 0; i < fLength; i++) {
		const frame = frames[i];
		const start = frame.start;
		const end = frame.end;
		if (x >= end) continue;
		if (ex <= start) break;
		copies.push(deepClone(frame));
	}
	if (copies.length !== 0) {
		for (const frame of copies) {
			frame.start -= x;
			frame.end -= x;
		}
		// 选中关键帧头部则必要时扩展选框长度 否则裁剪尾部关键帧
		const last = copies[copies.length - 1];
		if (last.start >= 0) {
			length = Math.max(last.end, length);
		} else {
			last.end = Math.min(last.end, length);
		}
		const first = copies[0];
		if (first.start < 0) {
			first.start = 0;
		}
		const data = { copies, length };
		if (returnData) {
			return data;
		}
		Clipboard.write(`yami.animFrame.${layer.class}`, data);
	}
};

Animation.pasteFrame = function (
	this: typeof Animation,
	data: AnimationFrameData | null | undefined,
	destination: AnimationMarquee | null | undefined
) {
	const {
		layer,
		x,
		y,
		length: sLength
	} = destination ??
	(this.timelineMarquee as typeof this.timelineMarquee & { layer: AnimationLayer });
	if (!data) data = Clipboard.read(`yami.animFrame.${layer!.class}`);
	if (!data || y === -1) {
		return;
	}
	const { copies, length: dLength } = data;
	// y 来自文件数据（unknown）——这里按运行期约定收窄一次
	this.selectMarquee!(x, y as number, dLength, x);
	this.saveFrames!([layer], { layer, x, length: sLength }, { layer, x, length: dLength });
	for (const frame of copies) {
		frame.start += x;
		frame.end += x;
	}
	const frames = layer.frames;
	const fLength = frames.length;
	for (let i = 0; i < fLength; i++) {
		const frame = frames[i];
		const start = frame.start;
		const end = frame.end;
		if (x >= end) continue;
		if (x > start) {
			// 插入到关键帧中间 const next = frames[i + 1] if (next && ex > next.start) { this.shiftFrames!(frames, i + 1, ex - next.start) }
			if (x < end) {
				this.cloneFrame!(frames, i).end = x;
			}
			frames.splice(i + 1, 0, ...copies);
		} else if (x === start) {
			// 插入到关键帧之前 this.shiftFrames!(frames, i, dLength)
			frames.splice(i, 0, ...copies);
		} else {
			// 插入到空白帧 if (ex > start) { this.shiftFrames!(frames, i, ex - start) }
			frames.splice(i, 0, ...copies);
		}
		this.sortFrames!(frames);
		this.updateTimeline!();
		this.openFrame!();
		return;
	}
	frames.push(...copies);
	this.updateTimeline!();
	this.loadFrames!(x);
	this.openFrame!();
};

Animation.selectAllFrames = function (this: typeof Animation) {
	const marquee = this.timelineMarquee as typeof this.timelineMarquee & { layer: AnimationLayer };
	if (marquee.y === -1) {
		return;
	}
	const { layer, y } = marquee;
	const { frames } = layer;
	const { length } = frames;
	if (length !== 0) {
		const start = frames[0].start;
		const end = frames[length - 1].end;
		this.selectMarquee!(start, y, end - start, start);
	}
};

Animation.dragAndDropFrame = function (this: typeof Animation) {
	const {
		layer: sLayer,
		x: sx,
		y: sy,
		length
	} = this.timelineMarquee as typeof this.timelineMarquee & { layer: AnimationLayer };
	const {
		layer: dLayer,
		x: dx,
		y: dy
	} = this.timelineMarqueeShift as typeof this.timelineMarqueeShift & { layer: AnimationLayer };
	if (sx !== dx || (sy !== dy && sLayer.class === dLayer.class)) {
		const data = this.copyFrame!(true);
		if (data) {
			const { updateTimeline, openFrame, saveFrames } = this;
			const sMarquee = { layer: sLayer, x: sx, length: length };
			const dMarquee = { layer: dLayer, x: dx, length: 0 };
			const layers = [sLayer];
			layers.push(dLayer);
			this.saveFrames!(layers, sMarquee, dMarquee);
			this.updateTimeline = fnEmpty;
			this.openFrame = fnEmpty;
			this.saveFrames = fnEmpty;
			this.deleteFrame!();
			this.pasteFrame!(data, this.timelineMarqueeShift);
			this.updateTimeline = updateTimeline;
			this.openFrame = openFrame;
			this.saveFrames = saveFrames;
			this.player.index = dx;
			this.updateTimeline!();
			this.openFrame!();
			dMarquee.length = this.timelineMarquee.length;
		}
	}
};

Animation.adjustMarquee = function (this: typeof Animation) {
	const marquee = this.timelineMarquee as typeof this.timelineMarquee & { layer: AnimationLayer };
	if (marquee.y === -1) {
		return;
	}
	let { layer, x, y, length } = marquee;
	let changed = false;
	const ex = x + length;
	const frames = layer.frames;
	const fLength = frames.length;
	for (let i = 0; i < fLength; i++) {
		const frame = frames[i];
		const start = frame.start;
		const end = frame.end;
		if (x >= end) continue;
		if (ex <= start) break;
		if (x !== start) {
			length += x - start;
			x = start;
			changed = true;
		}
		break;
	}
	for (let i = fLength - 1; i >= 0; i--) {
		const frame = frames[i];
		const start = frame.start;
		const end = frame.end;
		if (ex <= start) continue;
		if (x >= end) break;
		if (ex > end) {
			length -= ex - end;
			changed = true;
		}
		break;
	}
	if (changed) {
		this.selectMarquee!(x, y, length, x);
	}
};

Animation.shiftLayerPosition = function (
	this: typeof Animation,
	layer: AnimationLayer,
	x: number,
	y: number
) {
	let editor;
	if (Inspector.animJointFrame.target) {
		editor = Inspector.animJointFrame;
	}
	if (Inspector.animSpriteFrame.target) {
		editor = Inspector.animSpriteFrame;
	}
	if (Inspector.animParticleFrame.target) {
		editor = Inspector.animParticleFrame;
	}
	const target = editor?.target;
	for (const frame of layer.frames) {
		frame.x = frame.x! + x;
		frame.y = frame.y! + y;
		if (frame === target) {
			write(editor, {
				x: frame.x,
				y: frame.y
			});
		}
	}
	this.updateFrameContexts!();
	this.requestRendering!();
};

Animation.shiftSelectedFrames = function (this: typeof Animation, mode: string) {
	const marquee = this.timelineMarquee as typeof this.timelineMarquee & { layer: AnimationLayer };
	if (marquee.y === -1) {
		return;
	}
	this.adjustMarquee!();
	const {
		layer: sLayer,
		x: sx,
		y: sy,
		length
	} = marquee as typeof marquee & { layer: AnimationLayer };
	const timelines = this.innerTimelineList.childNodes;
	const ex = this.frameMax;
	const ey = timelines.length;
	let dx = sx;
	let dy = sy;
	switch (mode) {
		case 'left': {
			const frames = sLayer.frames;
			const frame = this.getFrame!(frames, dx - 1);
			dx = frame ? frame.start : dx - 1;
			break;
		}
		case 'up':
			while (--dy >= 0) {
				const dLayer = (timelines[dy] as HTMLElement & { layer?: { class?: unknown } })
					.layer;
				if ((dLayer as { class?: unknown })?.class === sLayer.class) {
					break;
				}
			}
			break;
		case 'right':
			dx++;
			break;
		case 'down':
			while (++dy < ey) {
				const dLayer = (timelines[dy] as HTMLElement & { layer?: { class?: unknown } })
					.layer;
				if ((dLayer as { class?: unknown })?.class === sLayer.class) {
					break;
				}
			}
			break;
	}
	if (dx >= 0 && dx < ex && dy >= 0 && dy < ey) {
		const data = this.copyFrame!(true);
		if (data) {
			const { updateTimeline, openFrame, saveFrames } = this;
			// !：dy 处的行必然带着图层（原实现直接把可能为 undefined 的值塞进数组，运行期行为未改）
			const dLayer = (timelines[dy] as HTMLElement & { layer?: AnimationLayer }).layer!;
			const destination = { layer: dLayer, x: dx, y: dy };
			const sMarquee = { layer: sLayer, x: sx, length: length };
			const dMarquee = { layer: dLayer, x: dx, length: 0 };
			const layers = [sLayer];
			layers.push(dLayer);
			this.saveFrames!(layers, sMarquee, dMarquee);
			this.updateTimeline = fnEmpty;
			this.openFrame = fnEmpty;
			this.saveFrames = fnEmpty;
			this.deleteFrame!();
			this.pasteFrame!(data, destination);
			this.updateTimeline = updateTimeline;
			this.openFrame = openFrame;
			this.saveFrames = saveFrames;
			this.player.index = dx;
			this.updateTimeline!();
			this.openFrame!();
			this.scrollToMarquee!(false);
			dMarquee.length = this.timelineMarquee.length;
		}
	}
};

Animation.selectControlPoint = function (this: typeof Animation, x: number, y: number) {
	const target = getAnimationStore().target;
	const context = this.targetContext;
	if (target !== null && context !== null) {
		const points = this.controlPoints;
		switch (context.layer.class) {
			case 'joint': {
				const radius = 10 / Math.max(this.scale, 1);
				if (target === this.selectObject!(x, y)) {
					const ox = context.matrix[6];
					const oy = context.matrix[7];
					if (mathDist(ox, oy, x, y) > radius) {
						return points.jointRotate;
					}
				}
				break;
			}
			case 'particle': {
				const emitter = context.emitter;
				if (!emitter?.hasArea) return null;
			}
			case 'sprite':
				if (this.controlPointVisible) {
					const radius = 6 / this.scale;
					const { rectList } = points;
					for (let i = rectList.length - 1; i >= 0; i--) {
						const point = rectList[i];
						const sx = point.x - radius;
						const ex = point.x + radius;
						const sy = point.y - radius;
						const ey = point.y + radius;
						if (x >= sx && x < ex && y >= sy && y < ey) {
							return point;
						}
					}
				}
				break;
		}
	}
	return null;
};

Animation.selectObject = function (this: typeof Animation, x: number, y: number) {
	const { contexts } = this.player;
	const last = contexts.count - 1;
	let target: AnimationFrame | null = null;
	let weight = 0;

	// 选择关节对象 - 节点
	if (getAnimationStore().showMark && target === null) {
		const active = this.targetContext;
		const scale = Math.max(this.scale, 1);
		const jointRadius = 16 / scale;
		for (let i = last; i >= 0; i--) {
			const context = contexts[i];
			const frame = context.frame;
			const layer = context.layer;
			if (frame !== null && layer.class === 'joint' && !layer.hidden && !layer.locked) {
				const ox = context.matrix[6];
				const oy = context.matrix[7];
				const dist = mathDist(ox, oy, x, y);
				if (dist <= jointRadius) {
					const w = active === context ? Infinity : jointRadius - dist;
					if (target === null || weight < w) {
						target = frame;
						weight = w;
					}
				}
			}
		}
	}

	// 选择粒子发射器对象 - 锚点
	if (getAnimationStore().showMark && target === null) {
		const scale = Math.max(this.scale, 1);
		const anchorRadius = 32 / scale;
		for (let i = last; i >= 0; i--) {
			const context = contexts[i];
			const frame = context.frame;
			const layer = context.layer;
			if (frame !== null && layer.class === 'particle' && !layer.hidden && !layer.locked) {
				const ox = context.matrix[6];
				const oy = context.matrix[7];
				const dist = mathDist(ox, oy, x, y);
				if (dist <= anchorRadius) {
					const w = anchorRadius - dist;
					if (target === null || weight < w) {
						target = frame;
						weight = w;
					}
				}
			}
		}
	}

	// 选择关节对象 - 手臂
	if (getAnimationStore().showMark && target === null) {
		const active = this.targetContext;
		const scale = Math.max(this.scale, 1);
		const armWidth = 12 / scale;
		for (let i = last; i >= 0; i--) {
			const context = contexts[i];
			const frame = context.frame;
			if (frame !== null) {
				let { parent } = context;
				while (parent !== null) {
					if (parent.frame !== null) {
						if (parent.layer.hidden || parent.layer.locked) {
							parent = null;
						}
						break;
					}
					parent = parent.parent;
				}
				if (parent === null) continue;
				const sx = parent.matrix[6];
				const sy = parent.matrix[7];
				const dx = context.matrix[6];
				const dy = context.matrix[7];
				const dist = mathDist(sx, sy, dx, dy);
				if (dist > 4) {
					const angle = Math.atan2(dy - sy, dx - sx);
					const cos = Math.cos(-angle);
					const sin = Math.sin(-angle);
					const rx = x - sx;
					const ry = y - sy;
					const px = rx * cos - ry * sin;
					const py = rx * sin + ry * cos;
					const offset = Math.abs(py);
					const tolerance = armWidth / 2;
					if (px >= 0 && px < dist && offset <= tolerance) {
						const w =
							active === parent
								? Infinity
								: (tolerance - offset) * (1 - px / dist) + i;
						if (target === null || weight < w) {
							target = parent.frame;
							weight = w;
						}
					}
				}
			}
		}
	}

	if (target === null) {
		for (let i = last; i >= 0; i--) {
			const context = contexts[i];
			const frame = context.frame;
			const layer = context.layer;
			if (
				frame !== null &&
				!layer.hidden &&
				!layer.locked &&
				this.isPointInFrame!(context, x, y)
			) {
				target = frame;
				break;
			}
		}
	}

	return target;
};

Animation.isPointInFrame = function (
	this: typeof Animation,
	context: AnimationContext,
	x: number,
	y: number
) {
	const key = context.layer.sprite;
	const texture = this.player.textures[key];
	if (!texture) return false;
	const matrix = GL.matrix.set(context.matrix);
	const L = -(texture.width * context.anchorX + context.pivotX);
	const T = -(texture.height * context.anchorY + context.pivotY);
	const R = L + texture.width;
	const B = T + texture.height;
	const a = matrix[0];
	const b = matrix[1];
	const c = matrix[3];
	const d = matrix[4];
	const e = matrix[6];
	const f = matrix[7];
	const x1 = a * L + c * T + e - x;
	const y1 = b * L + d * T + f - y;
	const x2 = a * L + c * B + e - x;
	const y2 = b * L + d * B + f - y;
	const x3 = a * R + c * B + e - x;
	const y3 = b * R + d * B + f - y;
	const x4 = a * R + c * T + e - x;
	const y4 = b * R + d * T + f - y;
	const cross1 = x1 * y2 - y1 * x2;
	const cross2 = x2 * y3 - y2 * x3;
	const cross3 = x3 * y4 - y3 * x4;
	const cross4 = x4 * y1 - y4 * x1;
	// 如果矩形选择区域中有两个点重合 代表是零面积区域，则无法选中 后面的公式会失效
	if (
		(x1 === x2 && y1 === y2) ||
		(x2 === x3 && y2 === y3) ||
		(x3 === x4 && y3 === y4) ||
		(x4 === x1 && y4 === y1)
	) {
		return false;
	}
	return (
		cross1 * cross2 >= 0 && cross2 * cross3 >= 0 && cross3 * cross4 >= 0 && cross4 * cross1 >= 0
	);
};

Animation.getAnimationRange = (function IIFE() {
	const marquee = Animation.timelineMarquee;
	const range = { start: 0, end: 0 };
	return function (this: typeof Animation) {
		const end = this.player.length;
		if (marquee.y !== -1) {
			const { x, length } = marquee;
			range.start = x < end - 1 ? x : 0;
			range.end = length === 1 ? end : Math.min(x + length, end);
		} else {
			range.start = 0;
			range.end = end;
		}
		return range;
	};
})();
