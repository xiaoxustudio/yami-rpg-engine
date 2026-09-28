import { elementDataOf, getListConfig } from '@ui-kit';
import { registryElement } from '@app/utils/element-registry';
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

export type AutoTileNodeData = {
	rule: number;
	frames: number[];
};

/**
 * 模板数据（`AutoTile.vue` 的列表行取值、`getTemplateById` 的返回）。
 * **导出**：桥接层（`components/tools/AutoTile.vue`）要按这个形状收窄 `YMCommonList`
 * 那种 `value: unknown` 的载荷。
 */
export type AutoTileTemplateData = {
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

/**
 * 模板列表元素。`YamiElement`（`@ui-kit` 的元素 API 契约）已经带了列表族方法面
 * （`update` / `select` / `addNodeTo` / `reload` / `rename` / `selectWithNoEvent` …），
 * 这里只补本文件真的用到、而通用契约里没有的那一条：**树列表的 `deleteNode`**
 * （通用契约只有 `delete(...)`，语义不同）。
 *
 * 与 `composables/useTeamWindow.ts` 的 `TeamListElement` 是同一手法（按读点补具名成员，
 * 而不是给整个元素开索引签名）。
 */
type AutoTileListElement = YamiElement & {
	deleteNode(item: AutoTileTemplateData): void;
};

/**
 * 自动图块（ruletile）窗口单例的成员表。
 *
 * ## 为什么现在才收（第 233 轮，`any-hatches` 收口）
 *
 * 此前是 `export const AutoTile: Record<string, any> = { …58 个 null 占位… }`：
 * 那一行让**任何**成员名、**任何**赋值形状都通过编译 —— 而本文件有 974 行、约 60 个成员，
 * 外面还有 180 处 `AutoTile.x` 读点（`monkey-patches.ts` 还会往上挂 `templateCounts`）。
 * 代价与 `palette-engine.ts` / `scene-*-engine.ts` 那几处同源：拼错成员名 = 运行期静默 `undefined`。
 *
 * ## 写法（照 `tile-frame-index.ts` 的既有口径）
 *
 * - 字面量里**只放可变数据字段**（DOM 句柄、当前节点/帧、图像缓存），方法一律在字面量**之后**
 *   逐个赋值 ⇒ 方法成员在类型上是**非空**的，读点因此**不必补 `!`**
 *   （字面量里若留 `initialize: null` 占位，就得给每个调用点补 `!` —— 那是 `TileFrame` 注释里
 *   已经记过的取舍）。
 * - 结尾用 `satisfies Partial<AutoTileShape> as Partial<AutoTileShape> as AutoTileShape`：
 *   `satisfies` 让**出现在字面量里的每个键**都受检查（拼错键、初值类型不对当场报错），
 *   三个 `as` 之前的两段是「方法稍后装配」这条既有事实的类型表达。
 * - 方法成员**不写 `this` 形参**：实现处自己标了 `this: typeof AutoTile`，写进接口反而会让
 *   `window.addEventListener` / `on(...)` 这些监听器位置不可比（同 `TileFrameShape` 的说明）。
 *
 * ## 三个可空字段是真的可空（不是「没来得及收」）
 *
 * `ensureDomBound()` 明确判过 `if (!templateList || !canvas) return false;`（模板 ref 可能还没登记），
 * `windowClosed()` 真的把 `nodes/node/frames/image` 置 `null`，三个列表也允许为 `null`
 * ⇒ 这些成员按**可空**声明，读点用 `!` 表达「已装配/已选中」这条不变式。
 */
interface AutoTileShape {
	// —— 可变数据字段（字面量里给初值） ——
	canvas: HTMLCanvasElement | null;
	templateList: AutoTileListElement | null;
	nodeList: YamiElement | null;
	frameList: YamiElement | null;
	nodes: AutoTileNodeData[] | null;
	node: AutoTileNodeData | null;
	nodeMaximum: number | null;
	frames: number[] | null;
	frameMaximum: number | null;
	/** 「无图」哨兵：`drawFrame` 用**同一个** symbol 判断异步载图是否已被覆盖（`===` 比较） */
	noImage: symbol;
	/**
	 * 当前贴图。三种状态都是运行时真实存在的：
	 * `null`（还没打开）、`symbol`（载图中，就是上面的 `noImage`）、`HTMLImageElement`（已载入）。
	 * 类型用 `HTMLImageElement` 而不是 `CanvasImageSource`：读点要 `.src` / `.naturalWidth`
	 * （`tile-frame-index.ts:178`），而 `file-system-core.ts:25` 的 `File.promises` 也把
	 * 图片缓存声明成 `Promise<HTMLImageElement>`。
	 */
	image: HTMLImageElement | symbol | null;
	/** `module/monkey-patches.ts:193` 给模板列表行渲染挂上的「模板 id → 节点数」（可增可减）。 */
	templateCounts?: Record<string, number>;

	// —— 单例方法（字面量之后装配；类型上非空） ——
	initialize: () => void;
	open: (params: AutoTileOpenParams) => void;
	/** 新建自动图块时给外面用的默认参数（`palette-autotile.ts:13` 的 `AutoTile.create!()`）。 */
	create: () => AutoTileOpenParams;
	insertTemplate: (dItem: AutoTileTemplateData | null) => void;
	copyTemplate: (item: AutoTileTemplateData | null) => void;
	pasteTemplate: (dItem?: AutoTileTemplateData | null) => void;
	deleteTemplate: (item: AutoTileTemplateData) => void;
	createTemplateId: () => string;
	createTemplateData: () => AutoTileTemplateData;
	getTemplateById: (id: string) => AutoTileTemplateData | undefined;
	insertNode: (id?: number) => void;
	cutNode: (id?: number) => void;
	copyNode: (id?: number) => void;
	pasteNode: (id?: number) => void;
	deleteNode: (id?: number) => void;
	setNodeQuantity: (count: number) => void;
	createNodeData: () => AutoTileNodeData;
	createNodeItems: (id?: number) => void;
	editFrame: () => void;
	insertFrame: (id?: number) => void;
	cutFrame: (id?: number) => void;
	copyFrame: (id?: number) => void;
	pasteFrame: (id?: number) => void;
	deleteFrame: (id?: number) => void;
	setFrameQuantity: (count: number) => void;
	createFrameItems: (id?: number) => void;
	updateFrameItem: () => void;
	// 以下都是窗口/列表事件处理器。**两类别混**（本轮按 `AutoTile.vue` 的**实际调用形状**分开写）：
	// ① 直接当 DOM 监听器用的（`on(...)` / `addEventListener`）—— 真事件对象；
	// ② 经 `AutoTile.vue` 的转发函数调用的 —— 那里传的是**载荷对象字面量**（`{ value }` /
	//    `{ value, clientX, clientY }`），或者干脆无参（`onConfirm` / `onCanvasClick` /
	//    `onRuleNeighborInput` / `onOffset*Input`）。写成 `Event` 是**类型在说谎**：
	//    `YMCommonList` 的 `defineEmits` 就是 `write: [value: unknown]` / `popup: [value, clientX, clientY]`，
	//    桥接层再把它们打包成对象。改成载荷形状之后，.vue 那一侧的转发也不再需要断言。
	windowClose: (event: Event) => void;
	windowClosed: (_event: Event) => void;
	dprchange: (_event: Event) => void;
	templatesKeydown: (event: KeyboardEvent) => void;
	templatesSelect: (payload: { value?: AutoTileTemplateData }) => void;
	templatesChange: (payload?: unknown) => void;
	templatesPopup: (payload: {
		value?: AutoTileTemplateData | null;
		clientX: number;
		clientY: number;
	}) => void;
	nodesWrite: (payload: { value?: number }) => void;
	nodesPopup: (payload: { value?: number | null; clientX: number; clientY: number }) => void;
	nodesKeydown: (event: KeyboardEvent) => void;
	ruleNeighborInput: () => void;
	framesWrite: (payload: { value?: number }) => void;
	framesPopup: (payload: { value?: number | null; clientX: number; clientY: number }) => void;
	framesKeydown: (event: KeyboardEvent) => void;
	framesDoubleclick: (event: MouseEvent) => void;
	canvasClick: () => void;
	imageInput: (payload?: { value?: unknown }) => void;
	offsetXInput: () => void;
	offsetYInput: () => void;
	confirm: () => void;

	// —— 引擎成员（`AutoTile.x = AutoTileEngine.x` 逐条搬运，签名见 `AutoTileEngineShape`） ——
	updateCanvas: () => void;
	drawFrame: () => void;
	createFrameData: () => number;
	generateFrames: (id: number, strideX: number, strideY: number, count: number) => void;
	shiftTemplateFrames: (template: AutoTileTemplateData, offsetX: number, offsetY: number) => void;

	// —— 桥接到 `stores/auto-tile.ts` 的 8 个字段（`Object.defineProperty` 装 get/set） ——
	//
	// 类型按**读点/写入点的实际口径**给（store 那侧仍是 `shallowRef<any>`，
	// 所以这 8 行的类型是本次新加的、也是以后收紧 store 时的依据）：
	// `templates`/`template` 是模板数组与当前模板；三个下标与两个偏移在「未打开」时是 `null`
	// （`stores/__tests__/auto-tile-state.spec.ts` 就显式赋 `null` 验证桥接）。
	templates: AutoTileTemplateData[] | null;
	template: AutoTileTemplateData | null;
	nodeIndex: number | null;
	frameIndex: number | null;
	offsetX: number | null;
	offsetY: number | null;
	imageId: string | null;
	changed: boolean;
}

export const AutoTile = {
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
	image: null
} satisfies Partial<AutoTileShape> as Partial<AutoTileShape> as AutoTileShape;

AutoTile.updateCanvas = AutoTileEngine.updateCanvas;
AutoTile.drawFrame = AutoTileEngine.drawFrame;
AutoTile.createFrameData = AutoTileEngine.createFrameData;
AutoTile.generateFrames = AutoTileEngine.generateFrames;
AutoTile.shiftTemplateFrames = AutoTileEngine.shiftTemplateFrames;

function ensureDomBound(): boolean {
	// canvas 走 `registryElement<HTMLCanvasElement>`（`utils/element-registry.ts` 的**单点收窄**）：
	// 注册表按 id 存异构元素，`AutoTile.canvas` 的读点要 `.width`/`.height`/`getContext('2d')`
	// （`auto-tile-engine.ts`），所以这里是「这个 id 是 canvas」这条约定的落点。
	const canvas = registryElement<HTMLCanvasElement>(paletteEls, 'autoTile-canvas');
	const templateList = registryElement<AutoTileListElement>(paletteEls, 'autoTile-templates');
	if (!templateList || !canvas) return false;
	if (AutoTile.templateList === templateList && AutoTile.canvas === canvas) return false;
	AutoTile.canvas = canvas;
	AutoTile.templateList = templateList;
	AutoTile.nodeList = paletteEls.get('autoTile-nodes') ?? null;
	AutoTile.frameList = paletteEls.get('autoTile-frames') ?? null;
	templateList.updateItemName = Team.list_updateItemName as (...args: unknown[]) => unknown;
	templateList.updateTextNode = Easing.list_updateTextNode as (...args: unknown[]) => unknown;
	return true;
}

function configureLists() {
	AutoTile.nodeMaximum = 64;
	AutoTile.frameMaximum = 256;

	// `templateList` 在 `ensureDomBound()` 返回 true 之后必定非空 ⇒ `!`（同 `AutoTile` 顶部那条说明）
	const list = AutoTile.templateList!;
	getListConfig(list).removable = true;
	getListConfig(list).foldable = false;
	getListConfig(list).renamable = true;
	list.bind(() => getAutoTileStore().templates);
	// `updaters` 的元素类型是 `(item: unknown) => void`，而列表侧就是 `updater(item)` 这种
	// **无接收者**调用（`ui-kit/src/components/basic/YMTreeList/tree-api.ts` 的 `for (const updater of updaters) updater(item)`）
	// ⇒ 这里取的是函数值本身，「丢 this」正是预期的用法（`unbound-method` 在此为误报）。
	// oxlint-disable-next-line unbound-method
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
	// 三个列表在 `initialize()`（`palette-initialize.ts` 调）之后就挂着；`!` 表达这条装配不变式。
	this.templateList!.update();
	this.templateList!.select(this.getTemplateById(template) ?? getAutoTileStore().templates[0]);
	this.templateList!.scrollToSelection();
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
	this.templateList!.addNodeTo(this.createTemplateData(), dItem);
};

AutoTile.copyTemplate = function (this: typeof AutoTile, item: AutoTileTemplateData | null) {
	if (item) {
		GlobalClipboard.write('yami.ruletile.template', item);
	}
};

AutoTile.pasteTemplate = function (this: typeof AutoTile, dItem?: AutoTileTemplateData | null) {
	const copy = GlobalClipboard.read('yami.ruletile.template');
	if (copy) {
		copy.name += ' - Copy';
		copy.id = this.createTemplateId();
		this.templateList!.addNodeTo(copy, dItem);
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
						// 模板列表在 `initialize()` 之后一直挂着 ⇒ `!`（同本文件顶部那条装配不变式）
						this.templateList!.deleteNode(item);
						const last = items.length - 1;
						const target = items[Math.min(index, last)];
						this.templateList!.select(target);
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

// —— 下面这一组（节点/帧数组的操作）都只在「窗口已打开、模板或节点已选中」之后被调 ——
// `nodes` / `frames` / `node` 在数据形状里可空（初值 null、`windowClosed` 也会置回 null），
// 所以每个函数开头取一个**局部非空引用**，既表达那条不变式，也避免满篇 `this.nodes!`。

AutoTile.insertNode = function (this: typeof AutoTile, id = getAutoTileStore().nodeIndex) {
	const nodes = this.nodes!;
	if (id <= nodes.length) {
		nodes.splice(id, 0, this.createNodeData());
		if (getAutoTileStore().template.cover >= id) {
			getAutoTileStore().template.cover += 1;
		}
		this.createNodeItems(id);
		getAutoTileStore().changed = true;
	}
};

AutoTile.cutNode = function (this: typeof AutoTile, id = getAutoTileStore().nodeIndex) {
	if (this.nodes!.length > 1) {
		this.copyNode(id);
		this.deleteNode(id);
	}
};

AutoTile.copyNode = function (this: typeof AutoTile, id = getAutoTileStore().nodeIndex) {
	const nodes = this.nodes!;
	if (id < nodes.length) {
		GlobalClipboard.write('yami.ruletile.node', nodes[id]);
	}
};

AutoTile.pasteNode = function (this: typeof AutoTile, id = this.nodes!.length) {
	const copy = GlobalClipboard.read('yami.ruletile.node');
	const nodes = this.nodes!;
	if (copy && id <= nodes.length) {
		nodes.splice(id, 0, copy);
		this.createNodeItems(id);
		getAutoTileStore().changed = true;
	}
};

AutoTile.deleteNode = function (this: typeof AutoTile, id = getAutoTileStore().nodeIndex) {
	const nodes = this.nodes!;
	if (id < nodes.length && nodes.length > 1) {
		nodes.splice(id, 1);
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
	const nodes = this.nodes!;
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
	const list = this.nodeList!.reload();
	const cover = getAutoTileStore().template.cover;
	const nodes = this.nodes!;
	const length = nodes.length;
	const digits = computeIndexDigits(length);
	for (let i = 0; i < length; i++) {
		const index = i.toString().padStart(digits, '0');
		// 离屏节点统一走 utils/dom 的 renderDetached（原先 document.createElement + render）
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
	// 从 `!== null` 收紧成 `instanceof Image`：`image` 的三种状态里 `symbol` 是**载图中**的哨兵，
	// 这时打开帧索引窗口只会在 `TileFrame.open` 里算出 `NaN` 尺寸（它要 `.naturalWidth`）。
	// 菜单项自己的 `editable = selected && this.image instanceof Image`（`framesPopup`）用的就是这条口径，
	// 本次只是让**动作本身**与菜单的启用条件一致。
	if (this.image instanceof Image) {
		TileFrame.open!();
	}
};

AutoTile.insertFrame = function (this: typeof AutoTile, id = getAutoTileStore().frameIndex) {
	const frames = this.frames!;
	if (id <= frames.length) {
		frames.splice(id, 0, this.createFrameData());
		this.createFrameItems(id);
		getAutoTileStore().changed = true;
	}
};

AutoTile.cutFrame = function (this: typeof AutoTile, id = getAutoTileStore().frameIndex) {
	if (this.frames!.length > 1) {
		this.copyFrame(id);
		this.deleteFrame(id);
	}
};

AutoTile.copyFrame = function (this: typeof AutoTile, id = getAutoTileStore().frameIndex) {
	const frames = this.frames!;
	if (id < frames.length) {
		GlobalClipboard.write('yami.ruletile.frame', {
			frame: frames[id]
		});
	}
};

AutoTile.pasteFrame = function (this: typeof AutoTile, id = this.frames!.length) {
	const copy = GlobalClipboard.read('yami.ruletile.frame');
	const frames = this.frames!;
	if (copy && id <= frames.length) {
		frames.splice(id, 0, copy.frame);
		this.createFrameItems(id);
		getAutoTileStore().changed = true;
	}
};

AutoTile.deleteFrame = function (this: typeof AutoTile, id = getAutoTileStore().frameIndex) {
	const frames = this.frames!;
	if (id < frames.length && frames.length > 1) {
		frames.splice(id, 1);
		this.createFrameItems();
		getAutoTileStore().changed = true;
	}
};

AutoTile.setFrameQuantity = function (this: typeof AutoTile, count: number) {
	const frames = this.frames!;
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
	const list = this.frameList!.reload();
	const frames = this.frames!;
	const length = frames.length;
	const digits = computeIndexDigits(length);
	for (let i = 0; i < length; i++) {
		const frame = frames[i];
		const x = frame & 0xff;
		const y = frame >> 8;
		const index = i.toString().padStart(digits, '0');
		// 同上
		const element = renderDetached(
			h('div', { class: 'common-item', '.dataValue': i }, `#${index}: ${x},${y}`)
		);
		list.appendElement(element);
	}
	list.update();
	write(list, Math.min(id, frames.length - 1));
};

AutoTile.updateFrameItem = function (this: typeof AutoTile) {
	const frames = this.frames!;
	const index = getAutoTileStore().frameIndex;
	const length = frames.length;
	const frame = frames[index];
	const prefix = padZero(index, length);
	const x = frame & 0xff;
	const y = frame >> 8;
	// `selection`（列表选中行元素）走显式元素数据。注：YMCommonList（Vue）把选中行存在组件闭包里、
	// 不再往元素数据上写 ⇒ 这里读到的是 `undefined`（迁移前同样如此），属既有行为，本次不改动。
	elementDataOf<{ selection: HTMLElement }>(this.frameList!).selection.textContent =
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
	payload: { value?: AutoTileTemplateData }
) {
	const item = payload.value;
	getAutoTileStore().template = item;
	this.nodes = item!.nodes;

	this.createNodeItems();
}.bind(AutoTile);

AutoTile.templatesChange = function (this: typeof AutoTile, _payload?: unknown) {
	getAutoTileStore().changed = true;
}.bind(AutoTile);

AutoTile.templatesPopup = function (
	this: typeof AutoTile,
	payload: { value?: AutoTileTemplateData | null; clientX: number; clientY: number }
) {
	const list = AutoTile.templateList!;
	const item = payload.value;
	// `payload.value` 是「右键点在哪一行」，可能为 `undefined`（空白处）：
	// 这批菜单项的 `enabled` 已经按 `selected`/`deletable` 关掉了不该点的那些，
	// 所以需要非空参数的三个动作在点击回调里用 `item!`（而不是把它悄悄变成 `null`）。
	const selected = !!item;
	const pastable = GlobalClipboard.has('yami.ruletile.template');
	const deletable = selected && getAutoTileStore().templates.length > 1;
	const get = (key: string) => t('menuAutoTileTemplateList.' + key);
	Menu.popup(
		{
			x: payload.clientX,
			y: payload.clientY
		},
		[
			{
				label: get('insert'),
				accelerator: 'Insert',
				click: () => {
					AutoTile.insertTemplate!(item ?? null);
				}
			},
			{
				label: get('copy'),
				accelerator: ctrl('C'),
				enabled: selected,
				click: () => {
					AutoTile.copyTemplate!(item ?? null);
				}
			},
			{
				label: get('paste'),
				accelerator: ctrl('V'),
				enabled: pastable,
				click: () => {
					AutoTile.pasteTemplate!(item ?? null);
				}
			},
			{
				label: get('delete'),
				accelerator: 'Delete',
				enabled: deletable,
				click: () => {
					AutoTile.deleteTemplate!(item!);
				}
			},
			{
				label: get('rename'),
				accelerator: 'F2',
				enabled: selected,
				click: () => {
					list.rename(item!);
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
						AutoTile.shiftTemplateFrames!(item!, x, y);
					});
				}
			}
		]
	);
};

AutoTile.nodesWrite = function (this: typeof AutoTile, payload: { value?: number }) {
	const nodeIndex = payload.value;
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
	payload: { value?: number | null; clientX: number; clientY: number }
) {
	const id = payload.value;
	const cover = getAutoTileStore().template.cover;
	const nodes = this.nodes!;
	const selected = id !== null;
	const insertable = nodes.length < this.nodeMaximum!;
	const copyable = selected;
	const pastable = insertable && GlobalClipboard.has('yami.ruletile.node');
	const deletable = selected && nodes.length > 1;
	const coverable = selected && id !== cover;
	const get = (key: string) => t('menuAutoTileNodeList.' + key);
	Menu.popup(
		{
			x: payload.clientX,
			y: payload.clientY
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
					// `id` 可能为 `null`（右键点空白处），而这三个菜单项的 `enabled: deletable` 已经把
					// 那一路关掉了；`?? undefined` 让「没有具体 id」落回各动作自己的默认值
					// （`= getAutoTileStore().nodeIndex`），与原先传 `null` 时**可达路径**上的行为一致。
					this.cutNode(id ?? undefined);
				}
			},
			{
				label: get('copy'),
				accelerator: ctrl('C'),
				enabled: copyable,
				click: () => {
					this.copyNode(id ?? undefined);
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
					this.deleteNode(id ?? undefined);
				}
			},
			{
				label: get('setQuantity'),
				click: () => {
					SetQuantity.open!(
						nodes.length,
						this.nodeMaximum!,
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

AutoTile.ruleNeighborInput = function (this: typeof AutoTile) {
	const ruleBits = getAutoTileStore().ruleBits;
	let rule = 0;
	for (let i = 0; i < 8; i++) {
		rule |= ruleBits[i] << (i * 2);
	}
	// `node` 是「当前选中的节点」（`nodesWrite` 里挂上）。这个输入只在节点列表选中之后可用 ⇒ `!`
	AutoTile.node!.rule = rule;
	getAutoTileStore().changed = true;
};

AutoTile.framesWrite = function (this: typeof AutoTile, payload: { value?: number }) {
	getAutoTileStore().frameIndex = payload.value;
	this.drawFrame();
}.bind(AutoTile);

AutoTile.framesPopup = function (
	this: typeof AutoTile,
	payload: { value?: number | null; clientX: number; clientY: number }
) {
	const id = payload.value;
	const frames = this.frames!;
	const selected = id !== null;
	const editable = selected && this.image instanceof Image;
	const insertable = frames.length < this.frameMaximum!;
	const copyable = selected;
	const pastable = insertable && GlobalClipboard.has('yami.ruletile.frame');
	const deletable = selected && frames.length > 1;
	const get = (key: string) => t('menuAutoTileFrameList.' + key);
	Menu.popup(
		{
			x: payload.clientX,
			y: payload.clientY
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
					// 同 `nodesPopup`：`id` 为 `null` 的那一路被 `enabled: deletable` 关掉了，
					// `?? undefined` 让「没有具体 id」落回默认值（`= getAutoTileStore().frameIndex`）。
					this.cutFrame(id ?? undefined);
				}
			},
			{
				label: get('copy'),
				accelerator: ctrl('C'),
				enabled: copyable,
				click: () => {
					this.copyFrame(id ?? undefined);
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
					this.deleteFrame(id ?? undefined);
				}
			},
			{
				label: get('setQuantity'),
				click: () => {
					SetQuantity.open!(
						frames.length,
						this.frameMaximum!,
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
						// `enabled: editable` 已保证 `id` 是一个具体下标（且贴图已载入）
						this.generateFrames(id!, x, y, count);
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

// 以下四个在 `AutoTile.vue` 里是**无参**转发的（`onConfirm` / `onCanvasClick` /
// `onRuleNeighborInput` / `onOffset*Input`）⇒ 实现侧不再声明那个从未被传进来的 `_event`。
AutoTile.canvasClick = function (this: typeof AutoTile) {
	this.editFrame();
}.bind(AutoTile);

AutoTile.imageInput = function (this: typeof AutoTile, _payload?: { value?: unknown }) {
	AutoTile.imageId = getAutoTileStore().imageId;
	AutoTile.image = null;
	AutoTile.drawFrame!();
};

AutoTile.offsetXInput = function (this: typeof AutoTile) {
	const x = getAutoTileStore().offsetX;
	if (AutoTile.offsetX !== x) {
		AutoTile.offsetX = x;
		AutoTile.drawFrame!();
	}
};

AutoTile.offsetYInput = function (this: typeof AutoTile) {
	const y = getAutoTileStore().offsetY;
	if (AutoTile.offsetY !== y) {
		AutoTile.offsetY = y;
		AutoTile.drawFrame!();
	}
};

AutoTile.confirm = function (this: typeof AutoTile) {
	if (getAutoTileStore().changed) {
		getAutoTileStore().changed = false;
		const templates = getAutoTileStore().templates;
		TreeList.deleteCaches(templates);
		Data.autotiles = templates;
		Data.createGUIDMap(templates);
		File.planToSave!(Data.manifest.project.autotiles);
	}
	// `!`：`saveToProject` 只在调色板打开（`Palette.tileset` 已被 `open()` 赋上）时走到
	const tiles = Palette.tileset!.tiles;
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
