import { elementDataOf } from '@ui-kit';
import { getListConfig } from '@ui-kit';
import { uiEls } from '@app/ui/element-registry';
import { UI } from './ui-window.ts';
import type { UIShape, UINodeShape } from './ui-window.ts';
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

UI.initialize = function (this: UIShape) {
	this.page = uiEls.get('ui') as YamiElement;
	this.head = uiEls.get('ui-head') as YamiElement;
	this.body = hide(uiEls.get('ui-body') as YamiElement);
	this.screen = uiEls.get('ui-screen') as unknown as YamiElement & {
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

	const points = {
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
		list: null as unknown as { x: number; y: number; angle: number }[]
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
				this.updateCamera!(cx, cy);
				this.updateTransform!();
				if (screen.scrollLeft !== sl || screen.scrollTop !== st) {
					this.requestRendering!();
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
				this.requestRendering!();
			} else {
				this.scale = timer.end;
				return false;
			}
		}
	});

	this.padding = 800;

	this.matrix = new Matrix();

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
		UI.updateElement!(item);
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
		UI.planToSave!();
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
		UI.requestRendering!();
		UI.planToSave!();
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
		UI.planToSave!();
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
		UI.setTarget!(target);
		UI.requestRendering!();
		UI.planToSave!();
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
		UI.setTarget!(target);
		UI.requestRendering!();
		UI.planToSave!();
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
		UI.setTarget!(target);
		UI.requestRendering!();
		UI.planToSave!();
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
		UI.setTarget!(target);
		UI.requestRendering!();
		UI.planToSave!();
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
