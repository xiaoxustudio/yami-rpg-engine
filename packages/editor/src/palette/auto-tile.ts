import { elementDataOf, getListConfig } from '@ui-kit';
import { renderDetached } from '@app/utils/dom';
import { paletteEls } from '@app/palette/element-registry';
import { Window } from '@app/tools/window-object.ts';
import { on, hasClass, write, read, clear } from '@app/utils/element-utils.ts';
import { ctrl } from '@app/utils/event-accessors';
import { requestFocus } from '@app/directives/focus';
import { File } from '@app/file/file-system-core.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { GUID } from '@app/services/file-system/guid.ts';
import { Menu } from '@app/components/menu-list.ts';
import { TreeList } from '@app/components/tree-list.ts';
import { Data } from '@app/data/data-object.ts';
import { Team } from '@app/data/team-window.ts';
import { Easing } from '@app/data/transition-window.ts';
import { Palette } from './palette.ts';
import { FrameGenerator } from './tile-frame-generator.ts';
import { TileFrame } from './tile-frame-index.ts';
import { SceneShift } from '@app/scene/move-scene.ts';
import { AutoTileEngine } from '@app/engine/palette/auto-tile-engine.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { SetQuantity } from '@app/tools/set-number-window.ts';
import { GlobalClipboard } from '@app/utils/clipboard';
import { h } from 'vue';

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

// oxlint-disable-next-line no-explicit-any
export const AutoTile: Record<string, any> = {
	canvas: null,
	templateList: null,
	nodeList: null,
	frameList: null,
	nodes: null,
	node: null,
	nodeMaximum: null,
	frames: null,
	frameMaximum: null,
	noImage: Symbol(),
	image: null,
	initialize: null,
	open: null,
	create: null,
	insertTemplate: null,
	copyTemplate: null,
	pasteTemplate: null,
	deleteTemplate: null,
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
	createFrameItems: null,
	updateFrameItem: null,
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

AutoTile.updateCanvas = AutoTileEngine.updateCanvas;
AutoTile.drawFrame = AutoTileEngine.drawFrame;
AutoTile.createFrameData = AutoTileEngine.createFrameData;
AutoTile.generateFrames = AutoTileEngine.generateFrames;
AutoTile.shiftTemplateFrames = AutoTileEngine.shiftTemplateFrames;

function ensureDomBound(): boolean {
	const canvas = paletteEls.get('autoTile-canvas') as YamiElement;
	const templateList = paletteEls.get('autoTile-templates') as YamiElement;
	if (!templateList || !canvas) return false;
	if (AutoTile.templateList === templateList && AutoTile.canvas === canvas) return false;
	AutoTile.canvas = canvas;
	AutoTile.templateList = templateList;
	AutoTile.nodeList = paletteEls.get('autoTile-nodes') as YamiElement;
	AutoTile.frameList = paletteEls.get('autoTile-frames') as YamiElement;
	templateList.updateItemName = Team.list_updateItemName as (...args: unknown[]) => unknown;
	templateList.updateTextNode = Easing.list_updateTextNode as (...args: unknown[]) => unknown;
	return true;
}

function configureLists() {
	AutoTile.nodeMaximum = 64;
	AutoTile.frameMaximum = 256;

	const list = AutoTile.templateList;
	getListConfig(list).removable = true;
	getListConfig(list).foldable = false;
	getListConfig(list).renamable = true;
	list.bind(() => getAutoTileStore().templates);
	getListConfig(list).updaters.push(list.updateTextNode);
}

function registerWindowEvents() {
	const frame = paletteEls.get('autoTile') as YamiElement;
	if (!frame || !AutoTile.templateList || !AutoTile.nodeList || !AutoTile.frameList) return;
	window.addEventListener('dprchange', AutoTile.dprchange);
	on(frame, 'close', AutoTile.windowClose);
	on(frame, 'closed', AutoTile.windowClosed);
	on(AutoTile.templateList, 'keydown', AutoTile.templatesKeydown);
	// list select/popup 经 Vue 模板转发（AutoTile.vue @select/@popup → AutoTile.templates*）
	// list change 经 Vue 模板转发（AutoTile.vue @change → AutoTile.templatesChange）
	on(AutoTile.nodeList, 'keydown', AutoTile.nodesKeydown);
	on(AutoTile.frameList, 'keydown', AutoTile.framesKeydown);
	on(AutoTile.frameList, 'doubleclick', AutoTile.framesDoubleclick);
}

AutoTile.initialize = function (this: typeof AutoTile) {
	if (ensureDomBound()) {
		configureLists();
		registerWindowEvents();
	}
};

AutoTile.open = function (this: typeof AutoTile, { template, image, x, y }: AutoTileOpenParams) {
	if (ensureDomBound()) {
		configureLists();
		registerWindowEvents();
	}
	Window.open!('autoTile');
	getAutoTileStore().templates = deepClone(Data.autotiles);
	getAutoTileStore().nodeIndex = 0;
	getAutoTileStore().frameIndex = 0;
	getAutoTileStore().imageId = image;
	getAutoTileStore().offsetX = x;
	getAutoTileStore().offsetY = y;
	getAutoTileStore().changed = false;
	this.updateCanvas();
	this.templateList.update();
	this.templateList.select(this.getTemplateById(template) ?? getAutoTileStore().templates[0]);
	this.templateList.scrollToSelection();
	requestFocus('autoTile-image');
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
		GlobalClipboard.write('yami.ruletile.template', item);
	}
};

AutoTile.pasteTemplate = function (this: typeof AutoTile, dItem: AutoTileTemplateData | null) {
	const copy = GlobalClipboard.read('yami.ruletile.template');
	if (copy) {
		copy.name += ' - Copy';
		copy.id = this.createTemplateId();
		this.templateList.addNodeTo(copy, dItem);
	}
};

AutoTile.deleteTemplate = function (this: typeof AutoTile, item: AutoTileTemplateData) {
	const items = getAutoTileStore().templates;
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
	const { templates } = getAutoTileStore();
	if (!templates) return undefined;
	const { length } = templates;
	for (let i = 0; i < length; i++) {
		if (templates[i].id === id) {
			return templates[i];
		}
	}
	return undefined;
};

AutoTile.insertNode = function (this: typeof AutoTile, id = getAutoTileStore().nodeIndex) {
	if (id <= this.nodes.length) {
		this.nodes.splice(id, 0, this.createNodeData());
		if (getAutoTileStore().template.cover >= id) {
			getAutoTileStore().template.cover += 1;
		}
		this.createNodeItems(id);
		getAutoTileStore().changed = true;
	}
};

AutoTile.cutNode = function (this: typeof AutoTile, id = getAutoTileStore().nodeIndex) {
	if (this.nodes.length > 1) {
		this.copyNode(id);
		this.deleteNode(id);
	}
};

AutoTile.copyNode = function (this: typeof AutoTile, id = getAutoTileStore().nodeIndex) {
	if (id < this.nodes.length) {
		GlobalClipboard.write('yami.ruletile.node', this.nodes[id]);
	}
};

AutoTile.pasteNode = function (this: typeof AutoTile, id = this.nodes.length) {
	const copy = GlobalClipboard.read('yami.ruletile.node');
	if (copy && id <= this.nodes.length) {
		this.nodes.splice(id, 0, copy);
		this.createNodeItems(id);
		getAutoTileStore().changed = true;
	}
};

AutoTile.deleteNode = function (this: typeof AutoTile, id = getAutoTileStore().nodeIndex) {
	if (id < this.nodes.length && this.nodes.length > 1) {
		this.nodes.splice(id, 1);
		if (getAutoTileStore().template.cover >= id) {
			if (getAutoTileStore().template.cover === id) {
				getAutoTileStore().template.cover = 0;
			} else {
				getAutoTileStore().template.cover -= 1;
			}
		}
		this.createNodeItems();
		getAutoTileStore().changed = true;
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
		if (getAutoTileStore().template.cover >= count) {
			getAutoTileStore().template.cover = 0;
		}
		this.createNodeItems();
		getAutoTileStore().changed = true;
	}
};

AutoTile.createNodeData = function (this: typeof AutoTile) {
	return {
		rule: 0,
		frames: [this.createFrameData()]
	};
};

AutoTile.createNodeItems = function (this: typeof AutoTile, id = getAutoTileStore().nodeIndex) {
	const list = this.nodeList.reload();
	const cover = getAutoTileStore().template.cover;
	const nodes = this.nodes;
	const length = nodes.length;
	const digits = computeIndexDigits(length);
	for (let i = 0; i < length; i++) {
		const index = i.toString().padStart(digits, '0');
		// P1b：离屏节点统一走 utils/dom 的 renderDetached（原先 document.createElement + render）
		const element = renderDetached(
			h(
				'div',
				{ class: 'common-item', '.dataValue': i },
				`#${index}${i === cover ? ' !' : ''}`
			)
		);
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

AutoTile.insertFrame = function (this: typeof AutoTile, id = getAutoTileStore().frameIndex) {
	if (id <= this.frames.length) {
		this.frames.splice(id, 0, this.createFrameData());
		this.createFrameItems(id);
		getAutoTileStore().changed = true;
	}
};

AutoTile.cutFrame = function (this: typeof AutoTile, id = getAutoTileStore().frameIndex) {
	if (this.frames.length > 1) {
		this.copyFrame(id);
		this.deleteFrame(id);
	}
};

AutoTile.copyFrame = function (this: typeof AutoTile, id = getAutoTileStore().frameIndex) {
	if (id < this.frames.length) {
		GlobalClipboard.write('yami.ruletile.frame', {
			frame: this.frames[id]
		});
	}
};

AutoTile.pasteFrame = function (this: typeof AutoTile, id = this.frames.length) {
	const copy = GlobalClipboard.read('yami.ruletile.frame');
	if (copy && id <= this.frames.length) {
		this.frames.splice(id, 0, copy.frame);
		this.createFrameItems(id);
		getAutoTileStore().changed = true;
	}
};

AutoTile.deleteFrame = function (this: typeof AutoTile, id = getAutoTileStore().frameIndex) {
	if (id < this.frames.length && this.frames.length > 1) {
		this.frames.splice(id, 1);
		this.createFrameItems();
		getAutoTileStore().changed = true;
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
		getAutoTileStore().changed = true;
	}
};

AutoTile.createFrameItems = function (this: typeof AutoTile, id = getAutoTileStore().frameIndex) {
	const list = this.frameList.reload();
	const frames = this.frames;
	const length = frames.length;
	const digits = computeIndexDigits(length);
	for (let i = 0; i < length; i++) {
		const frame = frames[i];
		const x = frame & 0xff;
		const y = frame >> 8;
		const index = i.toString().padStart(digits, '0');
		// P1b：同上
		const element = renderDetached(
			h('div', { class: 'common-item', '.dataValue': i }, `#${index}: ${x},${y}`)
		);
		list.appendElement(element);
	}
	list.update();
	write(list, Math.min(id, frames.length - 1));
};

AutoTile.updateFrameItem = function (this: typeof AutoTile) {
	const frames = this.frames;
	const index = getAutoTileStore().frameIndex;
	const length = frames.length;
	const frame = frames[index];
	const prefix = padZero(index, length);
	const x = frame & 0xff;
	const y = frame >> 8;
	// P4b：`selection`（列表选中行元素）走显式元素数据。注：YMCommonList（Vue）把选中行存在组件闭包里、
	// 不再往元素数据上写 ⇒ 这里读到的是 `undefined`（迁移前同样如此），属既有行为，本次不改动。
	elementDataOf<{ selection: HTMLElement }>(this.frameList).selection.textContent =
		`#${prefix}: ${x},${y}`;
	this.drawFrame();
};

AutoTile.windowClose = function (this: typeof AutoTile, event: Event) {
	if (getAutoTileStore().changed) {
		event.preventDefault();
		const get = (key: string) => t('confirmation.' + key);
		Window.confirm!(
			{
				message: get('closeUnsavedTiles')
			},
			[
				{
					label: get('yes'),
					click: () => {
						getAutoTileStore().changed = false;
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

AutoTile.windowClosed = function (this: typeof AutoTile, _event: Event) {
	getAutoTileStore().templates = null;
	getAutoTileStore().template = null;
	this.nodes = null;
	this.node = null;
	this.frames = null;
	this.image = null;
	this.updateCanvas();
	clear(this.templateList);
	clear(this.nodeList);
	clear(this.frameList);
}.bind(AutoTile);

AutoTile.dprchange = function (this: typeof AutoTile, _event: Event) {
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
	getAutoTileStore().template = item;
	this.nodes = item!.nodes;

	this.createNodeItems();
}.bind(AutoTile);

AutoTile.templatesChange = function (this: typeof AutoTile, _event: Event) {
	getAutoTileStore().changed = true;
}.bind(AutoTile);

AutoTile.templatesPopup = function (
	this: typeof AutoTile,
	event: MouseEvent & { value?: AutoTileTemplateData | null }
) {
	const list = AutoTile.templateList;
	const item = event.value;
	const selected = !!item;
	const pastable = GlobalClipboard.has('yami.ruletile.template');
	const deletable = selected && getAutoTileStore().templates.length > 1;
	const get = (key: string) => t('menuAutoTileTemplateList.' + key);
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
	// 列表在「还没有任何节点」时也会派发 `write`（`event.value` 为 undefined），此时
	// `this.nodes[nodeIndex]` 是 undefined，旧写法会在下一行抛
	// `Cannot read properties of undefined (reading 'frames')`——这是一条**未捕获异常**
	// （窗口挂载期即触发，vitest 记为 "Uncaught Exception"，让 `pnpm test` 以退出码 1 结束，
	// 即使 2004/2004 全绿）。没有对应节点时按"无可选节点"处理：不写 store、不动 node/frames。
	const node = this.nodes?.[nodeIndex as number];
	if (!node) return;
	getAutoTileStore().nodeIndex = nodeIndex;
	this.node = node;
	this.frames = node.frames;
	const rule = node.rule;
	const ruleBits = getAutoTileStore().ruleBits;
	for (let i = 0; i < 8; i++) {
		ruleBits[i] = (rule >> (i * 2)) & 0b11;
	}

	this.createFrameItems();
}.bind(AutoTile);

AutoTile.nodesPopup = function (
	this: typeof AutoTile,
	event: MouseEvent & { value?: number | null }
) {
	const id = event.value;
	const cover = getAutoTileStore().template.cover;
	const nodes = this.nodes;
	const selected = id !== null;
	const insertable = nodes.length < this.nodeMaximum;
	const copyable = selected;
	const pastable = insertable && GlobalClipboard.has('yami.ruletile.node');
	const deletable = selected && nodes.length > 1;
	const coverable = selected && id !== cover;
	const get = (key: string) => t('menuAutoTileNodeList.' + key);
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
					getAutoTileStore().template.cover = id;
					getAutoTileStore().changed = true;
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

AutoTile.ruleNeighborInput = function (this: typeof AutoTile, _event: Event) {
	const ruleBits = getAutoTileStore().ruleBits;
	let rule = 0;
	for (let i = 0; i < 8; i++) {
		rule |= ruleBits[i] << (i * 2);
	}
	AutoTile.node.rule = rule;
	getAutoTileStore().changed = true;
};

AutoTile.framesWrite = function (this: typeof AutoTile, event: Event & { value?: number }) {
	getAutoTileStore().frameIndex = event.value;
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
	const pastable = insertable && GlobalClipboard.has('yami.ruletile.frame');
	const deletable = selected && frames.length > 1;
	const get = (key: string) => t('menuAutoTileFrameList.' + key);
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
	if (hasClass(element, 'common-item') && hasClass(element, 'selected')) {
		this.editFrame();
	}
}.bind(AutoTile);

AutoTile.canvasClick = function (this: typeof AutoTile, _event: Event) {
	this.editFrame();
}.bind(AutoTile);

AutoTile.imageInput = function (this: typeof AutoTile, _event: Event) {
	AutoTile.imageId = getAutoTileStore().imageId;
	AutoTile.image = null;
	AutoTile.drawFrame!();
};

AutoTile.offsetXInput = function (this: typeof AutoTile, _event: Event) {
	const x = getAutoTileStore().offsetX;
	if (AutoTile.offsetX !== x) {
		AutoTile.offsetX = x;
		AutoTile.drawFrame!();
	}
};

AutoTile.offsetYInput = function (this: typeof AutoTile, _event: Event) {
	const y = getAutoTileStore().offsetY;
	if (AutoTile.offsetY !== y) {
		AutoTile.offsetY = y;
		AutoTile.drawFrame!();
	}
};

AutoTile.confirm = function (this: typeof AutoTile, _event: Event) {
	if (getAutoTileStore().changed) {
		getAutoTileStore().changed = false;
		const templates = getAutoTileStore().templates;
		TreeList.deleteCaches(templates);
		Data.autotiles = templates;
		Data.createGUIDMap(templates);
		File.planToSave!(Data.manifest.project.autotiles);
	}
	const tiles = Palette.tileset.tiles;
	const index = Palette.openIndex;
	const isNew = !tiles[index];
	tiles[index] = {
		template: getAutoTileStore().template.id,
		image: getAutoTileStore().imageId,
		x: getAutoTileStore().offsetX,
		y: getAutoTileStore().offsetY
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
	Scene.requestRendering!();
	Window.close!('autoTile');
}.bind(AutoTile);

const autoTileBridgeKeys = [
	'templates',
	'template',
	'nodeIndex',
	'frameIndex',
	'offsetX',
	'offsetY',
	'imageId',
	'changed'
] as const;
import { getAutoTileStore } from '@app/stores/auto-tile';
import type { YamiElement } from '@app/types/element-api';
import { computeIndexDigits, padZero } from '@app/utils/number';
import { clone as deepClone } from '@app/utils/object';

for (const key of autoTileBridgeKeys) {
	Object.defineProperty(AutoTile, key, {
		get: () => getAutoTileStore()[key],
		set: (value: unknown) => {
			Reflect.set(getAutoTileStore(), key, value);
		},
		configurable: true
	});
}
