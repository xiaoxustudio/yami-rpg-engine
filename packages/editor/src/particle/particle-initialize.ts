import { Particle } from './particle-window.ts';
import { particleEls } from '@app/particle/element-registry';
import type { ParticleHistoryData } from './particle-window.ts';
import { getListConfig } from '@ui-kit';
import { addSetScrollMethod, hide, on } from '@app/utils/element-utils.ts';
import { History } from '@app/tools/history.ts';
import { Timer } from '@app/utils/timer';
import { Matrix } from '@app/engine/webgl/matrix2.ts';
import { getParticleStore } from '@app/stores/particle';
import { GL } from '@app/engine/webgl/webgl-init.ts';
import { ParticleEngine } from '@app/engine/particle/particle-engine.ts';
import type { YamiElement } from '@app/types/element-api';
import { roundTo } from '@app/utils/math';

Particle.initialize = function () {
	this.page = particleEls.get('particle') as YamiElement;
	this.head = particleEls.get('particle-head') as YamiElement & {
		width: number;
	};
	this.body = hide(particleEls.get('particle-body') as YamiElement);
	this.info = particleEls.get('particle-info') as YamiElement;
	this.screen = particleEls.get('particle-screen') as YamiElement & {
		rawScrollLeft: number;
		rawScrollTop: number;
	};
	const oldMarquee = this.marquee;
	this.marquee = particleEls.get('particle-marquee') as YamiElement & {
		pointerevent: unknown;
	};
	if (oldMarquee && this.marquee && oldMarquee !== this.marquee) {
		Object.assign(this.marquee, oldMarquee);
	}
	const oldList = this.list;
	this.list = particleEls.get('particle-list') as never;
	if (oldList && this.list && oldList !== this.list) {
		Object.assign(this.list, oldList);
	}
	if (this.screen) addSetScrollMethod(this.screen);

	this.translationTimer = new Timer({
		duration: Infinity,
		update: (_timer) => {
			if (getParticleStore().state === 'open' && this.dragging === null) {
				const key = this.translationKey;
				const step = (Timer.deltaTime * 1.5) / this.scale!;
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
				const cx = roundTo(this.centerX! + x, 4);
				const cy = roundTo(this.centerY! + y, 4);
				this.updateCamera!(cx, cy);
				this.updateTransform!();
				if (screen.scrollLeft !== sl || screen.scrollTop !== st) {
					this.requestRendering!();
				}
			} else {
				return false;
			}
		}
	});

	this.zoomTimer = new Timer({
		duration: 80,
		update: (timer) => {
			if (getParticleStore().state === 'open') {
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

	const { list } = this;
	getListConfig(list).removable = true;
	getListConfig(list).renamable = true;
	list.bind(() => this.layers);

	History.processors['particle-layer-create'] =
		History.processors['particle-layer-delete'] =
		History.processors['particle-layer-remove'] =
			(operation: string, data: ParticleHistoryData) => {
				list.restore(operation, data.response);
			};
	History.processors['particle-layer-hidden'] = (
		operation: string,
		data: ParticleHistoryData
	) => {
		const { item, oldValue, newValue } = data;
		item.hidden = operation === 'undo' ? oldValue : newValue;
		list.update();
		Particle.requestRendering!();
		Particle.planToSave!();
	};

	window.addEventListener('themechange', this.themechange!);
	window.addEventListener('datachange', this.datachange!);
	window.addEventListener('keydown', this.keydown!);
	on(this.page, 'resize', this.windowResize!);
	on(GL.canvas, 'webglcontextrestored', this.webglRestored!);
	// head/toolbar/control/zoom/screen(keydown/wheel)/marquee(pointerdown) 经 Vue 模板转发（LayoutPanel @pointerdown/@input/@focus/@keydown/@wheel）
	on(particleEls.get('particle-speed') as YamiElement, 'input', this.speedInput!);
	on(this.screen, 'userscroll', this.screenUserscroll!);
	on(this.screen, 'blur', this.screenBlur!);
	on(this.marquee, 'pointermove', this.marqueePointermove!);
	on(this.marquee, 'pointerleave', this.marqueePointerleave!);
	on(this.list, 'keydown', this.listKeydown!);
	on(this.list, 'keydown', this.listKeydown!);
	on(this.list, 'select', this.listSelect!);
	on(this.list, 'record', this.listRecord!);
	on(this.list, 'popup', this.listPopup!);
	on(this.list, 'change', this.listChange!);
};

// 三个类在 `particle-engine.ts` 末尾装配；本文件在初始化期运行，那时它们已就位
Particle.Emitter = ParticleEngine.Emitter!;
Particle.Layer = ParticleEngine.Layer!;
Particle.Element = ParticleEngine.Element!;
