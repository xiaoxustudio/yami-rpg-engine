import { getListConfig } from '@ui-kit';
import { getRelativeCoords } from '@app/utils/element-utils';
import { Window } from '@app/legacy/tools/window-object.ts';
import { $, getElementReader, getElementWriter } from '@app/utils/dom';
import { getFocus, on, read, write } from '@app/utils/element-utils.ts';
import { Timer } from '@app/utils/timer';
import { ctrl } from '@app/utils/event-accessors';
import { Data } from './data-object.ts';
import { File } from '@app/legacy/file/file-system-core.ts';

import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { GUID } from '@app/services/file-system/guid.ts';
import { Menu } from '@app/legacy/components/menu-list.ts';
import { TreeList } from '@app/legacy/components/tree-list.ts';
import { createGetter } from '@app/i18n';
import { SetKey } from '@app/legacy/tools/set-key-window.ts';
import { getGlobalClipboard } from '@app/legacy/types/global-clipboard.ts';
import type { EditorProjectShape } from '@app/stores/editor';

const Clipboard = getGlobalClipboard();

type EasingPoint = { x: number; y: number };
type EasingData = {
	id: string;
	key: string;
	name: string;
	points: Array<EasingPoint>;
	[k: string]: unknown;
};
type EasingDrag = {
	clientX: number;
	clientY: number;
	pointStartX: number;
	pointStartY: number;
	[k: string]: any;
};
type CurveMapInstance = Float64Array & {
	count: number;
	update(...points: EasingPoint[]): void;
};
type EasingMapInstance = Float32Array & {
	update(...points: EasingPoint[]): EasingMapInstance;
	ease(time: number): number;
};
type EasingListItem = EasingData & {
	element: HTMLElement & {
		textNode: Text;
	} & Record<string, unknown>;
	parent: { children: EasingListItem[] };
};

type EasingCanvasShape = HTMLCanvasElement & {
	context: CanvasRenderingContext2D;
	spacing: number;
	centerX: number;
	centerY: number;
	gridColor: string;
	axisColor: string;
	textColor: string;
	curveColor: string;
	curveColorActive: string;
	linkColorActive: string;
};

export const Easing = {
	data: null as unknown as EasingData[] | null,
	list: null as
		| (HTMLElement & {
				read: () => Record<string, any>;
				rename: (item: EasingData | null) => void;
				restoreSelection: () => void;
				addNodeTo: (data: EasingData, dItem?: unknown) => void;
				deleteNode: (item: EasingData) => void;
				select: (item: EasingData) => void;
				update: () => void;
				saveSelection: () => void;
				clear: () => void;
		  })
		| null,
	curve: null as EasingCanvasShape | null,
	preview: null as EasingCanvasShape | null,
	points: null as Array<EasingPoint> | null,
	dragging: null as EasingDrag | null,
	activePoint: null as EasingPoint | null,
	scale: null as unknown as number,
	originX: null as number | null,
	originY: null as number | null,
	timer: null as unknown as Timer,
	reverse: null as unknown as boolean,
	elapsed: null as unknown as number,
	duration: null as unknown as number,
	delay: null as unknown as number,
	curveMap: null as CurveMapInstance | null,
	easingMap: null as EasingMapInstance | null,
	pointImage: null as CanvasImageSource | null,
	previewImage: null as HTMLCanvasElement | null,
	startPoint: null as { x: number; y: number } | null,
	endPoint: null as { x: number; y: number } | null,
	changed: false,
	initialize: null as unknown as () => void,
	get: null as unknown as (id: string) => EasingMapInstance,
	clear: null as unknown as () => void,
	open: null as unknown as (target?: unknown) => void,
	load: null as unknown as (easing: EasingData) => void,
	insert: null as unknown as (dItem: EasingData) => void,
	copy: null as unknown as (item: EasingData) => void,
	paste: null as unknown as (dItem?: EasingData) => void,
	delete: null as unknown as (item: EasingData) => void,
	createId: null as unknown as () => string,
	createData: null as unknown as () => EasingData,
	setEasingKey: null as unknown as (item: EasingData) => void,
	getItemById: null as unknown as (id: string) => EasingData | null,
	updateMaps: null as unknown as () => void,
	updateCanvases: null as unknown as () => void,
	drawCurve: null as unknown as () => void,
	drawPreview: null as unknown as () => void,
	updatePoints: null as unknown as () => void,
	selectPointByCoords: null as unknown as (mouseX: number, mouseY: number) => EasingPoint | null,
	createPointImage: null as unknown as () => void,
	createPreviewImage: null as unknown as () => void,
	requestRendering: null as unknown as () => void,
	renderingFunction: null as unknown as () => void,
	stopRendering: null as unknown as () => void,
	windowClose: null as unknown as (event: Event) => void,
	windowClosed: null as unknown as (event: Event) => void,
	dprchange: null as unknown as (event: Event) => void,
	themechange: null as unknown as (event: Event & { value?: string }) => void,
	dataChange: null as unknown as (event: Event) => void,
	listKeydown: null as unknown as (event: KeyboardEvent) => void,
	listSelect: null as unknown as (event: Event & { value?: EasingData }) => void,
	listOpen: null as unknown as (event: Event & { value?: EasingData }) => void,
	listPopup: null as unknown as (event: PointerEvent & { value?: EasingData | null }) => void,
	modeSelect: null as unknown as (event: Event) => void,
	pointInput: null as unknown as (event: Event) => void,
	scaleInput: null as unknown as (event: Event & { value?: number }) => void,
	curveKeydown: null as unknown as (event: KeyboardEvent) => void,
	curvePointerdown: null as unknown as (event: PointerEvent & EasingDrag) => void,
	curveWheel: null as unknown as (event: WheelEvent) => void,
	curveBlur: null as unknown as (event: Event) => void,
	pointerup: null as unknown as (event?: PointerEvent) => void,
	pointermove: null as unknown as (event: PointerEvent) => void,
	reverseInput: null as unknown as (event: Event) => void,
	durationInput: null as unknown as (event: Event) => void,
	delayInput: null as unknown as (event: Event) => void,
	confirm: null as unknown as (event: Event) => void,
	CurveMap: null as unknown as { new (): CurveMapInstance },
	EasingMap: null as unknown as { new (): EasingMapInstance } & {
		easeInOut: EasingMapInstance;
	},
	list_saveSelection: null as unknown as () => void,
	list_restoreSelection: null as unknown as () => void,
	list_updateItemName: null as unknown as (item: EasingListItem) => void,
	list_updateTextNode: null as unknown as (item: EasingListItem) => void,
	saveToProject: null as ((project: EditorProjectShape) => void) | null,
	loadFromProject: null as ((project: EditorProjectShape) => void) | null,
	close: null as (() => void) | null
};

function ensureDomBound() {
	if (Easing.list) return;
	const list = $('#easing-list');
	if (!list) return;
	Easing.list = list as unknown as typeof Easing.list;
	Easing.curve = $('#easing-curve-canvas') as unknown as EasingCanvasShape;
	Easing.preview = $('#easing-preview-canvas') as unknown as EasingCanvasShape;
	list.saveSelection = Easing.list_saveSelection;
	list.restoreSelection = Easing.list_restoreSelection;
	list.updateItemName = Easing.list_updateItemName as (item: unknown) => unknown;
	list.updateTextNode = Easing.list_updateTextNode;
}

// 用箭头函数绑定 Easing 词法作用域，避免裸调 initialize() 时 this===undefined 炸 （initialize.js 用 .call(Easing) 绑 this，但若别处裸调会丢上下文；箭头函数根除问题）
Easing.initialize = () => {
	ensureDomBound();
	if (!Easing.list) return;
	Easing.startPoint = { x: 0, y: 0 };
	Easing.endPoint = { x: 1, y: 1 };

	const { list } = Easing;
	getListConfig(list).removable = true;
	getListConfig(list).foldable = false;
	getListConfig(list).renamable = true;
	list.bind(() => getEasingStore().data);
	getListConfig(list).updaters.push(list.updateTextNode);

	$('#easing-mode').loadItems([
		{ name: 'Use 2 Points', value: 2 },
		{ name: 'Use 5 Points', value: 5 },
		{ name: 'Use 8 Points', value: 8 }
	]);

	$('#easing-preview-reverse').loadItems([
		{ name: 'ON', value: true },
		{ name: 'OFF', value: false }
	]);

	const inputs = [];
	for (let i = 0; i < 8; i++) {
		inputs.push($(`#easing-points-${i}-x`), $(`#easing-points-${i}-y`));
	}
	$('#easing-mode')
		.enableHiddenMode()
		.relate([
			{ case: 2, targets: inputs.slice(0, 4) },
			{ case: 5, targets: inputs.slice(0, 10) },
			{ case: 8, targets: inputs }
		]);

	Easing.scale = 1;
	const easingScaleInit = $('#easing-scale');
	if (easingScaleInit) write(easingScaleInit, Easing.scale);

	Easing.reverse = true;
	Easing.duration = 400;
	Easing.delay = 400;
	const easingPreviewReverseInit = $('#easing-preview-reverse');
	if (easingPreviewReverseInit) write(easingPreviewReverseInit, Easing.reverse);
	const easingPreviewDurationInit = $('#easing-preview-duration');
	if (easingPreviewDurationInit) write(easingPreviewDurationInit, Easing.duration);
	const easingPreviewDelayInit = $('#easing-preview-delay');
	if (easingPreviewDelayInit) write(easingPreviewDelayInit, Easing.delay);

	Easing.timer = new Timer({
		duration: Easing.duration,
		update: (timer) => {
			switch (timer.state) {
				case 'playing':
					Easing.elapsed = timer.elapsed;
					Easing.requestRendering();
					Easing.drawPreview();
					break;
			}
		},
		callback: (timer) => {
			switch (timer.state) {
				case 'playing':
					if (Easing.delay !== 0) {
						timer.state = 'waiting';
						timer.elapsed = timer.playbackRate > 0 ? 0 : Easing.delay;
						timer.duration = Easing.delay;
						break;
					}
				case 'waiting':
					timer.state = 'playing';
					timer.duration = Easing.duration;
					switch (timer.playbackRate) {
						case 1:
							if (Easing.reverse) {
								timer.playbackRate = -1;
								timer.elapsed = timer.duration;
							} else {
								timer.elapsed = 0;
							}
							break;
						case -1:
							timer.playbackRate = 1;
							break;
					}
					break;
			}
			return true;
		}
	});

	window.addEventListener('dprchange', Easing.dprchange);
	window.addEventListener('themechange', Easing.themechange);
	on($('#easing'), 'close', Easing.windowClose);
	on($('#easing'), 'closed', Easing.windowClosed);
	on($('#easing-points-grid'), 'change', Easing.dataChange);
	on(list, 'keydown', Easing.listKeydown);
	// list select/open/popup 经 Vue 模板转发（Easing.vue @select/@open/@popup → Easing.list*）
	// list change 经 Vue 模板转发（Easing.vue @change → Easing.dataChange）
	on($('#easing-mode'), 'input', Easing.modeSelect);
	document
		.querySelectorAll(`#easing-points-0-x, #easing-points-0-y, #easing-points-1-x, #easing-points-1-y,
    #easing-points-2-x, #easing-points-2-y, #easing-points-3-x, #easing-points-3-y,
    #easing-points-4-x, #easing-points-4-y, #easing-points-5-x, #easing-points-5-y,
    #easing-points-6-x, #easing-points-6-y, #easing-points-7-x, #easing-points-7-y`)
		.forEach((el) => on(el, 'input', Easing.pointInput));
	const easingScale = $('#easing-scale');
	if (easingScale) on(easingScale, 'input', Easing.scaleInput);
	if (Easing.curve) {
		on(Easing.curve, 'keydown', Easing.curveKeydown);
		on(Easing.curve, 'pointerdown', Easing.curvePointerdown);
		on(Easing.curve, 'wheel', Easing.curveWheel, { passive: true });
		on(Easing.curve, 'blur', Easing.curveBlur);
	}
	const easingPreviewReverse = $('#easing-preview-reverse');
	if (easingPreviewReverse) on(easingPreviewReverse, 'input', Easing.reverseInput);
	const easingPreviewDuration = $('#easing-preview-duration');
	if (easingPreviewDuration) on(easingPreviewDuration, 'input', Easing.durationInput);
	const easingPreviewDelay = $('#easing-preview-delay');
	if (easingPreviewDelay) on(easingPreviewDelay, 'input', Easing.delayInput);
	const easingConfirm = $('#easing-confirm');
	if (easingConfirm) on(easingConfirm, 'click', Easing.confirm);
};

(() => {
	const maps = {} as Record<string, EasingMapInstance>;
	const linear = { map: (a: unknown) => a };
	const get = (id: string) => {
		const map = maps[id];
		if (map !== undefined) {
			return map;
		}

		const easing = Data.easings.map[id];
		if (easing) {
			const { points } = easing;
			const { startPoint, endPoint } = Easing;
			const map = new Easing.EasingMap();
			map.update(startPoint!, ...points, endPoint!);
			return (maps[id] = map);
		}

		return linear as unknown as EasingMapInstance;
	};
	const clear = () => {
		for (const key of Object.keys(maps)) {
			delete maps[key];
		}
	};

	Easing.get = get;

	Easing.clear = clear;
})();

Easing.open = function (this: typeof Easing, target?: unknown) {
	Window.open!('easing');
	getEasingStore().data = Object.clone(Data.easings);
	getEasingStore().target = (target as Record<string, unknown> | undefined) ?? null;

	getEasingStore().state = 'open';

	this.curveMap = new Easing.CurveMap();
	this.easingMap = new Easing.EasingMap();

	this.timer.state = 'playing';
	this.timer.playbackRate = 1;
	this.timer.elapsed = 0;
	this.timer.add();

	this.createPointImage();

	this.createPreviewImage();

	this.updateCanvases();

	this.list!.restoreSelection();

	getFocus(this.list);
};

Easing.load = function (this: typeof Easing, easing: EasingData) {
	const points = easing.points;
	this.points = points;

	const write = getElementWriter('easing', easing);
	const length = points.length;
	write('mode', length);
	for (let i = 0; i < length; i++) {
		write(`points-${i}-x`);
		write(`points-${i}-y`);
	}
	for (let i = length; i < 8; i++) {
		write(`points-${i}-x`, 0);
		write(`points-${i}-y`, 0);
	}

	this.updateMaps();
	this.requestRendering!();
};

Easing.insert = function (this: typeof Easing, dItem: EasingData) {
	this.list!.addNodeTo(this.createData(), dItem);
};

Easing.copy = function (this: typeof Easing, item: EasingData) {
	if (item) {
		Clipboard.write('yami.data.easing', item);
	}
};

Easing.paste = function (this: typeof Easing, dItem?: EasingData) {
	const copy = Clipboard.read('yami.data.easing');
	if (copy) {
		copy.name += ' - Copy';
		copy.id = this.createId();
		this.list!.addNodeTo(copy, dItem);
	}
};

Easing.delete = function (this: typeof Easing, item: EasingData) {
	const items = getEasingStore().data!;
	if (items.length > 1) {
		const get = createGetter('confirmation');
		Window.confirm!(
			{
				message: get('deleteSingleFile').replace('<filename>', item.name)
			},
			[
				{
					label: get('yes'),
					click: () => {
						const index = items.indexOf(item);
						this.list!.deleteNode(item);
						const last = items.length - 1;
						this.list!.select(items[Math.min(index, last)]);
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
};

Easing.createId = function (this: typeof Easing) {
	let id;
	do {
		id = GUID.generate64bit();
	} while (this.getItemById(id));
	return id;
};

Easing.createData = function (this: typeof Easing) {
	return {
		id: this.createId(),
		key: '',
		name: '',
		points: [
			{ x: 0, y: 0 },
			{ x: 1, y: 1 }
		]
	};
};

Easing.setEasingKey = function (this: typeof Easing, item: EasingData) {
	SetKey.open!(item.key, (key: string) => {
		item.key = key;
		this.changed = true;
		this.list!.update();
	});
};

Easing.getItemById = function (this: typeof Easing, id: string) {
	const data = this.data;
	if (!data) return null;
	const { length } = data;
	for (let i = 0; i < length; i++) {
		if (data[i].id === id) {
			return data[i];
		}
	}
	return null;
};

Easing.updateMaps = function (this: typeof Easing) {
	const { startPoint, endPoint } = this;
	this.curveMap!.update(startPoint!, ...this.points!, endPoint!);
	this.easingMap!.update(startPoint!, ...this.points!, endPoint!);
};

Easing.updateCanvases = function (this: typeof Easing) {
	const curve = this.curve!;
	const { width: cWidth, height: cHeight } = CSS.getDevicePixelContentBoxSize(curve);
	if (curve.width !== cWidth || curve.height !== cHeight) {
		if (curve.width !== cWidth) {
			curve.width = cWidth;
		}
		if (curve.height !== cHeight) {
			curve.height = cHeight;
		}
		curve.centerX = cWidth >> 1;
		curve.centerY = cHeight >> 1;
		curve.spacing = Math.floor(Math.max(cWidth / 12, 20) / 2) * 2;
	}

	const preview = this.preview!;
	const { width: pWidth, height: pHeight } = CSS.getDevicePixelContentBoxSize(preview);
	if (preview.width !== pWidth) {
		preview.width = pWidth;
	}
	if (preview.height !== pHeight) {
		preview.height = pHeight;
	}
};

Easing.drawCurve = function (this: typeof Easing) {
	const canvas = this.curve!;
	const scale = this.scale;
	const width = canvas.width;
	const height = canvas.height;
	const spacing = canvas.spacing * scale;
	const fullSize = spacing * 10;
	const originX = (this.originX = canvas.centerX - spacing * 5);
	const originY = (this.originY = canvas.centerY + spacing * 5);

	let { context } = canvas;
	if (!context) {
		context = canvas.context = canvas.getContext('2d', {
			desynchronized: true
		})!;
	}
	context.clearRect(0, 0, width, height);

	context.beginPath();
	for (let y = originY % spacing; y < height; y += spacing) {
		context.moveTo(0, y + 0.5);
		context.lineTo(width, y + 0.5);
	}
	for (let x = originX % spacing; x < width; x += spacing) {
		context.moveTo(x + 0.5, 0);
		context.lineTo(x + 0.5, height);
	}
	context.strokeStyle = canvas.gridColor;
	context.setLineDash([1]);
	context.stroke();

	context.strokeStyle = canvas.axisColor;
	context.beginPath();
	context.moveTo(originX, originY - fullSize + 0.5);
	context.lineTo(originX + fullSize + 0.5, originY - fullSize + 0.5);
	context.lineTo(originX + fullSize + 0.5, originY);
	context.stroke();

	context.beginPath();
	context.moveTo(0, originY + 0.5);
	context.lineTo(width, originY + 0.5);
	context.moveTo(originX + 0.5, 0);
	context.lineTo(originX + 0.5, height);
	context.strokeStyle = canvas.axisColor;
	context.setLineDash([]);
	context.stroke();

	context.textBaseline = 'top';
	context.font = '12px Arial';
	context.fillStyle = canvas.textColor;
	context.fillText('TIME', originX + 4, originY + 4);
	context.translate(originX, originY);
	context.rotate((Math.PI * 3) / 2);
	context.fillText('PROGRESSION', 4, -12);
	context.setTransform(1, 0, 0, 1, 0, 0);

	context.lineWidth = 2;
	context.strokeStyle = canvas.curveColor;
	context.beginPath();
	context.moveTo(originX + 0.5, originY + 0.5);
	const curveMap = this.curveMap!;
	const count = curveMap.count;
	for (let i = 2; i < count; i += 2) {
		context.lineTo(
			originX + curveMap[i] * fullSize + 0.5,
			originY - curveMap[i + 1] * fullSize + 0.5
		);
	}
	context.stroke();

	context.strokeStyle = canvas.curveColorActive;
	context.beginPath();
	context.moveTo(originX + 0.5, originY + 0.5);
	const easingMap = this.easingMap!;
	const ratio = easingMap.length - 1;
	const time = this.elapsed / this.duration;
	const length = Math.ceil(ratio * time) + 1;
	for (let i = 1; i < length; i++) {
		context.lineTo(
			originX + (i * fullSize) / ratio + 0.5,
			originY - easingMap[i] * fullSize + 0.5
		);
	}
	context.stroke();
	context.lineWidth = 1;

	const active = this.activePoint;
	const points = this.points!;
	const pLength = points.length;
	for (let i = 0; i < pLength; i++) {
		let linkPoint;
		switch (i % 3) {
			case 0:
				linkPoint = (points[i - 1] ?? this.startPoint)!;
				break;
			case 1:
				linkPoint = (points[i + 1] ?? this.endPoint)!;
				break;
			default:
				continue;
		}
		const point = points[i];
		const sx = originX + Math.round(point.x * fullSize);
		const sy = originY - Math.round(point.y * fullSize);
		const dx = originX + Math.round(linkPoint.x * fullSize);
		const dy = originY - Math.round(linkPoint.y * fullSize);
		const isActive = active === point;
		context.strokeStyle = isActive ? canvas.linkColorActive : canvas.axisColor;
		context.beginPath();
		context.moveTo(sx + 0.5, sy + 0.5);
		context.lineTo(dx + 0.5, dy + 0.5);
		context.stroke();
	}

	const image = this.pointImage;
	if (image === null) return;
	for (let i = 0; i < pLength; i++) {
		const point = points[i];
		const x = originX + Math.round(point.x * fullSize);
		const y = originY - Math.round(point.y * fullSize);
		const sx = i * 3;
		const isActive = active === point;
		if (y - 3 < 0) {
			context.drawImage(image, 7, isActive ? 22 : 15, 7, 4, x - 3, 0, 7, 4);
			context.drawImage(image, sx, isActive ? 10 : 5, 3, 5, x - 1, 3, 3, 5);
		} else if (y + 4 >= height) {
			context.drawImage(image, 7, isActive ? 25 : 18, 7, 4, x - 3, height - 4, 7, 4);
			context.drawImage(image, sx, isActive ? 10 : 5, 3, 5, x - 1, height - 8, 3, 5);
		} else {
			context.drawImage(image, 0, isActive ? 22 : 15, 7, 7, x - 3, y - 3, 7, 7);
			context.drawImage(image, sx, 0, 3, 5, x - 1, y - 2, 3, 5);
		}
	}
};

Easing.drawPreview = function (this: typeof Easing) {
	const canvas = this.preview!;
	const width = canvas.width;
	const height = canvas.height;
	const image = this.previewImage!;
	const size = image.height;
	const halfsize = size / 2;
	const spacingX = Math.floor((width - size * 4) / 5);
	const spacingY = Math.floor(height / 2);
	const time = this.easingMap!.ease(this.elapsed / this.duration);
	const dpr = window.devicePixelRatio;

	let { context } = canvas;
	if (!context) {
		context = canvas.context = canvas.getContext('2d', {
			desynchronized: true
		})!;
	}
	context.clearRect(0, 0, width, height);

	{
		const offset = Math.round(60 * dpr);
		const y0 = spacingY - halfsize + offset;
		const y1 = spacingY - halfsize - offset;
		const dx = spacingX;
		const dy = y0 * (1 - time) + y1 * time;
		context.drawImage(image, 0, 0, size, size, dx, dy, size, size);
	}

	{
		const minScale = 0.5 * dpr;
		const maxScale = 1.75 * dpr;
		const side0 = size * minScale;
		const side1 = size * maxScale;
		const side = side0 * (1 - time) + side1 * time;
		const halfside = side / 2;
		const dx = spacingX * 2 + halfsize * 3 - halfside;
		const dy = spacingY - halfside;
		context.drawImage(image, size, 0, size, size, dx, dy, side, side);
	}

	{
		const angle = time * Math.PI * 2;
		const ox = spacingX * 3 + halfsize * 5;
		const oy = spacingY + 20;
		context.translate(ox, oy);
		context.rotate(angle);
		context.drawImage(image, size * 2, 0, size, size, -halfsize, -halfsize, size, size);
		context.setTransform(1, 0, 0, 1, 0, 0);
	}

	{
		const alpha = time;
		const dx = spacingX * 4 + halfsize * 6;
		const dy = spacingY + 20 - halfsize;
		context.globalAlpha = alpha;
		context.drawImage(image, size * 3, 0, size, size, dx, dy, size, size);
		context.globalAlpha = 1;
	}
};

Easing.updatePoints = function (this: typeof Easing) {
	const read = getElementReader('easing');
	const count = read('mode');
	const points = this.points!;
	const length = points.length;
	if (length !== count) {
		points.length = count;
		for (let i = length; i < count; i++) {
			points[i] = {
				x: read(`points-${i}-x`),
				y: read(`points-${i}-y`)
			};
		}
	}
};

Easing.selectPointByCoords = function (this: typeof Easing, mouseX: number, mouseY: number) {
	let target = null;
	let weight = 0;
	const canvas = this.curve!;
	const fullSize = canvas.spacing * this.scale * 10;
	const x = (mouseX - this.originX!) / fullSize;
	const y = (this.originY! - mouseY) / fullSize;
	const ifSelectUpper = mouseY < 20;
	const ifSelectLower = mouseY >= canvas.height - 20;
	const borderY = ifSelectUpper
		? this.originY! / fullSize
		: ifSelectLower
			? (this.originY! - canvas.height) / fullSize
			: null;
	const points = this.points!;
	for (let i = points.length - 1; i >= 0; i--) {
		const point = points[i];
		const distX = Math.abs(point.x - x);
		const distY = Math.abs(point.y - y);
		if (
			(distX <= 0.1 && distY <= 0.1) ||
			(ifSelectUpper && distX <= 0.1 && point.y > borderY!) ||
			(ifSelectLower && distX <= 0.1 && point.y < borderY!)
		) {
			const w = -Math.hypot(distX, distY);
			if (target === null || weight < w) {
				target = point;
				weight = w;
			}
		}
	}
	if (this.activePoint !== target) {
		this.activePoint = target;
		this.requestRendering();
	}
	return target;
};

Easing.createPointImage = function (this: typeof Easing) {
	if (!this.pointImage) {
		File.get!({
			local: 'Images/curve_mark.png',
			type: 'image'
		}).then((image: CanvasImageSource) => {
			this.pointImage = image;
		});
	}
};

Easing.createPreviewImage = function (this: typeof Easing) {
	if (!this.previewImage) {
		const canvas = document.createElement('canvas');
		canvas.width = 480;
		canvas.height = 120;
		const context = canvas.getContext('2d')!;
		const y = (canvas.height - 64) / 2 + 64 * 0.85;
		context.fillStyle = '#000000';
		context.fillRect(0, 0, 480, 120);
		context.fillStyle = '#ffffff';
		context.textAlign = 'center';
		context.font = '64px Microsoft YaHei UI';
		context.fillText('Y', 60, y);
		context.fillText('A', 180, y);
		context.fillText('M', 300, y);
		context.fillText('I', 420, y);
		this.previewImage = canvas;
	}
};

Easing.requestRendering = function (this: typeof Easing) {
	if (getEasingStore().data !== null) {
		Timer.appendUpdater!('sharedRendering', this.renderingFunction);
	}
};

Easing.renderingFunction = function (this: typeof Easing) {
	Easing.drawCurve();
};

Easing.stopRendering = function (this: typeof Easing) {
	Timer.removeUpdater!('sharedRendering', this.renderingFunction);
};

Easing.windowClose = function (this: typeof Easing, event: Event) {
	if (Easing.changed) {
		event.preventDefault();
		const get = createGetter('confirmation');
		Window.confirm!(
			{
				message: get('closeUnsavedEasings')
			},
			[
				{
					label: get('yes'),
					click: () => {
						Easing.changed = false;
						Window.close!('easing');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
};

Easing.windowClosed = function (this: typeof Easing, event: Event) {
	getEasingStore().state = 'closed';
	getEasingStore().target = null;
	this.list!.saveSelection();
	this.curve!.blur();
	this.timer.remove();
	getEasingStore().data = null;
	this.points = null;
	this.curveMap = null;
	this.easingMap = null;
	this.activePoint = null;
	this.previewImage = null;
	this.list!.clear();
	this.stopRendering();
}.bind(Easing);

Easing.dprchange = function (this: typeof Easing, event: Event) {
	if (getEasingStore().data !== null) {
		this.updateCanvases();
		this.requestRendering();
	}
}.bind(Easing);

Easing.themechange = function (this: typeof Easing, event: Event & { value?: string }) {
	const canvas = this.curve!;
	switch (event.value) {
		case 'light':
			canvas.textColor = '#808080';
			canvas.gridColor = '#c0c0c0';
			canvas.axisColor = '#606060';
			canvas.curveColor = '#808080';
			canvas.curveColorActive = '#000000';
			canvas.linkColorActive = '#00a0f0';
			break;
		case 'dark':
			canvas.textColor = '#808080';
			canvas.gridColor = '#404040';
			canvas.axisColor = '#808080';
			canvas.curveColor = '#000000';
			canvas.curveColorActive = '#d8d8d8';
			canvas.linkColorActive = '#00bbff';
			break;
	}
	this.requestRendering();
}.bind(Easing);

Easing.dataChange = function (this: typeof Easing, event: Event) {
	this.changed = true;
}.bind(Easing);

Easing.listKeydown = function (this: HTMLElement, event: KeyboardEvent) {
	const item = this.read();
	if (event.ctrlKey || event.metaKey) {
		switch (event.code) {
			case 'KeyC':
				Easing.copy(item);
				break;
			case 'KeyV':
				Easing.paste();
				break;
		}
	} else if (event.altKey) {
		return;
	} else {
		switch (event.code) {
			case 'Insert':
				Easing.insert(item);
				break;
			case 'Delete':
				Easing.delete(item);
				break;
		}
	}
};

Easing.listSelect = function (this: typeof Easing, event: Event & { value?: EasingData }) {
	Easing.load(event.value!);
};

Easing.listOpen = function (this: typeof Easing, event: Event & { value?: EasingData }) {
	Easing.setEasingKey(event.value!);
};

Easing.listPopup = function (
	this: typeof Easing,
	event: PointerEvent & { value?: EasingData | null }
) {
	const list = Easing.list!;
	const item = event.value;
	const selected = !!item;
	const pastable = Clipboard.has('yami.data.easing');
	const deletable = selected && getEasingStore().data!.length > 1;
	const get = createGetter('menuEasingList');
	Menu.popup(
		{
			x: event.clientX,
			y: event.clientY
		},
		[
			{
				label: get('insert'),
				accelerator: 'Insert',
				click: () => {
					Easing.insert(item!);
				}
			},
			{
				label: get('copy'),
				accelerator: ctrl('C'),
				enabled: selected,
				click: () => {
					Easing.copy(item!);
				}
			},
			{
				label: get('paste'),
				accelerator: ctrl('V'),
				enabled: pastable,
				click: () => {
					Easing.paste(item!);
				}
			},
			{
				label: get('delete'),
				accelerator: 'Delete',
				enabled: deletable,
				click: () => {
					Easing.delete(item!);
				}
			},
			{
				label: get('rename'),
				accelerator: 'F2',
				enabled: selected,
				click: () => {
					list.rename(item);
				}
			},
			{
				label: get('set-key'),
				enabled: selected,
				click: () => {
					Easing.setEasingKey(item!);
				}
			}
		]
	);
};

Easing.modeSelect = function (this: typeof Easing, event: Event) {
	this.updatePoints();
	const points = this.points!;
	const easingMap = this.easingMap!;
	const write = getElementWriter('easing');
	const read = getElementReader('easing');
	if (
		points.length === 5 &&
		points[2].x === 0 &&
		points[2].y === 0 &&
		points[3].x === 0 &&
		points[3].y === 0 &&
		points[4].x === 0 &&
		points[4].y === 0
	) {
		const left = 0;
		const right = 1;
		const startX = left + (right - left) / 2;
		const startY = easingMap.ease(startX);
		const ctrlX0 = startX + (right - startX) / 3;
		const ctrlY0 = easingMap.ease(ctrlX0);
		const ctrlX1 = startX + ((right - startX) * 2) / 3;
		const ctrlY1 = easingMap.ease(ctrlX1);
		write('points-2-x', startX);
		write('points-2-y', startY);
		write('points-3-x', ctrlX0);
		write('points-3-y', ctrlY0);
		write('points-4-x', ctrlX1);
		write('points-4-y', ctrlY1);
		for (let i = 2; i < 5; i++) {
			points[i].x = read(`points-${i}-x`);
			points[i].y = read(`points-${i}-y`);
		}
	}
	if (
		points.length === 8 &&
		points[5].x === 0 &&
		points[5].y === 0 &&
		points[6].x === 0 &&
		points[6].y === 0 &&
		points[7].x === 0 &&
		points[7].y === 0
	) {
		const left = points[2].x;
		const right = 1;
		const startX = left + (right - left) / 2;
		const startY = easingMap.ease(startX);
		const ctrlX0 = startX + (right - startX) / 3;
		const ctrlY0 = easingMap.ease(ctrlX0);
		const ctrlX1 = startX + ((right - startX) * 2) / 3;
		const ctrlY1 = easingMap.ease(ctrlX1);
		write('points-5-x', startX);
		write('points-5-y', startY);
		write('points-6-x', ctrlX0);
		write('points-6-y', ctrlY0);
		write('points-7-x', ctrlX1);
		write('points-7-y', ctrlY1);
		for (let i = 5; i < 8; i++) {
			points[i].x = read(`points-${i}-x`);
			points[i].y = read(`points-${i}-y`);
		}
	}
	this.updateMaps();
	this.requestRendering();
}.bind(Easing);

Easing.pointInput = function (this: HTMLElement, event: Event) {
	const key = Inspector.getKey(this);
	const value = read(this);
	const keys = key.split('-');
	const end = keys.length - 1;
	let node = Easing.list!.read();
	for (let i = 0; i < end; i++) {
		node = node[keys[i]];
	}
	const property = keys[end];
	if (node[property] !== value) {
		node[property] = value;
	}
	Easing.updateMaps();
	Easing.requestRendering();
};

Easing.scaleInput = function (this: typeof Easing, event: Event & { value?: number }) {
	this.scale = event.value!;
	this.requestRendering();
}.bind(Easing);

Easing.curveKeydown = function (this: typeof Easing, event: KeyboardEvent) {
	const point = this.activePoint;
	if (point !== null) {
		switch (event.code) {
			case 'ArrowUp': {
				const index = this.points!.indexOf(point);
				const element = $(`#easing-points-${index}-y`);
				write(element, point.y + 0.01);
				point.y = read(element);
				this.changed = true;
				this.updateMaps();
				this.requestRendering();
				break;
			}
			case 'ArrowDown': {
				const index = this.points!.indexOf(point);
				const element = $(`#easing-points-${index}-y`);
				write(element, point.y - 0.01);
				point.y = read(element);
				this.changed = true;
				this.updateMaps();
				this.requestRendering();
				break;
			}
			case 'ArrowLeft': {
				const index = this.points!.indexOf(point);
				const element = $(`#easing-points-${index}-x`);
				write(element, point.x - 0.01);
				point.x = read(element);
				this.changed = true;
				this.updateMaps();
				this.requestRendering();
				break;
			}
			case 'ArrowRight': {
				const index = this.points!.indexOf(point);
				const element = $(`#easing-points-${index}-x`);
				write(element, point.x + 0.01);
				point.x = read(element);
				this.changed = true;
				this.updateMaps();
				this.requestRendering();
				break;
			}
		}
	}
}.bind(Easing);

Easing.curvePointerdown = function (this: typeof Easing, event: PointerEvent & EasingDrag) {
	switch (event.button) {
		case 0: {
			const coords = getRelativeCoords(event, this.curve);
			const dpr = window.devicePixelRatio;
			const x = coords.x * dpr;
			const y = coords.y * dpr;
			const selectedPoint = this.selectPointByCoords(x, y);
			if (selectedPoint) {
				this.dragging = event;
				event.pointStartX = selectedPoint.x;
				event.pointStartY = selectedPoint.y;
				window.addEventListener('pointerup', this.pointerup);
				window.addEventListener('pointermove', this.pointermove);
			}
			break;
		}
	}
}.bind(Easing);

Easing.curveWheel = function (this: typeof Easing, event: WheelEvent) {
	if (!this.dragging && event.deltaY !== 0) {
		const radios = document.getElementsByName('easing-scale');
		const length = radios.length;
		for (let i = 0; i < length; i++) {
			if (radios[i].dataValue === this.scale) {
				const step = event.deltaY < 0 ? -1 : 1;
				const radio = radios[i + step];
				if (radio !== undefined) {
					(radio as unknown as { pointerdown: (event: WheelEvent) => void }).pointerdown(
						event
					);
				}
				break;
			}
		}
	}
}.bind(Easing);

Easing.curveBlur = function (this: typeof Easing, event: Event) {
	this.pointerup();
	if (this.activePoint !== null) {
		this.activePoint = null;
		this.requestRendering();
	}
}.bind(Easing);

Easing.pointerup = function (
	this: typeof Easing & {
		relate: (start: EasingDrag, end: PointerEvent) => boolean;
	},
	event?: PointerEvent
) {
	const { dragging } = this;
	if (dragging === null) {
		return;
	}
	if (event === undefined) {
		event = dragging as unknown as PointerEvent;
	}
	if (this.relate(dragging, event)) {
		this.dragging = null;
		window.removeEventListener('pointerup', this.pointerup);
		window.removeEventListener('pointermove', this.pointermove);
	}
}.bind(
	Easing as unknown as typeof Easing & {
		relate: (start: EasingDrag, end: PointerEvent) => boolean;
	}
);

Easing.pointermove = function (this: typeof Easing, event: PointerEvent) {
	if (this.activePoint !== null) {
		const dragging = this.dragging!;
		const point = this.activePoint;
		const index = this.points!.indexOf(point);
		const fullSize = this.curve!.spacing * this.scale * 10;
		const transX = Math.roundTo((event.clientX - dragging.clientX) / fullSize, 2);
		const transY = Math.roundTo((dragging.clientY - event.clientY) / fullSize, 2);
		const pointX = Math.clamp(Math.roundTo(dragging.pointStartX + transX, 2), 0, 1);
		const pointY = Math.clamp(Math.roundTo(dragging.pointStartY + transY, 2), -5, 5);
		const xInput = $(`#easing-points-${index}-x`);
		const yInput = $(`#easing-points-${index}-y`);
		write(xInput, pointX);
		write(yInput, pointY);
		point.x = read(xInput);
		point.y = read(yInput);
		this.changed = true;
		this.updateMaps();
		this.requestRendering();
	}
}.bind(Easing);

Easing.reverseInput = function (this: HTMLElement, event: Event) {
	Easing.reverse = read(this);
};

Easing.durationInput = function (this: HTMLElement, event: Event) {
	Easing.duration = read(this);
	const timer = Easing.timer;
	if (timer.state === 'playing') {
		const lastDuration = timer.duration;
		timer.duration = Easing.duration;
		timer.elapsed = (timer.elapsed * timer.duration) / lastDuration;
	}
};

Easing.delayInput = function (this: HTMLElement, event: Event) {
	Easing.delay = read(this);
	const timer = Easing.timer;
	if (timer.state === 'waiting') {
		const lastDuration = timer.duration;
		timer.duration = Easing.delay;
		timer.elapsed = (timer.elapsed * timer.duration) / lastDuration;
	}
};

Easing.confirm = function (this: typeof Easing, event: Event) {
	if (this.changed) {
		this.changed = false;
		this.clear();
		const easings = getEasingStore().data!;
		TreeList.deleteCaches(easings);
		Data.easings = easings;
		Data.createGUIDMap(easings);
		File.planToSave!(Data.manifest.project.easings);
		const datachange = new Event('datachange');
		datachange.key = 'easings';
		window.dispatchEvent(datachange);
	}
	Window.close!('easing');
}.bind(Easing);

// 三次方曲线映射表类 - 必须使用Float64 因为Float32会导致部分点参数出现绘制BUG:线条变粗 Chromium78-89都存在这个BUG而Chromium69是正常的
Easing.CurveMap = class CurveMap extends Float64Array {
	count!: number;

	constructor() {
		super(6002);
	}

	update(...points: EasingPoint[]) {
		const length = points.length - 1;
		for (let i = 0; i < length; i += 3) {
			const { x: x0, y: y0 } = points[i];
			const { x: x1, y: y1 } = points[i + 1];
			const { x: x2, y: y2 } = points[i + 2];
			const { x: x3, y: y3 } = points[i + 3];
			const offset = (i / 3) * 2000;
			for (let i = 0; i <= 1000; i++) {
				const t0 = i / 1000;
				const t1 = 1 - t0;
				const n0 = t1 ** 3;
				const n1 = 3 * t0 * t1 ** 2;
				const n2 = 3 * t0 ** 2 * t1;
				const n3 = t0 ** 3;
				const x = x0 * n0 + x1 * n1 + x2 * n2 + x3 * n3;
				const y = y0 * n0 + y1 * n1 + y2 * n2 + y3 * n3;
				this[offset + i * 2] = x;
				this[offset + i * 2 + 1] = y;
			}
		}
		this.count = Math.floor(points.length / 3) * 2000 + 2;
	}
};

Easing.EasingMap = (function IIFE() {
	const SCALE = 1000;
	const round = Math.round;
	return class EasingMap extends Float32Array {
		constructor() {
			super(SCALE + 1);
		}

		update(...points: EasingPoint[]) {
			const length = points.length - 1;
			let pos = -1;
			for (let i = 0; i < length; i += 3) {
				const { x: x0, y: y0 } = points[i];
				const { x: x1, y: y1 } = points[i + 1];
				const { x: x2, y: y2 } = points[i + 2];
				const { x: x3, y: y3 } = points[i + 3];
				for (let n = 0; n <= SCALE; n++) {
					const t0 = n / SCALE;
					const t1 = 1 - t0;
					const n0 = t1 ** 3;
					const n1 = 3 * t0 * t1 ** 2;
					const n2 = 3 * t0 ** 2 * t1;
					const n3 = t0 ** 3;
					const x = x0 * n0 + x1 * n1 + x2 * n2 + x3 * n3;
					const i = round(x * SCALE);
					if (i > pos && i <= SCALE) {
						const y = y0 * n0 + y1 * n1 + y2 * n2 + y3 * n3;
						this[i] = y;
						if (i > pos + 1) {
							for (let j = pos + 1; j < i; j++) {
								this[j] =
									this[pos] + ((this[i] - this[pos]) * (j - pos)) / (i - pos);
							}
						}
						pos = i;
					}
				}
			}
			// 尾数不一定是精确值 因此需要设置为1
			this[SCALE] = 1;
			return this;
		}

		// 映射（改名为 ease 避开基类 Float64Array.map 协变契约）
		ease(time: number): number {
			return this[round(time * SCALE)];
		}

		static easeInOut = (function IIFE() {
			const p1 = { x: 0, y: 0 };
			const p2 = { x: 0.42, y: 0 };
			const p3 = { x: 0.58, y: 1 };
			const p4 = { x: 1, y: 1 };
			const instance = new EasingMap();
			return instance.update(p1, p2, p3, p4);
		})();
	};
})();

Easing.list_saveSelection = function (this: HTMLElement) {
	const { easings } = Data;
	if (easings.selection === undefined) {
		Object.defineProperty(easings, 'selection', {
			writable: true,
			value: ''
		});
	}
	const selection = this.read();
	if (selection) {
		easings.selection = selection.id;
	}
};

Easing.list_restoreSelection = function (this: HTMLElement) {
	const id = Data.easings.selection;
	const item = Easing.getItemById(id) ?? this.data?.[0];
	this.select(item);
	this.update();
	this.scrollToSelection();
};

Easing.list_updateItemName = function (this: HTMLElement, item: EasingListItem) {
	this.updateTextNode(item);
	this.update();
};

Easing.list_updateTextNode = function (this: HTMLElement, item: EasingListItem) {
	const textNode = item.element.textNode;
	const items = item.parent.children;
	const index = items.indexOf(item);
	const length = items.length;
	const digits = Number.computeIndexDigits(length);
	const sn = index.toString().padStart(digits, '0');
	const text = `${sn}:${item.name}`;
	if (textNode.nodeValue !== text) {
		textNode.nodeValue = text;
	}
};

import { getEasingStore } from '@app/stores/easing';

const easingStateKeys = ['state', 'target', 'data'] as const;

for (const key of easingStateKeys) {
	Object.defineProperty(Easing, key, {
		get: () => getEasingStore()[key],
		set: (value: unknown) => {
			(getEasingStore() as unknown as Record<(typeof easingStateKeys)[number], unknown>)[
				key
			] = value;
		},
		configurable: true
	});
}
