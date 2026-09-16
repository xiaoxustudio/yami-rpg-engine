import { elementDataOf } from '@ui-kit';
import { Animation } from './animation-window.ts';
import { animationEls } from '@app/animation/element-registry';
import type {
	AnimationMotion,
	AnimationHistoryObject,
	AnimationHistoryMotionId,
	AnimationHistoryMotionMode,
	AnimationHistoryLayerOperation,
	AnimationHistoryLayerState,
	AnimationHistoryLayerShift,
	AnimationHistoryFrames,
	AnimationHistoryEasing,
	AnimationHistoryTargetShift,
	AnimationHistoryTargetResize,
	AnimationHistoryTargetRotate,
	AnimationHistoryTargetIndex
} from './animation-window.ts';
import { getListConfig } from '@ui-kit';
import { addSetScrollMethod, hide, on, write } from '@app/utils/element-utils.ts';
import { Timer } from '@app/utils/timer';
import { Curve } from './curve-window.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { Sprite } from '@app/engine/sprite/sprite.ts';
import { History } from '@app/tools/history.ts';
import { Matrix } from '@app/engine/webgl/matrix2.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';
import { getAnimationStore } from '@app/stores/animation';

Animation.initialize = function (this: typeof Animation) {
	this.page = animationEls.get('animation') as HTMLElement;
	this.head = animationEls.get('animation-head') as HTMLElement;
	this.screen = animationEls.get('animation-screen') as HTMLElement;
	const oldMarquee = this.marquee;
	this.marquee = animationEls.get('animation-marquee') as HTMLElement;
	if (oldMarquee && this.marquee && oldMarquee !== this.marquee) {
		Object.assign(this.marquee, oldMarquee);
	}
	this.body = animationEls.get('animation-body') as HTMLElement;
	this.dirList = animationEls.get('animation-dirList') as HTMLElement;
	this.searcher = animationEls.get('animation-searcher') as HTMLElement;
	const oldList = this.list;
	this.list = animationEls.get('animation-list') as HTMLElement;
	if (oldList && this.list && oldList !== this.list) {
		Object.assign(this.list, oldList);
	}
	// P4b：`page`（列表所属的页面元素）走显式元素数据（字段已从 DATA_FIELDS 摘除）
	elementDataOf<{ page?: HTMLElement | null }>(this.list).page = animationEls.get(
		'animation-motion'
	) as HTMLElement;
	elementDataOf<{ head: HTMLElement }>(this.list).head = animationEls.get(
		'animation-list-head'
	) as HTMLElement;
	// 模块求值先于 Vue 挂载，$() 会拿到占位对象；重查询真实元素时回迁模块级挂载的属性/方法
	const oldLayerList = this.layerList;
	this.layerList = animationEls.get('animation-layer-list') as HTMLElement;
	if (oldLayerList && this.layerList && oldLayerList !== this.layerList) {
		Object.assign(this.layerList, oldLayerList);
	}
	const oldTimeline = this.timeline;
	this.timeline = animationEls.get('animation-timeline') as HTMLElement;
	if (oldTimeline && this.timeline && oldTimeline !== this.timeline) {
		Object.assign(this.timeline, oldTimeline);
	}
	elementDataOf<{ head: HTMLElement }>(this.timeline).head = animationEls.get(
		'animation-timeline-head'
	) as HTMLElement;
	this.toolbar = animationEls.get('animation-timeline-toolbar') as HTMLElement;
	const oldOuterTimelineList = this.outerTimelineList;
	this.outerTimelineList = animationEls.get('animation-timeline-list-outer') as HTMLElement;
	if (
		oldOuterTimelineList &&
		this.outerTimelineList &&
		oldOuterTimelineList !== this.outerTimelineList
	) {
		Object.assign(this.outerTimelineList, oldOuterTimelineList);
	}
	const oldInnerTimelineList = this.innerTimelineList;
	this.innerTimelineList = animationEls.get('animation-timeline-list-inner') as HTMLElement;
	if (
		oldInnerTimelineList &&
		this.innerTimelineList &&
		oldInnerTimelineList !== this.innerTimelineList
	) {
		Object.assign(this.innerTimelineList, oldInnerTimelineList);
	}
	const oldTimelineCursor = this.timelineCursor;
	this.timelineCursor = animationEls.get('animation-timeline-cursor') as HTMLElement;
	if (oldTimelineCursor && this.timelineCursor && oldTimelineCursor !== this.timelineCursor) {
		Object.assign(this.timelineCursor, oldTimelineCursor);
	}
	const oldTimelineMarquee = this.timelineMarquee;
	this.timelineMarquee = animationEls.get('animation-timeline-marquee') as HTMLElement;
	if (oldTimelineMarquee && this.timelineMarquee && oldTimelineMarquee !== this.timelineMarquee) {
		Object.assign(this.timelineMarquee, oldTimelineMarquee);
	}
	this.timelineMarqueeShift = animationEls.get('animation-timeline-marquee-shift') as HTMLElement;
	this.outerRuler = animationEls.get('animation-timeline-ruler-outer') as HTMLElement;
	this.innerRuler = animationEls.get('animation-timeline-ruler-inner') as HTMLElement;
	this.outerPointerArea = animationEls.get(
		'animation-timeline-pointer-area-outer'
	) as HTMLElement;
	this.innerPointerArea = animationEls.get(
		'animation-timeline-pointer-area-inner'
	) as HTMLElement;
	this.pointer = animationEls.get('animation-timeline-pointer') as HTMLElement;
	if (this.screen) addSetScrollMethod(this.screen);
	hide(this.body);
	hide(this.timeline);
	hide(this.timelineCursor);
	hide(this.timelineMarquee);
	hide(this.timelineMarqueeShift);

	const points = {
		jointRotate: {},
		rectRotate: {
			TL: { x: 0, y: 0, angle: 225 },
			TR: { x: 0, y: 0, angle: 315 },
			BL: { x: 0, y: 0, angle: 135 },
			BR: { x: 0, y: 0, angle: 45 }
		},
		rectResize: {
			T: { x: 0, y: 0, angle: 270 },
			L: { x: 0, y: 0, angle: 180 },
			R: { x: 0, y: 0, angle: 0 },
			B: { x: 0, y: 0, angle: 90 },
			TL: { x: 0, y: 0, angle: 225 },
			TR: { x: 0, y: 0, angle: 315 },
			BL: { x: 0, y: 0, angle: 135 },
			BR: { x: 0, y: 0, angle: 45 }
		},
		rectList: null as unknown as { x: number; y: number; angle: number }[]
	};
	// 控制点按优先级从低到高排序
	points.rectList = [
		points.rectRotate.TL,
		points.rectRotate.TR,
		points.rectRotate.BL,
		points.rectRotate.BR,
		points.rectResize.T,
		points.rectResize.L,
		points.rectResize.R,
		points.rectResize.B,
		points.rectResize.TL,
		points.rectResize.TR,
		points.rectResize.BL,
		points.rectResize.BR
	];
	this.controlPoints = points;

	this.translationTimer = new Timer({
		duration: Infinity,
		update: (_timer: Timer) => {
			if (getAnimationStore().state === 'open' && this.dragging === null) {
				const key = this.translationKey;
				const step = (Timer.deltaTime * 1.5) / this.scale;
				let x = 0;
				let y = 0;
				if (key & 0b0001) {
					x -= step;
				}
				if (key & 0b0010) {
					y -= step;
				}
				if (key & 0b0100) {
					x += step;
				}
				if (key & 0b1000) {
					y += step;
				}
				const screen = this.screen;
				const sl = screen.scrollLeft;
				const st = screen.scrollTop;
				const cx = Math.roundTo(this.centerX + x, 4);
				const cy = Math.roundTo(this.centerY + y, 4);
				this.updateCamera!(cx, cy);
				this.updateTransform!();
				if (screen.scrollLeft !== sl || screen.scrollTop !== st) {
					this.requestRendering!();
					this.marquee.resize();
				}
			} else {
				return false;
			}
		}
	});

	this.zoomTimer = new Timer({
		duration: 80,
		update: (timer: Timer) => {
			if (getAnimationStore().state === 'open') {
				const { elapsed, duration, start, end } = timer;
				const time = elapsed / duration;
				this.scale = start * (1 - time) + end * time;
				this.resize!();
				this.requestRendering!();
			} else {
				this.scale = timer.end;
				return false;
			}
		}
	});

	this.dirTags = {
		'1-dir': ['→'],
		'1-dir-mirror': ['→'],
		'2-dir': ['←', '→'],
		'2-dir-mirror': ['↘', '↗'],
		'3-dir-mirror': ['↓', '→', '↑'],
		'4-dir': ['↓', '←', '→', '↑'],
		'5-dir-mirror': ['↓', '→', '↑', '↘', '↗'],
		'8-dir': ['↓', '←', '→', '↑', '↙', '↘', '↖', '↗']
	};

	this.padding = 800;

	this.matrix = new Matrix();

	this.inspectorTypeMap = {
		joint: 'animJointFrame',
		sprite: 'animSpriteFrame',
		particle: 'animParticleFrame',
		sound: 'animSoundFrame'
	};

	this.searcher.addCloseButton();
	this.searcher.addKeydownFilter();

	const { list } = this;
	getListConfig(list).removable = true;
	list.bind(() => this.motions);
	getListConfig(list).updaters.push((item: unknown) =>
		list.updateItemName(item as AnimationMotion)
	);

	const { layerList } = this;
	getListConfig(layerList).removable = true;
	getListConfig(layerList).renamable = true;
	layerList.bind(() => this.layers);
	// 补赋递归状态方法（同根因：模块顶层赋值会固化拿 null，挪到 initialize 内赋真函数） 保留 567/569/580/582 段 layerList.* 调用姿势不变
	layerList.restoreRecursiveStates = Scene.list.restoreRecursiveStates;
	layerList.setRecursiveStates = Scene.list.setRecursiveStates;

	History.processors['animation-object-create'] = (
		operation: string,
		data: AnimationHistoryObject
	) => {
		const { response } = data;
		list.restore(operation, response);
	};
	History.processors['animation-object-delete'] = (
		operation: string,
		data: AnimationHistoryObject
	) => {
		const { response } = data;
		list.restore(operation, response);
	};
	History.processors['animation-object-remove'] = (
		operation: string,
		data: AnimationHistoryObject
	) => {
		const { response } = data;
		list.restore(operation, response);
	};
	History.processors['animation-motion-id-change'] = (
		_operation: string,
		data: AnimationHistoryMotionId
	) => {
		const { motion, id } = data;
		data.id = motion.id;
		motion.id = id;
		list.update();
		list.select(motion);
		list.scrollToSelection();
		Animation.planToSave!();
	};
	History.processors['animation-motion-mode-change'] = (
		_operation: string,
		data: AnimationHistoryMotionMode
	) => {
		const { motion, direction, mode, dirCases } = data;
		data.mode = motion.mode;
		data.dirCases = motion.dirCases;
		motion.mode = mode;
		motion.dirCases = dirCases;
		list.update();
		list.select(motion);
		list.scrollToSelection();
		Inspector.open!('animMotion', motion);
		write(Inspector.animMotion, { mode });
		Animation.createDirItems!();
		Animation.setDirection!(direction);
		Animation.planToSave!();
	};
	History.processors['animation-layer-rename'] = (
		operation: string,
		data: AnimationHistoryLayerOperation
	) => {
		const { motion, direction, response } = data;
		Animation.setMotion!(motion);
		Animation.setDirection!(direction);
		layerList.restore(operation, response);
	};
	History.processors['animation-layer-create'] =
		History.processors['animation-layer-delete'] =
		History.processors['animation-layer-remove'] =
			(operation: string, data: AnimationHistoryLayerOperation) => {
				const { motion, direction, response } = data;
				Animation.contextLoaded = false;
				Animation.setMotion!(motion);
				Animation.setDirection!(direction);
				layerList.restore(operation, response);
			};
	History.processors['animation-layer-hidden'] = (
		operation: string,
		data: AnimationHistoryLayerState
	) => {
		const { motion, direction, item, oldValues, newValue } = data;
		Animation.setMotion!(motion);
		Animation.setDirection!(direction);
		if (operation === 'undo') {
			layerList.restoreRecursiveStates(item, 'hidden', oldValues);
		} else {
			layerList.setRecursiveStates(item, 'hidden', newValue);
		}
		layerList.update();
		Animation.requestRendering!();
		Animation.planToSave!();
	};
	History.processors['animation-layer-locked'] = (
		operation: string,
		data: AnimationHistoryLayerState
	) => {
		const { motion, direction, item, oldValues, newValue } = data;
		Animation.setMotion!(motion);
		Animation.setDirection!(direction);
		if (operation === 'undo') {
			layerList.restoreRecursiveStates(item, 'locked', oldValues);
		} else {
			layerList.setRecursiveStates(item, 'locked', newValue);
		}
		layerList.update();
		Animation.planToSave!();
	};
	History.processors['animation-layer-shift'] = (
		operation: string,
		data: AnimationHistoryLayerShift
	) => {
		const { motion, direction, layer, shiftX, shiftY } = data;
		Animation.setMotion!(motion);
		Animation.setDirection!(direction);
		if (operation === 'undo') {
			Animation.shiftLayerPosition!(layer, -shiftX, -shiftY);
		} else {
			Animation.shiftLayerPosition!(layer, shiftX, shiftY);
		}
		layerList.select(layer);
		layerList.expandToSelection(false);
		layerList.update();
		layerList.scrollToSelection();
		Animation.planToSave!();
	};
	History.processors['animation-frames-change'] = (
		operation: string,
		data: AnimationHistoryFrames
	) => {
		const { motion, direction, changes, sMarquee, dMarquee } = data;
		for (const change of changes) {
			const { layer, frames } = change;
			change.frames = layer.frames;
			layer.frames = frames;
		}
		const { layer, x, length } = operation === 'undo' ? sMarquee : dMarquee;
		Animation.outerTimelineList.restoreMotionAndLayer(motion, direction, layer);
		Animation.player.index = x;
		Animation.unselectMarquee!();
		Animation.updateTimeline!();
		const y = Animation.getLayerIndex!(layer);
		Animation.selectMarquee!(x, y, length, x);
		Animation.scrollToMarquee!(false);
		Animation.planToSave!();
	};
	History.processors['animation-easing-change'] = (
		_operation: string,
		data: AnimationHistoryEasing
	) => {
		const { motion, direction, target, easingId } = data;
		data.easingId = target.easingId!;
		target.easingId = easingId;
		if (Curve.target === target) {
			write(Curve.list, easingId);
		}
		Curve.updateTimeline!(target);
		Animation.setMotion!(motion);
		Animation.setDirection!(direction);
		Animation.selectFrame!(target);
		Animation.updateFrameContexts!();
		Animation.requestRendering!();
		Animation.planToSave!();
	};
	History.processors['animation-target-shift'] = (
		_operation: string,
		data: AnimationHistoryTargetShift
	) => {
		const { editor, motion, direction, target, x, y } = data;
		data.x = target.x;
		data.y = target.y;
		target.x = x;
		target.y = y;
		if (editor.target === target) {
			write(editor, { x, y });
		}
		Animation.setMotion!(motion);
		Animation.setDirection!(direction);
		Animation.selectFrame!(target);
		Animation.updateFrameContexts!();
		Animation.requestRendering!();
		Animation.planToSave!();
	};
	History.processors['animation-target-resize'] = (
		_operation: string,
		data: AnimationHistoryTargetResize
	) => {
		const { editor, motion, direction, target, scaleX, scaleY } = data;
		data.scaleX = target.scaleX;
		data.scaleY = target.scaleY;
		target.scaleX = scaleX;
		target.scaleY = scaleY;
		if (editor.target === target) {
			write(editor, { scaleX, scaleY });
		}
		Animation.setMotion!(motion);
		Animation.setDirection!(direction);
		Animation.selectFrame!(target);
		Animation.updateFrameContexts!();
		Animation.requestRendering!();
		Animation.planToSave!();
	};
	History.processors['animation-target-rotate'] = (
		_operation: string,
		data: AnimationHistoryTargetRotate
	) => {
		const { editor, motion, direction, target, rotation } = data;
		data.rotation = target.rotation;
		target.rotation = rotation;
		if (editor.target === target) {
			write(editor, { rotation });
		}
		Animation.setMotion!(motion);
		Animation.setDirection!(direction);
		Animation.selectFrame!(target);
		Animation.updateFrameContexts!();
		Animation.requestRendering!();
		Animation.planToSave!();
	};
	History.processors['animation-target-index'] = (
		_operation: string,
		data: AnimationHistoryTargetIndex
	) => {
		const { motion, direction, target, hindex, vindex } = data;
		data.hindex = target.spriteX;
		data.vindex = target.spriteY;
		target.spriteX = hindex;
		target.spriteY = vindex;
		Animation.setMotion!(motion);
		Animation.setDirection!(direction);
		Animation.selectFrame!(target);
		Animation.requestRendering!();
		if (Sprite.state !== 'closed') {
			Sprite.marquee.select(hindex, vindex, 1, 1);
			Sprite.updateTargetInfo();
		}
		Animation.planToSave!();
	};

	window.addEventListener('themechange', this.themechange);
	window.addEventListener('datachange', this.datachange);
	window.addEventListener('enumchange', this.enumchange);
	window.addEventListener('keydown', this.keydown);
	on(this.page, 'resize', this.windowResize);
	on(GL.canvas, 'webglcontextrestored', this.webglRestored);
	// head/toolbar/zoom/screen(keydown/wheel)/marquee(pointerdown/doubleclick) 经 Vue 模板转发（LayoutPanel @pointerdown/@input/@focus/@keydown/@wheel）
	on(this.screen, 'userscroll', this.screenUserscroll);
	on(this.screen, 'blur', this.screenBlur);
	on(this.marquee, 'pointermove', this.marqueePointermove);
	on(this.marquee, 'pointerleave', this.marqueePointerleave);
	this.searcher.addEventListener('input', this.searcherInput);
	this.searcher.addEventListener('compositionend', this.searcherInput);
	on(list, 'keydown', this.listKeydown);
	on(list, 'pointerdown', this.listPointerdown);
	// list select/record/open/popup 经 Vue 模板转发（LayoutPanel @select/@record/@open/@popup → Animation.list*）
	// list change 经 Vue 模板转发（LayoutPanel @change → Animation.listChange）
	on(elementDataOf<{ page?: HTMLElement | null }>(list).page, 'resize', this.listPageResize);
	on(this.timeline, 'resize', this.timelinePageResize);
	// toolbar pointerdown 经 Vue 模板转发（LayoutPanel @pointerdown → Animation.timelineToolbarPointerdown）
	on(this.layerList, 'scroll', this.layerListScroll);
	on(this.layerList, 'keydown', this.layerListKeydown, { capture: true });
	on(this.layerList, 'pointerdown', this.layerListPointerdown);
	// layerList select/record/popup 经 Vue 模板转发（LayoutPanel @select/@record/@popup → Animation.layerList*）
	// layerList change 经 Vue 模板转发（LayoutPanel @change → Animation.layerListChange）
	on(this.outerTimelineList, 'keydown', this.outerTimelineListKeydown);
	on(this.outerTimelineList, 'scroll', this.outerTimelineListScroll);
	on(this.outerTimelineList, 'blur', this.outerTimelineListBlur);
	on(this.outerTimelineList, 'pointerdown', this.outerTimelineListPointerdown);
	on(this.innerTimelineList, 'pointermove', this.innerTimelineListPointermove);
	on(this.innerTimelineList, 'pointerleave', this.innerTimelineListPointerleave);
	on(this.innerTimelineList, 'dblclick', this.innerTimelineListDblclick);

	Curve.initialize!();
};
