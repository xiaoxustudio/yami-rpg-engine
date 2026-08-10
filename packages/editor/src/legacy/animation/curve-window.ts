import { $ } from '@/util/dom.ts';
import { addClass, hide, on, rect, removeClass, show, write } from '@/util/element-utils.ts';
import { Timer } from '@/util/timer.ts';
import { Animation } from './animation-window.ts';
import { Data } from '@/data/data-object.ts';
import { Easing } from '@/data/transition-window.ts';
import { Layout } from '@/layout/layout.ts';

type CurveState = 'closed' | 'open' | 'suspended';

type CurveMethod = ((...args: unknown[]) => unknown) | null;

interface CurveFrame {
	easingId?: string;
	key: HTMLElement & { easing?: boolean };
}

interface CurveCanvas extends HTMLCanvasElement {
	context?: CanvasRenderingContext2D;
	gridColor?: string;
	axisColor?: string;
	textColor?: string;
	curveColor?: string;
}

interface CurveShape {
	state: CurveState;
	page: HTMLElement | null;
	head: HTMLElement | null;
	list:
		| (HTMLElement & {
				defaultItem: { name: string; value: string };
				setItemNames: ((options: Record<string, string>) => void) | null;
				dataValue: string | null;
				update(): void;
		  })
		| null;
	canvas: CurveCanvas | null;
	target: CurveFrame | null;
	index: number | null | '';
	curveMap: unknown | null;
	initialize: (() => void) | null;
	open: (() => void) | null;
	load: CurveMethod;
	close: (() => void) | null;
	suspend: (() => void) | null;
	resume: (() => void) | null;
	updateHead: (() => void) | null;
	updateEasingOptions: (() => void) | null;
	updateTimeline: ((target: CurveFrame) => void) | null;
	resize: (() => void) | null;
	drawCurve: (() => void) | null;
	requestRendering: (() => void) | null;
	renderingFunction: (() => void) | null;
	stopRendering: (() => void) | null;
	windowResize: ((event?: Event) => void) | null;
	themechange: ((event: Event) => void) | null;
	datachange: ((event: Event) => void) | null;
	easingIdWrite: ((event: Event) => void) | null;
	easingIdInput: ((event: Event) => void) | null;
	settingsPointerdown: ((event: PointerEvent) => void) | null;
}

export const Curve: CurveShape = {
	state: 'closed',
	page: null,
	head: null,
	list: null,
	canvas: null,
	target: null,
	index: null,
	curveMap: null,
	initialize: null,
	open: null,
	load: null,
	close: null,
	suspend: null,
	resume: null,
	updateHead: null,
	updateEasingOptions: null,
	updateTimeline: null,
	resize: null,
	drawCurve: null,
	requestRendering: null,
	renderingFunction: null,
	stopRendering: null,
	windowResize: null,
	themechange: null,
	datachange: null,
	easingIdWrite: null,
	easingIdInput: null,
	settingsPointerdown: null
};

Curve.initialize = function (this: typeof Curve) {
	this.page = $('#animation-easing');
	this.head = $('#animation-easing-head');
	this.list = $('#animation-easing-id') as unknown as NonNullable<(typeof Curve)['list']>;
	this.canvas = $('#animation-easing-canvas') as unknown as CurveCanvas;
	hide(this.page);
	hide(this.list);

	this.curveMap = new Easing.CurveMap!();

	this.list.defaultItem = { name: 'No Easing', value: '' };

	// 过渡方式 - 重写设置选项名字方法
	this.list.setItemNames = function (this: typeof Curve, options: Record<string, string>) {
		const item = this.list!.defaultItem;
		const key = item.value;
		const name = options[key];
		if (name !== undefined) {
			item.name = name;
		}
		if (this.list!.dataValue !== null) {
			this.list!.update();
		}
	};

	window.addEventListener('themechange', this.themechange as unknown as EventListener);
	window.addEventListener('datachange', this.datachange as unknown as EventListener);
	on(this.page!, 'resize', this.windowResize as unknown as (event?: Event) => void);
	// list write/input 经 Vue 模板转发（AnimationEasingPage.vue @write/@input → Curve.easingId*）
	on(
		$('#animation-easing-settings'),
		'pointerdown',
		this.settingsPointerdown as unknown as (event: PointerEvent) => void
	);
};

Curve.open = function (this: typeof Curve) {
	if (this.state === 'closed') {
		this.state = 'open';
		show(this.page!);
		this.windowResize!();
		this.updateEasingOptions!();
	}
};

Curve.load = function (this: typeof Curve, ...args: unknown[]) {
	const frame = args[0] as CurveFrame;
	if (this.target !== frame) {
		this.target = frame;
		if (frame) {
			show(this.list);
			write(this.list, frame.easingId);
		} else {
			hide(this.list);
			this.index = null;
			this.requestRendering!();
		}
	}
};

Curve.close = function (this: typeof Curve) {
	if (this.state !== 'closed') {
		this.state = 'closed';
		hide(this.page);
		this.stopRendering!();
	}
};

Curve.suspend = function (this: typeof Curve) {
	if (this.state === 'open') {
		this.state = 'suspended';
		this.stopRendering!();
	}
};

Curve.resume = function (this: typeof Curve) {
	if (this.state === 'suspended') {
		this.state = 'open';
		this.resize!();
		this.requestRendering!();
	}
};

Curve.updateHead = function (this: typeof Curve) {
	const { page, head } = this;
	if (page!.clientWidth !== 0) {
		const { nav } = Layout.getGroupOfElement(head);
		const nRect = rect(nav);
		const iRect = rect(nav.lastChild as HTMLElement);
		const left = iRect.right - nRect.left;
		if ((head as unknown as { left?: number }).left !== left) {
			(head as unknown as { left?: number }).left = left;
			head!.style.left = `${left}px`;
		}
	}
};

Curve.updateEasingOptions = function (this: typeof Curve) {
	const list = this.list!;
	const { easings } = Data;
	if (list.data !== easings) {
		list.data = easings;
		const head = list.defaultItem;
		const items = Data.createEasingItems!();
		list.loadItems([head, ...items]);
	}
};

Curve.updateTimeline = function (this: typeof Curve, target: CurveFrame) {
	const easing = !!target.easingId;
	const { key } = target;
	if (key.easing !== easing) {
		key.easing = easing;
		if (easing) {
			addClass(key, 'easing');
		} else {
			removeClass(key, 'easing');
		}
	}
};

Curve.resize = function (this: typeof Curve) {
	if (this.state === 'open') {
		const screenBox = CSS.getDevicePixelContentBoxSize(this.page!);
		const screenWidth = screenBox.width;
		const screenHeight = screenBox.height;

		if (this.canvas!.width !== screenWidth || this.canvas!.height !== screenHeight) {
			this.canvas!.width = screenWidth;
			this.canvas!.height = screenHeight;
		}
	}
};

Curve.drawCurve = function (this: typeof Curve) {
	const canvas = this.canvas!;
	const width = canvas.width;
	const height = canvas.height;
	if (width * height === 0) {
		return;
	}
	const centerX = width >> 1;
	const centerY = height >> 1;
	const spacing = Math.floor(Math.min(width, height) / 12);
	const originX = centerX - spacing * 5;
	const originY = centerY + spacing * 5;
	const fullSize = spacing * 10;

	let { context } = canvas;
	if (!context) {
		context = canvas.context = canvas.getContext('2d', {
			desynchronized: true
		}) as CanvasRenderingContext2D;
	}
	const ctx = context;
	ctx.clearRect(0, 0, width, height);

	ctx.strokeStyle = canvas.gridColor!;
	ctx.setLineDash([1]);
	for (let y = originY % spacing; y < height; y += spacing) {
		ctx.beginPath();
		ctx.moveTo(0, y + 0.5);
		ctx.lineTo(width, y + 0.5);
		ctx.stroke();
	}
	for (let x = originX % spacing; x < width; x += spacing) {
		ctx.beginPath();
		ctx.moveTo(x + 0.5, 0);
		ctx.lineTo(x + 0.5, height);
		ctx.stroke();
	}

	ctx.strokeStyle = canvas.axisColor!;
	ctx.beginPath();
	ctx.moveTo(originX, originY - fullSize + 0.5);
	ctx.lineTo(originX + fullSize + 0.5, originY - fullSize + 0.5);
	ctx.lineTo(originX + fullSize + 0.5, originY);
	ctx.stroke();

	ctx.strokeStyle = canvas.axisColor!;
	ctx.setLineDash([]);
	ctx.beginPath();
	ctx.moveTo(0, originY + 0.5);
	ctx.lineTo(width, originY + 0.5);
	ctx.moveTo(originX + 0.5, 0);
	ctx.lineTo(originX + 0.5, height);
	ctx.stroke();

	ctx.textBaseline = 'top';
	ctx.font = '12px Arial';
	ctx.fillStyle = canvas.textColor!;
	ctx.fillText('TIME', originX + 4, originY + 4);
	ctx.translate(originX, originY);
	ctx.rotate((Math.PI * 3) / 2);
	ctx.fillText('PROGRESSION', 4, -12);
	ctx.setTransform(1, 0, 0, 1, 0, 0);

	switch (this.index) {
		case null:
			break;
		case '':
			ctx.lineWidth = 2;
			ctx.strokeStyle = canvas.curveColor!;
			ctx.beginPath();
			ctx.moveTo(originX + 0.5, originY + 0.5);
			ctx.lineTo(originX + fullSize + 0.5, originY + 0.5);
			ctx.lineTo(originX + fullSize + 0.5, originY - fullSize + 0.5);
			ctx.stroke();
			ctx.lineWidth = 1;
			break;
		default: {
			ctx.lineWidth = 2;
			ctx.strokeStyle = canvas.curveColor!;
			ctx.beginPath();
			ctx.moveTo(originX + 0.5, originY + 0.5);
			const curveMap = this.curveMap as unknown as {
				count: number;
				[i: number]: number;
				update(...pts: unknown[]): void;
			};
			const count = curveMap.count;
			for (let i = 2; i < count; i += 2) {
				ctx.lineTo(
					originX + curveMap[i] * fullSize + 0.5,
					originY - curveMap[i + 1] * fullSize + 0.5
				);
			}
			ctx.stroke();
			ctx.lineWidth = 1;
			break;
		}
	}
};

Curve.requestRendering = function (this: typeof Curve) {
	if (this.state === 'open') {
		Timer.appendUpdater!(
			'sharedRendering2',
			this.renderingFunction as (deltaTime: number) => void
		);
	}
};

Curve.renderingFunction = function (this: typeof Curve) {
	Curve.drawCurve!();
};

Curve.stopRendering = function (this: typeof Curve) {
	Timer.removeUpdater!('sharedRendering2', this.renderingFunction as (deltaTime: number) => void);
};

Curve.windowResize = function (this: typeof Curve, event?: Event) {
	if (this.page!.clientWidth === 0) {
		return this.suspend!();
	}
	this.updateHead!();
	switch (this.state) {
		case 'open':
			this.resize!();
			this.requestRendering!();
			break;
		case 'suspended':
			this.resume!();
			break;
	}
}.bind(Curve);

Curve.themechange = function (this: typeof Curve, event: Event) {
	const canvas = this.canvas!;
	switch ((event as Event & { value?: string }).value) {
		case 'light':
			canvas.textColor = '#808080';
			canvas.gridColor = '#c0c0c0';
			canvas.axisColor = '#606060';
			canvas.curveColor = '#202020';
			break;
		case 'dark':
			canvas.textColor = '#808080';
			canvas.gridColor = '#404040';
			canvas.axisColor = '#808080';
			canvas.curveColor = '#d8d8d8';
			break;
	}
	this.requestRendering!();
}.bind(Curve);

Curve.datachange = function (this: typeof Curve, event: Event) {
	if (Curve.state === 'open' && event.key === 'easings') {
		Curve.updateEasingOptions!();
		const { index } = Curve;
		if (index !== null) {
			Curve.index = null;
			write(Curve.list, index);
		}
	}
};

Curve.easingIdWrite = function (this: typeof Curve, event: Event & { value?: string }) {
	const id = event.value;
	if (Curve.index !== id) {
		Curve.index = id;
		Curve.requestRendering!();
		if (id !== '') {
			const easing = Data.easings.map[id];
			const points = easing?.points ?? [
				{ x: 0, y: 0 },
				{ x: 1, y: 1 }
			];
			const { startPoint, endPoint } = Easing;
			(Curve.curveMap as unknown as { update(...pts: unknown[]): void }).update(
				startPoint,
				...points,
				endPoint
			);
		}
	}
};

Curve.easingIdInput = function (this: typeof Curve, event: Event) {
	Animation.planToSave!();
	Animation.history.save({
		type: 'animation-easing-change',
		motion: Animation.motion,
		direction: Animation.direction,
		target: Animation.target,
		easingId: Curve.target!.easingId
	});
	Curve.target!.easingId = event.value;
	Curve.updateTimeline!(Curve.target!);
};

Curve.settingsPointerdown = function (this: typeof Curve) {
	Easing.open!();
};
