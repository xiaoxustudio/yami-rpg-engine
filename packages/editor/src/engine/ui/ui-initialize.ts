import { elementDataOf } from '@ui-kit';
import { getListConfig } from '@ui-kit';
import { uiEls } from '@app/engine/ui/element-registry';
import type { UIShape, UINodeShape, UIControlPoints } from './legacy/ui-window.ts';
// ④-2b（第 112 轮）：本文件里「以 UI 为接收者」的引擎调用改为直连 UIEngine（接收者仍显式传）。
import { UIEngine } from './ui-engine.ts';
import type { DynamicShape } from '@app/types/shapes.ts';
import { addScrollbars, hide, on, write } from '@app/utils/element-utils.ts';
import { Timer } from '@app/utils/timer';
import { File } from '@app/file/file-system-core.ts';
import { History } from '@app/tools/history.ts';
import { Reference } from '@app/log/related-references.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';
import { ImageTexture } from '@app/engine/webgl/image-texture.ts';
import { Matrix } from '@app/engine/webgl/matrix2.ts';
import { getUIStore } from '@app/stores/ui';
import type { YamiElement } from '@app/types/element-api';
import { roundTo } from '@app/utils/math';

/**
 * 本域的挂载实现：`this.initialize` —— 第 ④-3 步起改由**成员对象**提供
 * （域模块不再 `this.x = …` 自我绑定，装配见 `ui-members.ts`）。
 *
 * 体内 ~16 处 `this.x` 已改成 `this.x`、`UIEngine.x.call(this)` 改成 `.call(this)`：实测它**唯一**
 * 的调用路径是 `LayoutPanel.vue` 的 `onMounted` → `nextTick(() => getUIStore().initialize())`
 * → store 转发 `UI?.initialize?.()` ⇒ 接收者恒为 UI；而体内所有嵌套回调（`History.processors[…]` ×9 ·
 * `File.get!().then` · `Timer.update` ×2 · `list.bind`）**都是箭头函数** ⇒ 捕获外层 `this`，
 * 语义与原写法逐字等价（第 168 轮核实）。
 */
const initialize = function (this: UIShape) {
	this.page = uiEls.get('ui') as YamiElement;
	this.head = uiEls.get('ui-head') as YamiElement;
	this.body = hide(uiEls.get('ui-body') as YamiElement);
	this.screen = uiEls.get('ui-screen') as YamiElement & {
		rawScrollLeft: number;
		rawScrollTop: number;
	};
	const oldMarquee = this.marquee;
	this.marquee = uiEls.get('ui-marquee') as YamiElement;
	if (oldMarquee && this.marquee && oldMarquee !== this.marquee) {
		Object.assign(this.marquee, oldMarquee);
	}
	this.searcher = uiEls.get('ui-searcher') as YamiElement;
	const oldList = this.list;
	this.list = uiEls.get('ui-list') as YamiElement;
	if (oldList && this.list && oldList !== this.list) {
		Object.assign(this.list, oldList);
	}
	// P4b：`page` 走显式元素数据（字段已从 DATA_FIELDS 摘除）
	elementDataOf<{ page?: HTMLElement | null }>(this.list).page = uiEls.get(
		'ui-element'
	) as YamiElement;
	elementDataOf<{ head: HTMLElement }>(this.list).head = uiEls.get('ui-list-head') as YamiElement;
	if (this.screen) addScrollbars(this.screen);

	const points: UIControlPoints = {
		rotate: {
			TL: { x: 0, y: 0, angle: 225 },
			TR: { x: 0, y: 0, angle: 315 },
			BL: { x: 0, y: 0, angle: 135 },
			BR: { x: 0, y: 0, angle: 45 }
		},
		resize: {
			T: { x: 0, y: 0, angle: 270 },
			L: { x: 0, y: 0, angle: 180 },
			R: { x: 0, y: 0, angle: 0 },
			B: { x: 0, y: 0, angle: 90 },
			TL: { x: 0, y: 0, angle: 225 },
			TR: { x: 0, y: 0, angle: 315 },
			BL: { x: 0, y: 0, angle: 135 },
			BR: { x: 0, y: 0, angle: 45 }
		},
		list: []
	};
	// 控制点按优先级从低到高排序
	points.list = [
		points.rotate.TL,
		points.rotate.TR,
		points.rotate.BL,
		points.rotate.BR,
		points.resize.T,
		points.resize.L,
		points.resize.R,
		points.resize.B,
		points.resize.TL,
		points.resize.TR,
		points.resize.BL,
		points.resize.BR
	];
	this.controlPoints = points;

	File.get!({
		local: 'Images/ui_control_point.png',
		type: 'image'
	}).then((image: { guid?: string; [k: string]: unknown }) => {
		if (!image) return;
		image.guid = 'ui:control-point';
		this.controlPointTexture = new ImageTexture(image);
		this.controlPointTexture.base.protected = true;
	});

	this.translationTimer = new Timer({
		duration: Infinity,
		update: (_timer: Timer) => {
			if (getUIStore().state === 'open' && this.dragging === null) {
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
				const cx = roundTo(this.centerX + x, 4);
				const cy = roundTo(this.centerY + y, 4);
				UIEngine.updateCamera!.call(this, cx, cy);
				UIEngine.updateTransform!.call(this);
				if (screen.scrollLeft !== sl || screen.scrollTop !== st) {
					UIEngine.requestRendering!.call(this);
					this.marquee.resize();
					this.screen.updateScrollbars();
				}
			} else {
				return false;
			}
		}
	});

	this.zoomTimer = new Timer({
		duration: 80,
		update: (timer: Timer) => {
			if (getUIStore().state === 'open') {
				const { elapsed, duration, start, end } = timer;
				const time = elapsed / duration;
				this.scale = start * (1 - time) + end * time;
				this.resize!();
				UIEngine.requestRendering!.call(this);
			} else {
				this.scale = timer.end;
				return false;
			}
		}
	});

	this.padding = 800;

	this.matrix = new Matrix();
	// ⚠️ 必须把**同一个实例**交给 store：相机每帧改的是 `this.matrix`
	// （`ui-engine.ts` 的 `updateTransform` 里 `this.matrix.reset().scale().translate()`），
	// 而**所有绘制**读的是 `getUIStore().matrix`（`element-base.ts` 的
	// `gl.matrix.set(getUIStore().matrix!)…`、`ui-engine.ts` 的坐标轴/控制点）。
	// store 里那个 `new Matrix()` 兜底**没有写入方**，于是绘制一直用一个
	// 永远停留在单位矩阵的副本 —— 表现是「画面能出来、但平移/缩放完全不动、且不报错」
	// （单位矩阵是合法值，所以连异常都没有）（2026-09-18 实测定位）。
	getUIStore().matrix = this.matrix;

	this.inspectorTypeMap = {
		image: 'uiImage',
		text: 'uiText',
		textbox: 'uiTextBox',
		dialogbox: 'uiDialogBox',
		progressbar: 'uiProgressBar',
		button: 'uiButton',
		animation: 'uiAnimation',
		video: 'uiVideo',
		window: 'uiWindow',
		container: 'uiContainer',
		reference: 'uiReference'
	};

	this.searcher.addCloseButton();
	this.searcher.addKeydownFilter();

	const { list } = this;
	getListConfig(list).removable = true;
	getListConfig(list).renamable = true;
	// 绑 `this.nodes`：`ui-file.ts` 的 `load()` 会把它与 store 的 `nodes` 同步写入，
	// 两者始终是同一个数组。这里保持绑 `this.nodes` 是**刻意**的 ——
	// TreeList 的 `bind` 只接受精确的 `TreeItem[]`，直接绑 `getUIStore().nodes`
	// 需要一层难看的断言；既然两者同源，就没有必要付那个代价（2026-09-18）。
	list.bind(() => this.nodes);

	History.processors['ui-object-create'] = (
		operation: string,
		data: { response: { item: UINodeShape } & Record<string, unknown> }
	) => {
		const { response } = data;
		list.restore(operation, response);
	};
	History.processors['ui-object-delete'] = (
		operation: string,
		data: { response: { item: UINodeShape } & Record<string, unknown> }
	) => {
		const { response } = data;
		list.restore(operation, response);
	};
	History.processors['ui-object-remove'] = (
		operation: string,
		data: { response: { item: UINodeShape } & Record<string, unknown> }
	) => {
		const { response } = data;
		const { item } = response;
		list.restore(operation, response);
		this.updateElement!(item);
	};
	History.processors['ui-object-toggle'] = (
		operation: string,
		data: { item: UINodeShape; oldValue: boolean; newValue: boolean }
	) => {
		const { item, oldValue, newValue } = data;
		if (operation === 'undo') {
			item.enabled = oldValue;
		} else {
			item.enabled = newValue;
		}
		list.update();
		this.planToSave!();
	};
	History.processors['ui-object-hidden'] = (
		operation: string,
		data: {
			item: UINodeShape;
			oldValues1: unknown[];
			oldValues2: unknown[];
			newValue: boolean;
		}
	) => {
		const { item, oldValues1, oldValues2, newValue } = data;
		const { instance } = item;
		if (operation === 'undo') {
			list.restoreRecursiveStates(item, 'hidden', oldValues1);
			list.restoreRecursiveStates(instance, 'visible', oldValues2);
		} else {
			list.setRecursiveStates(item, 'hidden', newValue);
			list.setRecursiveStates(instance, 'visible', !newValue);
		}
		list.update();
		UIEngine.requestRendering!.call(this);
		this.planToSave!();
	};
	History.processors['ui-object-locked'] = (
		operation: string,
		data: { item: UINodeShape; oldValues: unknown[]; newValue: boolean }
	) => {
		const { item, oldValues, newValue } = data;
		if (operation === 'undo') {
			list.restoreRecursiveStates(item, 'locked', oldValues);
		} else {
			list.setRecursiveStates(item, 'locked', newValue);
		}
		list.update();
		this.planToSave!();
	};
	History.processors['ui-target-anchor'] = (
		_operation: string,
		data: { editor: DynamicShape; target: UINodeShape; anchorX: number; anchorY: number }
	) => {
		const { editor, target, anchorX, anchorY } = data;
		const { instances, transform } = target;
		data.anchorX = transform.anchorX;
		data.anchorY = transform.anchorY;
		// transform.anchorX = anchorX transform.anchorY = anchorY
		instances.setProperty('transform-anchorX', anchorX);
		instances.setProperty('transform-anchorY', anchorY);
		if (editor.target === target) {
			write(editor, { anchorX, anchorY });
		}
		instances.resize();
		this.setTarget!(target);
		UIEngine.requestRendering!.call(this);
		this.planToSave!();
	};
	History.processors['ui-target-shift'] = (
		_operation: string,
		data: { editor: DynamicShape; target: UINodeShape; x: number; y: number }
	) => {
		const { editor, target, x, y } = data;
		const { instances, transform } = target;
		data.x = transform.x;
		data.y = transform.y;
		// transform.x = x transform.y = y
		instances.setProperty('transform-x', x);
		instances.setProperty('transform-y', y);
		if (editor.target === target) {
			write(editor, { x, y });
		}
		instances.resize();
		this.setTarget!(target);
		UIEngine.requestRendering!.call(this);
		this.planToSave!();
	};
	History.processors['ui-target-resize'] = (
		_operation: string,
		data: { editor: DynamicShape; target: UINodeShape; width: number; height: number }
	) => {
		const { editor, target, width, height } = data;
		const { instances, transform } = target;
		data.width = transform.width;
		data.height = transform.height;
		// transform.width = width transform.height = height
		instances.setProperty('transform-width', width);
		instances.setProperty('transform-height', height);
		if (editor.target === target) {
			write(editor, { width, height });
		}
		instances.resize();
		this.setTarget!(target);
		UIEngine.requestRendering!.call(this);
		this.planToSave!();
	};
	History.processors['ui-target-rotate'] = (
		_operation: string,
		data: { editor: DynamicShape; target: UINodeShape; rotation: number }
	) => {
		const { editor, target, rotation } = data;
		const { instances, transform } = target;
		data.rotation = transform.rotation;
		// transform.rotation = rotation
		instances.setProperty('transform-rotation', rotation);
		if (editor.target === target) {
			write(editor, { rotation });
		}
		instances.resize();
		this.setTarget!(target);
		UIEngine.requestRendering!.call(this);
		this.planToSave!();
	};

	window.addEventListener('themechange', this.themechange);
	window.addEventListener('localizationchange', this.localizationchange);
	window.addEventListener('keydown', this.keydown);
	window.addEventListener('keydown', Reference.getKeydownListener!(list));
	on(this.page, 'resize', this.windowResize);
	on(GL.canvas, 'webglcontextrestored', this.webglRestored);
	// head/toolbar/zoom/screen(keydown/wheel)/marquee(pointerdown/doubleclick) 经 Vue 模板转发（LayoutPanel @pointerdown/@input/@focus/@keydown/@wheel）
	on(this.screen, 'userscroll', this.screenUserscroll);
	on(this.screen, 'blur', this.screenBlur);
	on(this.marquee, 'pointermove', this.marqueePointermove);
	on(this.marquee, 'pointerleave', this.marqueePointerleave);
	on(this.searcher, 'input', this.searcherInput);
	on(this.searcher, 'compositionend', this.searcherInput);
	on(list, 'keydown', this.listKeydown);
	on(list, 'pointerdown', this.listPointerdown);
	on(list, 'pointerdown', Reference.getPointerdownListener!(list), {
		capture: true
	});
	// list select/record/popup/open 经 Vue 模板转发（LayoutPanel @select/@record/@popup/@open → UI.list*）
	// list change 经 Vue 模板转发（LayoutPanel @change → UI.listChange）
	on(elementDataOf<{ page?: HTMLElement | null }>(list).page, 'resize', this.listPageResize);
};

/** 本域提供的成员表（④-3：域模块只**提供**成员对象；装配由 `ui-members.ts` 汇总、`ui-window.ts` 挂上） */
export type UIInitializeMembers = { initialize: (this: UIShape) => void };

export const uiInitializeMembers: UIInitializeMembers = { initialize };
