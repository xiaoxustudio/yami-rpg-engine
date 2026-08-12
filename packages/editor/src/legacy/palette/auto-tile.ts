import { getListConfig } from '@ui-kit';
import { drawAndFitImage } from '@/util/element-utils';
import { Window } from '@/tools/window-object.ts';
import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { on, hasClass, write, getFocus, read, clear } from '@/util/element-utils.ts';
import { ctrl } from '@/util/event-accessors.ts';
import { File } from '@/file/file-system-core.ts';
import { Scene } from '@/scene/scene-window.ts';
import { GUID } from '@/file/guid.ts';
import { Menu } from '@/components/menu-list.ts';
import { TreeList } from '@/components/tree-list.ts';
import { Data } from '@/data/data-object.ts';
import { Team } from '@/data/team-window.ts';
import { Easing } from '@/data/transition-window.ts';
import { Palette } from './palette.ts';
import { FrameGenerator } from './tile-frame-generator.ts';
import { TileFrame } from './tile-frame-index.ts';
import { SceneShift } from '@/scene/move-scene.ts';
import { Local } from '@/tools/localization.ts';
import { SetQuantity } from '@/tools/set-number-window.ts';
import { GlobalClipboard } from '@/util/clipboard.ts';

type AutoTileClipboardData = AutoTileTemplateData | { frame: unknown };

interface ClipboardShape {
	has(format: string): boolean;
	read(format: string): (AutoTileTemplateData & { frame?: unknown }) | undefined;
	write(format: string, object: AutoTileClipboardData): void;
}

type AutoTileNodeData = {
	rule: number;
	frames: number[];
};

type AutoTileTemplateData = {
	id: string;
	name: string;
	cover: number;
	nodes: AutoTileNodeData[];
};

type AutoTileOpenParams = {
	template: string;
	image: string;
	x: number;
	y: number;
};

export const AutoTile: Record<string, any> = {
	canvas: null,
	templateList: null,
	nodeList: null,
	frameList: null,
	templates: null,
	template: null,
	nodes: null,
	node: null,
	nodeIndex: null,
	nodeMaximum: null,
	frames: null,
	frameIndex: null,
	frameMaximum: null,
	noImage: Symbol(),
	imageId: null,
	image: null,
	offsetX: null,
	offsetY: null,
	changed: false,
	initialize: null,
	open: null,
	create: null,
	insertTemplate: null,
	copyTemplate: null,
	pasteTemplate: null,
	deleteTemplate: null,
	shiftTemplateFrames: null,
	createTemplateId: null,
	createTemplateData: null,
	getTemplateById: null,
	insertNode: null,
	cutNode: null,
	copyNode: null,
	pasteNode: null,
	deleteNode: null,
	setNodeQuantity: null,
	createNodeData: null,
	createNodeItems: null,
	editFrame: null,
	insertFrame: null,
	cutFrame: null,
	copyFrame: null,
	pasteFrame: null,
	deleteFrame: null,
	setFrameQuantity: null,
	generateFrames: null,
	createFrameData: null,
	createFrameItems: null,
	updateFrameItem: null,
	updateCanvas: null,
	drawFrame: null,
	windowClose: null,
	windowClosed: null,
	dprchange: null,
	templatesKeydown: null,
	templatesSelect: null,
	templatesChange: null,
	templatesPopup: null,
	nodesWrite: null,
	nodesPopup: null,
	nodesKeydown: null,
	ruleNeighborInput: null,
	framesWrite: null,
	framesPopup: null,
	framesKeydown: null,
	framesDoubleclick: null,
	canvasClick: null,
	imageInput: null,
	offsetXInput: null,
	offsetYInput: null,
	confirm: null
};

function ensureDomBound() {
	if (AutoTile.templateList) return;
	const templateList = $('#autoTile-templates');
	if (!templateList) return;
	AutoTile.canvas = $('#autoTile-canvas');
	AutoTile.templateList = templateList;
	AutoTile.nodeList = $('#autoTile-nodes');
	AutoTile.frameList = $('#autoTile-frames');
	templateList.updateNodeElement = Easing.list_updateNodeElement as unknown as (
		...args: unknown[]
	) => unknown;
	templateList.updateItemName = Team.list_updateItemName as unknown as (
		...args: unknown[]
	) => unknown;
	templateList.addElementClass = Easing.list_addElementClass as unknown as (
		...args: unknown[]
	) => unknown;
	templateList.updateTextNode = Easing.list_updateTextNode as unknown as (
		...args: unknown[]
	) => unknown;
}

AutoTile.initialize = function (this: typeof AutoTile) {
	ensureDomBound();
	if (!AutoTile.templateList) return;
	this.nodeMaximum = 64;
	this.frameMaximum = 256;

	const list = this.templateList;
	getListConfig(list).removable = true;
	getListConfig(list).renamable = true;
	list.bind(() => this.templates);
	getListConfig(list).creators.push(list.addElementClass);
	getListConfig(list).updaters.push(list.updateTextNode);

	window.addEventListener('dprchange', this.dprchange);
	on($('#autoTile'), 'close', this.windowClose);
	on($('#autoTile'), 'closed', this.windowClosed);
	on(list, 'keydown', this.templatesKeydown);
	// list select/popup 经 Vue 模板转发（AutoTile.vue @select/@popup → AutoTile.templates*）
	// list change 经 Vue 模板转发（AutoTile.vue @change → AutoTile.templatesChange）
	on(this.nodeList, 'write', this.nodesWrite);
	on(this.nodeList, 'popup', this.nodesPopup);
	on(this.nodeList, 'keydown', this.nodesKeydown);
	document
		.querySelectorAll('.autoTile-neighbor')
		.forEach((el) => el.addEventListener('input', this.ruleNeighborInput!));
	on(this.frameList, 'write', this.framesWrite);
	on(this.frameList, 'popup', this.framesPopup);
	on(this.frameList, 'keydown', this.framesKeydown);
	on(this.frameList, 'doubleclick', this.framesDoubleclick);
	on($('#autoTile-canvas'), 'click', this.canvasClick);
	on($('#autoTile-image'), 'input', this.imageInput);
	on($('#autoTile-x'), 'input', this.offsetXInput);
	on($('#autoTile-y'), 'input', this.offsetYInput);
	on($('#autoTile-confirm'), 'click', this.confirm);
};

AutoTile.open = function (this: typeof AutoTile, { template, image, x, y }: AutoTileOpenParams) {
	Window.open!('autoTile');
	write($('#autoTile-image'), image);
	write($('#autoTile-x'), x);
	write($('#autoTile-y'), y);
	this.templates = Object.clone(Data.autotiles);
	this.nodeIndex = 0;
	this.frameIndex = 0;
	this.imageId = image;
	this.offsetX = x;
	this.offsetY = y;
	this.updateCanvas();
	this.templateList.update();
	this.templateList.select(this.getTemplateById(template) ?? this.templates[0]);
	this.templateList.scrollToSelection();
	getFocus($('#autoTile-image'));
};

AutoTile.create = function (this: typeof AutoTile) {
	return {
		template: Data.autotiles[0].id,
		image: '',
		x: 0,
		y: 0
	};
};

AutoTile.insertTemplate = function (this: typeof AutoTile, dItem: AutoTileTemplateData | null) {
	this.templateList.addNodeTo(this.createTemplateData(), dItem);
};

AutoTile.copyTemplate = function (this: typeof AutoTile, item: AutoTileTemplateData | null) {
	if (item) {
		(GlobalClipboard as unknown as ClipboardShape).write('yami.ruletile.template', item);
	}
};

AutoTile.pasteTemplate = function (this: typeof AutoTile, dItem: AutoTileTemplateData | null) {
	const copy = (GlobalClipboard as unknown as ClipboardShape).read('yami.ruletile.template');
	if (copy) {
		copy.name += ' - Copy';
		copy.id = this.createTemplateId();
		this.templateList.addNodeTo(copy, dItem);
	}
};

AutoTile.deleteTemplate = function (this: typeof AutoTile, item: AutoTileTemplateData) {
	const items = this.templates;
	if (items.length > 1) {
		const get = Local.createGetter!('confirmation');
		Window.confirm!(
			{
				message: get('deleteSingleFile').replace('<filename>', item.name)
			},
			[
				{
					label: get('yes'),
					click: () => {
						const index = items.indexOf(item);
						this.templateList.deleteNode(item);
						const last = items.length - 1;
						const target = items[Math.min(index, last)];
						this.templateList.select(target);
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
};

AutoTile.shiftTemplateFrames = function (
	this: typeof AutoTile,
	template: AutoTileTemplateData,
	offsetX: number,
	offsetY: number
) {
	const sprite = this.image;
	if (!(sprite instanceof Image)) {
		return;
	}
	const tileWidth = Palette.tileset.tileWidth;
	const tileHeight = Palette.tileset.tileHeight;
	const hframes = Math.floor(sprite.naturalWidth / tileWidth);
	const vframes = Math.floor(sprite.naturalHeight / tileHeight);
	const ox = ((offsetX % hframes) + hframes) % hframes;
	const oy = ((offsetY % vframes) + vframes) % vframes;
	for (const node of template.nodes) {
		const frames = node.frames;
		const length = frames.length;
		for (let i = 0; i < length; i++) {
			const frame = frames[i];
			const sx = frame & 0xff;
			const sy = frame >> 8;
			const dx = (sx + ox) % hframes;
			const dy = (sy + oy) % vframes;
			frames[i] = dx | (dy << 8);
		}
	}
	this.createFrameItems();
	this.changed = true;
};

AutoTile.createTemplateId = function (this: typeof AutoTile) {
	let id;
	do {
		id = GUID.generate64bit();
	} while (this.getTemplateById(id));
	return id;
};

AutoTile.createTemplateData = function (this: typeof AutoTile) {
	return {
		id: this.createTemplateId(),
		name: '',
		cover: 0,
		nodes: [this.createNodeData()]
	};
};

AutoTile.getTemplateById = function (this: typeof AutoTile, id: string) {
	const { templates } = this;
	const { length } = templates;
	for (let i = 0; i < length; i++) {
		if (templates[i].id === id) {
			return templates[i];
		}
	}
	return undefined;
};

AutoTile.insertNode = function (this: typeof AutoTile, id = this.nodeIndex) {
	if (id <= this.nodes.length) {
		this.nodes.splice(id, 0, this.createNodeData());
		if (this.template.cover >= id) {
			this.template.cover += 1;
		}
		this.createNodeItems(id);
		this.changed = true;
	}
};

AutoTile.cutNode = function (this: typeof AutoTile, id = this.nodeIndex) {
	if (this.nodes.length > 1) {
		this.copyNode(id);
		this.deleteNode(id);
	}
};

AutoTile.copyNode = function (this: typeof AutoTile, id = this.nodeIndex) {
	if (id < this.nodes.length) {
		(GlobalClipboard as unknown as ClipboardShape).write('yami.ruletile.node', this.nodes[id]);
	}
};

AutoTile.pasteNode = function (this: typeof AutoTile, id = this.nodes.length) {
	const copy = (GlobalClipboard as unknown as ClipboardShape).read('yami.ruletile.node');
	if (copy && id <= this.nodes.length) {
		this.nodes.splice(id, 0, copy);
		this.createNodeItems(id);
		this.changed = true;
	}
};

AutoTile.deleteNode = function (this: typeof AutoTile, id = this.nodeIndex) {
	if (id < this.nodes.length && this.nodes.length > 1) {
		this.nodes.splice(id, 1);
		if (this.template.cover >= id) {
			if (this.template.cover === id) {
				this.template.cover = 0;
			} else {
				this.template.cover -= 1;
			}
		}
		this.createNodeItems();
		this.changed = true;
	}
};

AutoTile.setNodeQuantity = function (this: typeof AutoTile, count: number) {
	const nodes = this.nodes;
	const length = nodes.length;
	if (length !== count) {
		nodes.length = count;
		if (length < count) {
			for (let i = length; i < count; i++) {
				nodes[i] = this.createNodeData();
			}
		}
		if (this.template.cover >= count) {
			this.template.cover = 0;
		}
		this.createNodeItems();
		this.changed = true;
	}
};

AutoTile.createNodeData = function (this: typeof AutoTile) {
	return {
		rule: 0,
		frames: [this.createFrameData()]
	};
};

AutoTile.createNodeItems = function (this: typeof AutoTile, id = this.nodeIndex) {
	const list = this.nodeList.reload();
	const cover = this.template.cover;
	const nodes = this.nodes;
	const length = nodes.length;
	const digits = Number.computeIndexDigits(length);
	for (let i = 0; i < length; i++) {
		const element = document.createElement('common-item');
		const index = i.toString().padStart(digits, '0');
		element.textContent = `#${index}${i === cover ? ' !' : ''}`;
		element.dataValue = i;
		list.appendElement(element);
	}
	list.update();
	write(list, Math.min(id, length - 1));
};

AutoTile.editFrame = function (this: typeof AutoTile) {
	if (this.image !== null) {
		TileFrame.open!();
	}
};

AutoTile.insertFrame = function (this: typeof AutoTile, id = this.frameIndex) {
	if (id <= this.frames.length) {
		this.frames.splice(id, 0, this.createFrameData());
		this.createFrameItems(id);
		this.changed = true;
	}
};

AutoTile.cutFrame = function (this: typeof AutoTile, id = this.frameIndex) {
	if (this.frames.length > 1) {
		this.copyFrame(id);
		this.deleteFrame(id);
	}
};

AutoTile.copyFrame = function (this: typeof AutoTile, id = this.frameIndex) {
	if (id < this.frames.length) {
		(GlobalClipboard as unknown as ClipboardShape).write('yami.ruletile.frame', {
			frame: this.frames[id]
		});
	}
};

AutoTile.pasteFrame = function (this: typeof AutoTile, id = this.frames.length) {
	const copy = (GlobalClipboard as unknown as ClipboardShape).read('yami.ruletile.frame');
	if (copy && id <= this.frames.length) {
		this.frames.splice(id, 0, copy.frame);
		this.createFrameItems(id);
		this.changed = true;
	}
};

AutoTile.deleteFrame = function (this: typeof AutoTile, id = this.frameIndex) {
	if (id < this.frames.length && this.frames.length > 1) {
		this.frames.splice(id, 1);
		this.createFrameItems();
		this.changed = true;
	}
};

AutoTile.setFrameQuantity = function (this: typeof AutoTile, count: number) {
	const frames = this.frames;
	const length = frames.length;
	if (length !== count) {
		frames.length = count;
		if (length < count) {
			for (let i = length; i < count; i++) {
				frames[i] = this.createFrameData();
			}
		}
		this.createFrameItems();
		this.changed = true;
	}
};

AutoTile.generateFrames = function (
	this: typeof AutoTile,
	id: number,
	strideX: number,
	strideY: number,
	count: number
) {
	const sprite = this.image;
	if (!(sprite instanceof Image)) {
		return;
	}
	const tileWidth = Palette.tileset.tileWidth;
	const tileHeight = Palette.tileset.tileHeight;
	const hframes = Math.floor(sprite.naturalWidth / tileWidth);
	const vframes = Math.floor(sprite.naturalHeight / tileHeight);
	const ox = ((strideX % hframes) + hframes) % hframes;
	const oy = ((strideY % vframes) + vframes) % vframes;
	const maximum = this.frameMaximum;
	const frames = this.frames;
	const frame = frames[id];
	let x = frame & 0xff;
	let y = frame >> 8;
	count = Math.min(count, maximum - frames.length);
	while (count-- > 0) {
		x = (x + ox) % hframes;
		y = (y + oy) % vframes;
		frames.splice(++id, 0, x | (y << 8));
	}
	this.createFrameItems();
	this.changed = true;
};

AutoTile.createFrameData = function (this: typeof AutoTile) {
	return 0;
};

AutoTile.createFrameItems = function (this: typeof AutoTile, id = this.frameIndex) {
	const list = this.frameList.reload();
	const frames = this.frames;
	const length = frames.length;
	const digits = Number.computeIndexDigits(length);
	for (let i = 0; i < length; i++) {
		const frame = frames[i];
		const x = frame & 0xff;
		const y = frame >> 8;
		const element = document.createElement('common-item');
		const index = i.toString().padStart(digits, '0');
		element.textContent = `#${index}: ${x},${y}`;
		Object.defineProperty(element, 'dataValue', {
			configurable: true,
			get: () => i
		});
		list.appendElement(element);
	}
	list.update();
	write(list, Math.min(id, frames.length - 1));
};

AutoTile.updateFrameItem = function (this: typeof AutoTile) {
	const frames = this.frames;
	const index = this.frameIndex;
	const length = frames.length;
	const frame = frames[index];
	const prefix = Number.padZero(index, length);
	const x = frame & 0xff;
	const y = frame >> 8;
	this.frameList.selection.textContent = `#${prefix}: ${x},${y}`;
	this.drawFrame();
};

AutoTile.updateCanvas = function (this: typeof AutoTile) {
	const canvas = this.canvas;
	const { width, height } = CSS.getDevicePixelContentBoxSize(canvas);
	if (canvas.width !== width) {
		canvas.width = width;
	}
	if (canvas.height !== height) {
		canvas.height = height;
	}
};

AutoTile.drawFrame = function (this: typeof AutoTile) {
	const canvas = this.canvas;
	const context = canvas.getContext('2d');
	const width = canvas.width;
	const height = canvas.height;

	context.clearRect(0, 0, width, height);

	if (!(this.image instanceof Image)) {
		if (this.image === this.noImage) return;
		const guid = this.imageId;
		if (!guid) {
			return;
		}
		const symbol = (this.image = Symbol());
		return File.get!({
			guid: guid,
			type: 'image'
		}).then((image: CanvasImageSource | null) => {
			if (this.image === symbol) {
				if (image) {
					this.image = image;
					this.drawFrame();
				} else {
					this.image = this.noImage;
				}
			}
		});
	}

	const image = this.image;
	const frames = this.frames;
	const frame = frames[this.frameIndex];
	const tileWidth = Palette.tileset.tileWidth;
	const tileHeight = Palette.tileset.tileHeight;
	const x = (this.offsetX + (frame & 0xff)) * tileWidth;
	const y = (this.offsetY + (frame >> 8)) * tileHeight;

	drawAndFitImage(context, image, x, y, tileWidth, tileHeight);
};

AutoTile.windowClose = function (this: typeof AutoTile, event: Event) {
	if (this.changed) {
		event.preventDefault();
		const get = Local.createGetter!('confirmation');
		Window.confirm!(
			{
				message: get('closeUnsavedTiles')
			},
			[
				{
					label: get('yes'),
					click: () => {
						this.changed = false;
						Window.close!('autoTile');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
}.bind(AutoTile);

AutoTile.windowClosed = function (this: typeof AutoTile, event: Event) {
	this.templates = null;
	this.template = null;
	this.nodes = null;
	this.node = null;
	this.frames = null;
	this.image = null;
	this.updateCanvas();
	clear(this.templateList);
	clear(this.nodeList);
	clear(this.frameList);
}.bind(AutoTile);

AutoTile.dprchange = function (this: typeof AutoTile, event: Event) {
	if (this.nodes !== null) {
		this.updateCanvas();
		this.drawFrame();
	}
}.bind(AutoTile);

AutoTile.templatesKeydown = function (this: typeof AutoTile, event: KeyboardEvent) {
	const item = read(this);
	if (event.ctrlKey || event.metaKey) {
		switch (event.code) {
			case 'KeyC':
				AutoTile.copyTemplate!(item);
				break;
			case 'KeyV':
				AutoTile.pasteTemplate!();
				break;
		}
	} else if (event.altKey) {
		return;
	} else {
		switch (event.code) {
			case 'Insert':
				AutoTile.insertTemplate!(item);
				break;
			case 'Delete':
				AutoTile.deleteTemplate!(item);
				break;
		}
	}
};

AutoTile.templatesSelect = function (
	this: typeof AutoTile,
	event: Event & { value?: AutoTileTemplateData }
) {
	const item = event.value;
	this.template = item;
	this.nodes = item.nodes;

	this.createNodeItems();
}.bind(AutoTile);

AutoTile.templatesChange = function (this: typeof AutoTile, event: Event) {
	this.changed = true;
}.bind(AutoTile);

AutoTile.templatesPopup = function (
	this: typeof AutoTile,
	event: MouseEvent & { value?: AutoTileTemplateData | null }
) {
	const list = AutoTile.templateList;
	const item = event.value;
	const selected = !!item;
	const pastable = (GlobalClipboard as unknown as ClipboardShape).has('yami.ruletile.template');
	const deletable = selected && AutoTile.templates.length > 1;
	const get = Local.createGetter!('menuAutoTileTemplateList');
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
					AutoTile.insertTemplate!(item);
				}
			},
			{
				label: get('copy'),
				accelerator: ctrl('C'),
				enabled: selected,
				click: () => {
					AutoTile.copyTemplate!(item);
				}
			},
			{
				label: get('paste'),
				accelerator: ctrl('V'),
				enabled: pastable,
				click: () => {
					AutoTile.pasteTemplate!(item);
				}
			},
			{
				label: get('delete'),
				accelerator: 'Delete',
				enabled: deletable,
				click: () => {
					AutoTile.deleteTemplate!(item);
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
				type: 'separator'
			},
			{
				label: get('shift'),
				enabled: selected,
				click: () => {
					SceneShift.open!((x: number, y: number) => {
						AutoTile.shiftTemplateFrames!(item, x, y);
					});
				}
			}
		]
	);
};

AutoTile.nodesWrite = function (this: typeof AutoTile, event: Event & { value?: number }) {
	const nodeIndex = event.value;
	this.nodeIndex = nodeIndex;
	this.node = this.nodes[nodeIndex];
	this.frames = this.node.frames;
	const write = getElementWriter('autoTile');
	const rule = this.node.rule;
	write('rule-0', rule & 0b11);
	write('rule-1', (rule >> 2) & 0b11);
	write('rule-2', (rule >> 4) & 0b11);
	write('rule-3', (rule >> 6) & 0b11);
	write('rule-4', (rule >> 8) & 0b11);
	write('rule-5', (rule >> 10) & 0b11);
	write('rule-6', (rule >> 12) & 0b11);
	write('rule-7', (rule >> 14) & 0b11);

	this.createFrameItems();
}.bind(AutoTile);

AutoTile.nodesPopup = function (
	this: typeof AutoTile,
	event: MouseEvent & { value?: number | null }
) {
	const id = event.value;
	const cover = this.template.cover;
	const nodes = this.nodes;
	const selected = id !== null;
	const insertable = nodes.length < this.nodeMaximum;
	const copyable = selected;
	const pastable =
		insertable && (GlobalClipboard as unknown as ClipboardShape).has('yami.ruletile.node');
	const deletable = selected && nodes.length > 1;
	const coverable = selected && id !== cover;
	const get = Local.createGetter!('menuAutoTileNodeList');
	Menu.popup(
		{
			x: event.clientX,
			y: event.clientY
		},
		[
			{
				label: get('insert'),
				accelerator: 'Insert',
				enabled: insertable,
				click: () => {
					this.insertNode(id ?? nodes.length);
				}
			},
			{
				label: get('cut'),
				accelerator: ctrl('X'),
				enabled: deletable,
				click: () => {
					this.cutNode(id);
				}
			},
			{
				label: get('copy'),
				accelerator: ctrl('C'),
				enabled: copyable,
				click: () => {
					this.copyNode(id);
				}
			},
			{
				label: get('paste'),
				accelerator: ctrl('V'),
				enabled: pastable,
				click: () => {
					this.pasteNode(id ?? nodes.length);
				}
			},
			{
				label: get('delete'),
				accelerator: 'Delete',
				enabled: deletable,
				click: () => {
					this.deleteNode(id);
				}
			},
			{
				label: get('setQuantity'),
				click: () => {
					SetQuantity.open!(
						nodes.length,
						this.nodeMaximum,
						this.setNodeQuantity.bind(this)
					);
				}
			},
			{
				type: 'separator'
			},
			{
				label: get('setAsCover'),
				enabled: coverable,
				click: () => {
					this.template.cover = id;
					this.changed = true;
					this.createNodeItems();
				}
			}
		]
	);
}.bind(AutoTile);

AutoTile.nodesKeydown = function (this: typeof AutoTile, event: KeyboardEvent) {
	if (event.ctrlKey || event.metaKey) {
		switch (event.code) {
			case 'KeyX':
				AutoTile.cutNode!();
				break;
			case 'KeyC':
				AutoTile.copyNode!();
				break;
			case 'KeyV':
				AutoTile.pasteNode!();
				break;
		}
	} else if (event.altKey) {
		return;
	} else {
		switch (event.code) {
			case 'Insert':
				AutoTile.insertNode!();
				break;
			case 'Delete':
				AutoTile.deleteNode!();
				break;
		}
	}
};

AutoTile.ruleNeighborInput = function (this: typeof AutoTile, event: Event) {
	const read = getElementReader('autoTile-rule');
	const rule =
		read('0') |
		(read('1') << 2) |
		(read('2') << 4) |
		(read('3') << 6) |
		(read('4') << 8) |
		(read('5') << 10) |
		(read('6') << 12) |
		(read('7') << 14);
	AutoTile.node.rule = rule;
	AutoTile.changed = true;
};

AutoTile.framesWrite = function (this: typeof AutoTile, event: Event & { value?: number }) {
	this.frameIndex = event.value;
	this.drawFrame();
}.bind(AutoTile);

AutoTile.framesPopup = function (
	this: typeof AutoTile,
	event: MouseEvent & { value?: number | null }
) {
	const id = event.value;
	const frames = this.frames;
	const selected = id !== null;
	const editable = selected && this.image instanceof Image;
	const insertable = frames.length < this.frameMaximum;
	const copyable = selected;
	const pastable =
		insertable && (GlobalClipboard as unknown as ClipboardShape).has('yami.ruletile.frame');
	const deletable = selected && frames.length > 1;
	const get = Local.createGetter!('menuAutoTileFrameList');
	Menu.popup(
		{
			x: event.clientX,
			y: event.clientY
		},
		[
			{
				label: get('edit'),
				accelerator: 'Enter',
				enabled: editable,
				click: () => {
					this.editFrame();
				}
			},
			{
				label: get('insert'),
				accelerator: 'Insert',
				enabled: insertable,
				click: () => {
					this.insertFrame(id ?? frames.length);
				}
			},
			{
				label: get('cut'),
				accelerator: ctrl('X'),
				enabled: deletable,
				click: () => {
					this.cutFrame(id);
				}
			},
			{
				label: get('copy'),
				accelerator: ctrl('C'),
				enabled: copyable,
				click: () => {
					this.copyFrame(id);
				}
			},
			{
				label: get('paste'),
				accelerator: ctrl('V'),
				enabled: pastable,
				click: () => {
					this.pasteFrame(id ?? frames.length);
				}
			},
			{
				label: get('delete'),
				accelerator: 'Delete',
				enabled: deletable,
				click: () => {
					this.deleteFrame(id);
				}
			},
			{
				label: get('setQuantity'),
				click: () => {
					SetQuantity.open!(
						frames.length,
						this.frameMaximum,
						this.setFrameQuantity.bind(this)
					);
				}
			},
			{
				type: 'separator'
			},
			{
				label: get('generate'),
				enabled: editable && insertable,
				click: () => {
					FrameGenerator.open!((x: number, y: number, count: number) => {
						this.generateFrames(id, x, y, count);
					});
				}
			}
		]
	);
}.bind(AutoTile);

AutoTile.framesKeydown = function (this: typeof AutoTile, event: KeyboardEvent) {
	if (event.ctrlKey || event.metaKey) {
		switch (event.code) {
			case 'KeyX':
				AutoTile.cutFrame!();
				break;
			case 'KeyC':
				AutoTile.copyFrame!();
				break;
			case 'KeyV':
				AutoTile.pasteFrame!();
				break;
		}
	} else if (event.altKey) {
		return;
	} else {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				event.stopPropagation();
				AutoTile.editFrame!();
				break;
			case 'Insert':
				AutoTile.insertFrame!();
				break;
			case 'Delete':
				AutoTile.deleteFrame!();
				break;
		}
	}
};

AutoTile.framesDoubleclick = function (this: typeof AutoTile, event: MouseEvent) {
	const element = event.target as HTMLElement;
	if (element.tagName === 'COMMON-ITEM' && hasClass(element, 'selected')) {
		this.editFrame();
	}
}.bind(AutoTile);

AutoTile.canvasClick = function (this: typeof AutoTile, event: Event) {
	this.editFrame();
}.bind(AutoTile);

AutoTile.imageInput = function (this: typeof AutoTile, event: Event) {
	AutoTile.imageId = read(this);
	AutoTile.image = null;
	AutoTile.drawFrame!();
};

AutoTile.offsetXInput = function (this: typeof AutoTile, event: Event) {
	const x = read(this);
	if (AutoTile.offsetX !== x) {
		AutoTile.offsetX = x;
		AutoTile.drawFrame!();
	}
};

AutoTile.offsetYInput = function (this: typeof AutoTile, event: Event) {
	const y = read(this);
	if (AutoTile.offsetY !== y) {
		AutoTile.offsetY = y;
		AutoTile.drawFrame!();
	}
};

AutoTile.confirm = function (this: typeof AutoTile, event: Event) {
	if (this.changed) {
		this.changed = false;
		const templates = this.templates;
		TreeList.deleteCaches(templates);
		Data.autotiles = templates;
		Data.createGUIDMap(templates);
		File.planToSave!(Data.manifest.project.autotiles);
	}
	const tiles = Palette.tileset.tiles;
	const index = Palette.openIndex;
	const isNew = !tiles[index];
	tiles[index] = {
		template: this.template.id,
		image: this.imageId,
		x: this.offsetX,
		y: this.offsetY
	};
	if (isNew) {
		const { marquee } = Palette;
		if (marquee.visible) {
			const { x, y, width, height } = marquee;
			Palette.selectTiles(x, y, width, height);
		}
	}
	File.planToSave!(Palette.meta);
	Palette.requestRendering();
	Scene.requestRendering();
	Window.close!('autoTile');
	// console.log(JSON.stringify(tiles[index], null, 2))
}.bind(AutoTile);
