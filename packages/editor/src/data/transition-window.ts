import { getListConfig, setTreeItemText, radioProxyMap, type RadioProxyElement } from '@ui-kit';
import { dataEls } from '@app/data/element-registry';
import { registryElements, registryElement } from '@app/utils/element-registry';
import { getRelativeCoords } from '@app/utils/element-utils';
import { Window } from '@app/tools/window-object.ts';
import { $ } from '@app/utils/dom';
import { getFocus, on, read, write } from '@app/utils/element-utils.ts';
import {
	useEasingWindow,
	clampEasingPointX,
	clampEasingPointY
} from '@app/composables/useEasingWindow';
import { Timer } from '@app/utils/timer';
import { ctrl } from '@app/utils/event-accessors';
import { Data } from './data-object.ts';
import { File } from '@app/file/file-system-core.ts';

import { Inspector } from '@app/inspector/inspector.ts';
import { GUID } from '@app/services/file-system/guid.ts';
import { Menu } from '@app/components/menu-list.ts';
import { TreeList } from '@app/components/tree-list.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { SetKey } from '@app/composables/useSetKeyWindow';
import { GlobalClipboard } from '@app/utils/clipboard';
import type { EditorProjectShape } from '@app/stores/editor';

const Clipboard = GlobalClipboard;

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
	element: YamiElement & {
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

const EasingBase = {
	changed: false
};

/**
 * 延迟绑定槽：由 `initialize()` 填充（此前读到的是 undefined）。
 */
interface EasingSlots {
	data: EasingData[] | null;
	list:
		| (YamiElement & {
				// oxlint-disable-next-line no-explicit-any
				// 全仓其它 `read` 声明一律是 `unknown` 或精确类型（`command-tip.ts:104`
				// 的 `read(...args: unknown[]): unknown`、`custom-command-window.ts:57` 的
				// `read(): CustomCommandData | null` …），只有这一处写成 `Record<string, any>`
				// —— 孤例。改成 `unknown` 后唯一的读点（`Easing.pointInput`）用一次单断言收窄。
				read: () => Record<string, unknown>;
				rename: (item: EasingData | null) => void;
				restoreSelection: () => void;
				addNodeTo: (data: EasingData, dItem?: unknown) => void;
				deleteNode: (item: EasingData) => void;
				select: (item: EasingData) => void;
				update: () => void;
				saveSelection: () => void;
				clear: () => void;
		  })
		| null;
	curve: EasingCanvasShape | null;
	preview: EasingCanvasShape | null;
	points: Array<EasingPoint> | null;
	dragging: EasingDrag | null;
	activePoint: EasingPoint | null;
	scale: number;
	originX: number | null;
	originY: number | null;
	timer: Timer;
	reverse: boolean;
	elapsed: number;
	duration: number;
	delay: number;
	curveMap: CurveMapInstance | null;
	easingMap: EasingMapInstance | null;
	pointImage: CanvasImageSource | null;
	previewImage: HTMLCanvasElement | null;
	startPoint: { x: number; y: number } | null;
	endPoint: { x: number; y: number } | null;
	initialize: () => void;
	get: (id: string) => EasingMapInstance;
	clear: () => void;
	open: (target?: unknown) => void;
	load: (easing: EasingData) => void;
	insert: (dItem: EasingData) => void;
	copy: (item: EasingData) => void;
	paste: (dItem?: EasingData) => void;
	delete: (item: EasingData) => void;
	createId: () => string;
	createData: () => EasingData;
	setEasingKey: (item: EasingData) => void;
	getItemById: (id: string) => EasingData | null;
	updateMaps: () => void;
	updateCanvases: () => void;
	drawCurve: () => void;
	drawPreview: () => void;
	updatePoints: () => void;
	selectPointByCoords: (mouseX: number, mouseY: number) => EasingPoint | null;
	createPointImage: () => void;
	createPreviewImage: () => void;
	requestRendering: () => void;
	renderingFunction: () => void;
	stopRendering: () => void;
	windowClose: (event: YamiEvent) => void;
	windowClosed: (event: YamiEvent) => void;
	dprchange: (event: YamiEvent) => void;
	themechange: (event: YamiEvent & { value?: string }) => void;
	dataChange: (event: YamiEvent) => void;
	listKeydown: (event: KeyboardEvent) => void;
	listSelect: (event: YamiEvent & { value?: EasingData }) => void;
	listOpen: (event: YamiEvent & { value?: EasingData }) => void;
	listPopup: (event: PointerEvent & { value?: EasingData | null }) => void;
	modeSelect: (event: YamiEvent) => void;
	pointInput: (event: YamiEvent) => void;
	scaleInput: (event: YamiEvent & { value?: number }) => void;
	curveKeydown: (event: KeyboardEvent) => void;
	curvePointerdown: (event: PointerEvent & EasingDrag) => void;
	curveWheel: (event: WheelEvent) => void;
	curveBlur: (event: YamiEvent) => void;
	pointerup: (event?: PointerEvent) => void;
	pointermove: (event: PointerEvent) => void;
	durationInput: () => void;
	delayInput: () => void;
	confirm: (event: YamiEvent) => void;
	CurveMap: { new (): CurveMapInstance };
	EasingMap: { new (): EasingMapInstance } & {
		easeInOut: EasingMapInstance;
	};
	list_saveSelection: () => void;
	list_restoreSelection: () => void;
	list_updateItemName: (item: EasingListItem) => void;
	list_updateTextNode: (item: EasingListItem) => void;
	saveToProject: ((project: EditorProjectShape) => void) | null;
	loadFromProject: ((project: EditorProjectShape) => void) | null;
	close: (() => void) | null;
}

export const Easing = EasingBase as typeof EasingBase & EasingSlots;

function ensureDomBound() {
	if (Easing.list) return;
	const list = dataEls.get('easing-list') as YamiElement;
	if (!list) return;
	// ⚠️ 这处原先写的理由是「`typeof Easing.list` 解析出来是字面量 `null`」—— **第 136 轮实测证伪**：
	// 形状里 `list` 是 `EasingSlots.list`（一个带 9 个成员的联合类型，见上方 `:83`），
	// 不去断言时 tsc 的真实报错是 **缺那 9 个成员**
	// （`read` / `rename` / `restoreSelection` / `addNodeTo` / `deleteNode` / `select` / `update` /
	// `saveSelection` / `clear`），与 `null` 无关。原因是刚取出来的是**裸 `YamiElement`**
	// （那 9 个成员由 ui-kit 的列表组件在运行期挂上，紧随其后的 190–193 行又补了 4 个）。
	// ⇒ 按手法库第 6 条用**交叉断言**：保留 `YamiElement`、只补缺口那一支，`unknown` 跳板不再需要。
	Easing.list = list as NonNullable<typeof Easing.list>;
	Easing.curve = registryElement<EasingCanvasShape>(dataEls, 'easing-curve-canvas');
	Easing.preview = registryElement<EasingCanvasShape>(dataEls, 'easing-preview-canvas');
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
	// oxlint-disable-next-line unbound-method
	getListConfig(list).updaters.push(list.updateTextNode);

	applyLocalizedItems('easing-mode', [2, 5, 8], (items) =>
		dataEls.get('easing-mode')?.loadItems?.(items)
	);

	applyLocalizedItems('easing-preview-reverse', [true, false], (items) =>
		dataEls.get('easing-preview-reverse')?.loadItems?.(items)
	);

	const inputs = [];
	for (let i = 0; i < 8; i++) {
		inputs.push($(`#easing-points-${i}-x`), $(`#easing-points-${i}-y`));
	}
	dataEls
		.get('easing-mode')
		?.enableHiddenMode?.()
		.relate([
			{ case: 2, targets: inputs.slice(0, 4) },
			{ case: 5, targets: inputs.slice(0, 10) },
			{ case: 8, targets: inputs }
		]);

	Easing.scale = 1;
	const easingScaleInit = radioProxyMap['easing-scale'] as RadioProxyElement | undefined;
	if (easingScaleInit) write(easingScaleInit, Easing.scale);

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

	window.addEventListener('dprchange', Easing.dprchange as EventListener);
	window.addEventListener('themechange', Easing.themechange as EventListener);
	on(dataEls.get('easing') as YamiElement, 'close', Easing.windowClose);
	on(dataEls.get('easing') as YamiElement, 'closed', Easing.windowClosed);
	on(dataEls.get('easing-points-grid') as YamiElement, 'change', Easing.dataChange);
	on(list, 'keydown', Easing.listKeydown);
	// list select/open/popup 经 Vue 模板转发（Easing.vue @select/@open/@popup → Easing.list*）
	// list change 经 Vue 模板转发（Easing.vue @change → Easing.dataChange）
	on(dataEls.get('easing-mode') as YamiElement, 'input', Easing.modeSelect);
	// 缓动点控件批量绑 input——改按 id 列表读 dataEls（原先 document.querySelectorAll）
	registryElements(dataEls, [
		'easing-points-0-x',
		'easing-points-0-y',
		'easing-points-1-x',
		'easing-points-1-y',
		'easing-points-2-x',
		'easing-points-2-y',
		'easing-points-3-x',
		'easing-points-3-y',
		'easing-points-4-x',
		'easing-points-4-y',
		'easing-points-5-x',
		'easing-points-5-y',
		'easing-points-6-x',
		'easing-points-6-y',
		'easing-points-7-x',
		'easing-points-7-y'
	]).forEach((el) => on(el, 'input', Easing.pointInput));
	const easingScale = radioProxyMap['easing-scale'] as RadioProxyElement | undefined;
	if (easingScale) on(easingScale, 'input', Easing.scaleInput);
	if (Easing.curve) {
		on(Easing.curve, 'keydown', Easing.curveKeydown);
		on(Easing.curve, 'pointerdown', Easing.curvePointerdown);
		on(Easing.curve, 'wheel', Easing.curveWheel, { passive: true });
		on(Easing.curve, 'blur', Easing.curveBlur);
	}
	// confirm 由 Easing.vue 的 @confirm 驱动（按钮由 WindowFrame 生成）
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

		return linear as EasingMapInstance;
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
	getEasingStore().data = deepClone(Data.easings);
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

	const form = useEasingWindow().form;
	form.mode = points.length;
	for (let i = 0; i < 8; i++) {
		const point = points[i];
		form.points[i].x = point ? clampEasingPointX(point.x) : 0;
		form.points[i].y = point ? clampEasingPointY(point.y) : 0;
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
		const get = (key: string) => t('confirmation.' + key);
		Window.confirm!(
			{
				message: t('confirmation.deleteSingleFile', { filename: item.name })
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
	const { width: cWidth, height: cHeight } = getDevicePixelContentBoxSize(curve);
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
	const { width: pWidth, height: pHeight } = getDevicePixelContentBoxSize(preview);
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
	const form = useEasingWindow().form;
	const count = form.mode;
	const points = this.points!;
	const length = points.length;
	if (length !== count) {
		points.length = count;
		for (let i = length; i < count; i++) {
			points[i] = {
				x: form.points[i].x,
				y: form.points[i].y
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

Easing.windowClose = function (this: typeof Easing, event: YamiEvent) {
	if (Easing.changed) {
		event.preventDefault();
		const get = (key: string) => t('confirmation.' + key);
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

Easing.windowClosed = function (this: typeof Easing, _event: YamiEvent) {
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

Easing.dprchange = function (this: typeof Easing, _event: YamiEvent) {
	if (getEasingStore().data !== null) {
		this.updateCanvases();
		this.requestRendering();
	}
}.bind(Easing);

Easing.themechange = function (this: typeof Easing, event: YamiEvent & { value?: string }) {
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

Easing.dataChange = function (this: typeof Easing, _event: YamiEvent) {
	this.changed = true;
}.bind(Easing);

Easing.listKeydown = function (this: YamiElement, event: KeyboardEvent) {
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

Easing.listSelect = function (this: typeof Easing, event: YamiEvent & { value?: EasingData }) {
	Easing.load(event.value!);
};

Easing.listOpen = function (this: typeof Easing, event: YamiEvent & { value?: EasingData }) {
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
	const get = (key: string) => t('menuEasingList.' + key);
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

Easing.modeSelect = function (this: typeof Easing, _event: YamiEvent) {
	this.updatePoints();
	const points = this.points!;
	const easingMap = this.easingMap!;
	const form = useEasingWindow().form;
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
		form.points[2].x = clampEasingPointX(startX);
		form.points[2].y = clampEasingPointY(startY);
		form.points[3].x = clampEasingPointX(ctrlX0);
		form.points[3].y = clampEasingPointY(ctrlY0);
		form.points[4].x = clampEasingPointX(ctrlX1);
		form.points[4].y = clampEasingPointY(ctrlY1);
		for (let i = 2; i < 5; i++) {
			points[i].x = form.points[i].x;
			points[i].y = form.points[i].y;
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
		form.points[5].x = clampEasingPointX(startX);
		form.points[5].y = clampEasingPointY(startY);
		form.points[6].x = clampEasingPointX(ctrlX0);
		form.points[6].y = clampEasingPointY(ctrlY0);
		form.points[7].x = clampEasingPointX(ctrlX1);
		form.points[7].y = clampEasingPointY(ctrlY1);
		for (let i = 5; i < 8; i++) {
			points[i].x = form.points[i].x;
			points[i].y = form.points[i].y;
		}
	}
	this.updateMaps();
	this.requestRendering();
}.bind(Easing);

Easing.pointInput = function (this: YamiElement, _event: YamiEvent) {
	const key = Inspector.getKey(this);
	const value = read(this);
	const keys = key.split('-');
	const end = keys.length - 1;
	let node = Easing.list!.read();
	for (let i = 0; i < end; i++) {
		// `list.read()` 返回浅层的 `Record<string, unknown>`；这里按 `-` 分段逐层下钻，
		// 每层都是同一种「具名对象」。用一次单断言收窄（不是双重断言）。
		node = node[keys[i]] as Record<string, unknown>;
	}
	const property = keys[end];
	if (node[property] !== value) {
		node[property] = value;
	}
	Easing.updateMaps();
	Easing.requestRendering();
};

Easing.scaleInput = function (this: typeof Easing, event: YamiEvent & { value?: number }) {
	this.scale = event.value!;
	this.requestRendering();
}.bind(Easing);

Easing.curveKeydown = function (this: typeof Easing, event: KeyboardEvent) {
	const point = this.activePoint;
	if (point !== null) {
		const form = useEasingWindow().form;
		switch (event.code) {
			case 'ArrowUp': {
				const index = this.points!.indexOf(point);
				point.y = clampEasingPointY(point.y + 0.01);
				form.points[index].y = point.y;
				this.changed = true;
				this.updateMaps();
				this.requestRendering();
				break;
			}
			case 'ArrowDown': {
				const index = this.points!.indexOf(point);
				point.y = clampEasingPointY(point.y - 0.01);
				form.points[index].y = point.y;
				this.changed = true;
				this.updateMaps();
				this.requestRendering();
				break;
			}
			case 'ArrowLeft': {
				const index = this.points!.indexOf(point);
				point.x = clampEasingPointX(point.x - 0.01);
				form.points[index].x = point.x;
				this.changed = true;
				this.updateMaps();
				this.requestRendering();
				break;
			}
			case 'ArrowRight': {
				const index = this.points!.indexOf(point);
				point.x = clampEasingPointX(point.x + 0.01);
				form.points[index].x = point.x;
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
		// 组内成员改读 proxy.group（原先 document.getElementsByName('easing-scale')）
		const radios =
			(radioProxyMap['easing-scale'] as RadioProxyElement | undefined)?.group ?? [];
		const length = radios.length;
		for (let i = 0; i < length; i++) {
			if (radios[i].dataValue === this.scale) {
				const step = event.deltaY < 0 ? -1 : 1;
				const radio = radios[i + step];
				if (radio !== undefined) {
					// 交叉断言：交叉的一支就是源类型本身（`RadioProxyElement`），
					// 另一支补上运行期真实存在的行处理器 `pointerdown`。
					(
						radio as RadioProxyElement & { pointerdown: (event: WheelEvent) => void }
					).pointerdown(event);
				}
				break;
			}
		}
	}
}.bind(Easing);

Easing.curveBlur = function (this: typeof Easing, _event: YamiEvent) {
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
		// 交叉断言（同上面那处）：`dragging` 是拖拽起始事件，运行期就是一个 PointerEvent。
		event = dragging as EasingDrag & PointerEvent;
	}
	if (this.relate(dragging, event)) {
		this.dragging = null;
		window.removeEventListener('pointerup', this.pointerup);
		window.removeEventListener('pointermove', this.pointermove);
	}
}.bind(
	Easing as typeof Easing & {
		relate: (start: EasingDrag, end: PointerEvent) => boolean;
	}
);

Easing.pointermove = function (this: typeof Easing, event: PointerEvent) {
	if (this.activePoint !== null) {
		const dragging = this.dragging!;
		const point = this.activePoint;
		const index = this.points!.indexOf(point);
		const fullSize = this.curve!.spacing * this.scale * 10;
		const transX = roundTo((event.clientX - dragging.clientX) / fullSize, 2);
		const transY = roundTo((dragging.clientY - event.clientY) / fullSize, 2);
		const pointX = clamp(roundTo(dragging.pointStartX + transX, 2), 0, 1);
		const pointY = clamp(roundTo(dragging.pointStartY + transY, 2), -5, 5);
		point.x = pointX;
		point.y = pointY;
		const form = useEasingWindow().form;
		form.points[index].x = pointX;
		form.points[index].y = pointY;
		this.changed = true;
		this.updateMaps();
		this.requestRendering();
	}
}.bind(Easing);

Easing.durationInput = function (this: typeof Easing) {
	const timer = this.timer;
	if (timer.state === 'playing') {
		const lastDuration = timer.duration;
		timer.duration = this.duration;
		timer.elapsed = (timer.elapsed * timer.duration) / lastDuration;
	}
}.bind(Easing);

Easing.delayInput = function (this: typeof Easing) {
	const timer = this.timer;
	if (timer.state === 'waiting') {
		const lastDuration = timer.duration;
		timer.duration = this.delay;
		timer.elapsed = (timer.elapsed * timer.duration) / lastDuration;
	}
}.bind(Easing);

Easing.confirm = function (this: typeof Easing, _event: YamiEvent) {
	if (this.changed) {
		this.changed = false;
		this.clear();
		const easings = getEasingStore().data!;
		TreeList.deleteCaches(easings);
		Data.easings = easings;
		Data.createGUIDMap(easings);
		File.planToSave!(Data.manifest.project.easings);
		const datachange = new Event('datachange') as YamiEvent;
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

Easing.list_saveSelection = function (this: YamiElement) {
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

Easing.list_restoreSelection = function (this: YamiElement) {
	const id = Data.easings.selection;
	const item = Easing.getItemById(id) ?? this.data?.[0];
	this.select(item);
	this.update();
	this.scrollToSelection();
};

Easing.list_updateItemName = function (this: YamiElement, item: EasingListItem) {
	this.updateTextNode(item);
	this.update();
};

Easing.list_updateTextNode = function (this: YamiElement, item: EasingListItem) {
	const items = item.parent.children;
	const index = items.indexOf(item);
	const length = items.length;
	const digits = computeIndexDigits(length);
	const sn = index.toString().padStart(digits, '0');
	// 步骤 4：显示文本经派生层覆盖（不再直写 textNode；窗口外行亦生效）
	setTreeItemText(item, `${sn}:${item.name}`);
};

import { getEasingStore } from '@app/stores/easing';
import { applyLocalizedItems } from '@app/utils/localized-items';
import type { YamiElement } from '@app/types/element-api';
import type { YamiEvent } from '@app/types/editor-event';
import { clamp, roundTo } from '@app/utils/math';
import { computeIndexDigits } from '@app/utils/number';
import { clone as deepClone } from '@app/utils/object';
import { getDevicePixelContentBoxSize } from '@app/utils/css';

const easingStateKeys = ['state', 'target', 'data'] as const;

for (const key of easingStateKeys) {
	Object.defineProperty(Easing, key, {
		get: () => getEasingStore()[key],
		set: (value: unknown) => {
			(getEasingStore() as Record<(typeof easingStateKeys)[number], unknown>)[key] = value;
		},
		configurable: true
	});
}

const easingForm = () => useEasingWindow().form;

Object.defineProperties(Easing, {
	scale: {
		get: () => easingForm().scale,
		set: (value: number) => {
			easingForm().scale = value;
		},
		configurable: true
	},
	reverse: {
		get: () => easingForm().preview.reverse,
		set: (value: boolean) => {
			easingForm().preview.reverse = value;
		},
		configurable: true
	},
	duration: {
		get: () => easingForm().preview.duration,
		set: (value: number) => {
			easingForm().preview.duration = value;
		},
		configurable: true
	},
	delay: {
		get: () => easingForm().preview.delay,
		set: (value: number) => {
			easingForm().preview.delay = value;
		},
		configurable: true
	}
});
