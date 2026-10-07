import { defineStore } from 'pinia';
import { getLazyWindow, loadWindow } from '@app/tools/window-registry';
import { computed, markRaw, shallowRef } from 'vue';
import { pinia } from './pinia';
import { Matrix } from '@app/engine/webgl/matrix2.ts';
import { uiEls } from '@app/engine/ui/element-registry';
import { StageColor, safeHex } from '@app/utils/stage-color';
import type { ImageTexture } from '@app/engine/webgl/image-texture.ts';
import type { History } from '@app/tools/history.ts';
import type { UIElementInstance, UINodeShape } from '@app/engine/ui/element-classes.ts';
import type { UIShape } from '@app/engine/ui/ui-singleton.ts';
import type { YamiElement } from '@app/types/element-api';

/**
 * 惰加载 UI 窗口单例。
 *
 * 导出给 `engine/ui/ui-engine.ts`：它的 `renderingFunction` 需要以**方法调用**形态
 * 调用 `UI.drawXxx()`（见该处注释——`Timer` 是裸调用，没有接收者），
 * 而直接 `import { UI } from '@app/engine/ui/ui-singleton.ts'` 会与 `ui-window.ts → ui-engine.ts`
 * 形成静态循环导入。这个惰加载代理只在**运行时**解析目标，天然避开循环。
 *
 * 改为**直连遗留 UI 窗口模块** —— 桶文件里那行 `export { UI }` 已同步删除，
 * 于是「取 UI 对象」这条接线不再经过它。
 *
 * ⚠️ `await clusterReady` **必须保留**：它等的是 Scene / UI / Animation / Particle / Palette
 * 五个窗口**全部**就绪，而 UI 的动作会用到 `Scene.list` 一类。改成只等 `uiWindowReady`
 * 会缩短就绪契约 —— 那是一条会**静默改变时序**的改动，不属于 ① 的范围。
 */
export const loadUI = async () => {
	const [uiWindow, cluster] = await Promise.all([
		import('@app/engine/ui/ui-singleton.ts'),
		import('@app/tools/window-cluster')
	]);
	await cluster.clusterReady;
	return uiWindow.UI;
};
const UI = getLazyWindow('ui', loadUI);

let uiEngineRef: Record<string, unknown> | null = null;

/** 由 `engine/ui/ui-engine.ts` 在模块加载**末尾**调用（那时它的挂载已全部就位）。 */
export function registerUIEngine(engine: Record<string, unknown>): void {
	uiEngineRef = engine;
}

export const uiStateKeys = [
	'state',
	'target',
	'zoom',
	'width',
	'height',
	'mode',
	'controlPointTexture',
	'inspectorTypeMap',
	'history',
	'matrix',
	'root',
	'background',
	'meta',
	'nodes',
	'foreground',
	'scrollLeft',
	'scrollTop',
	'scrollRight',
	'scrollBottom',
	'dragging',
	'hover'
] as const;

interface UIContextShape {
	meta: { guid: string; path: string };
	ui?: { width: number; height: number; nodes: UINodeShape[] } & Record<string, unknown>;
	editor?: {
		target: UINodeShape | null;
		root: UIElementInstance | null;
		history: History;
		centerX: number;
		centerY: number;
	} & Record<string, unknown>;
	fontChanged?: boolean;
	languageChanged?: boolean;
	scalingChanged?: boolean;
	[key: string]: unknown;
}

interface UIPrefabShape {
	name: string;
	presetId: string;
	transform: { x: number; y: number; [key: string]: unknown };
	[key: string]: unknown;
}

interface PrefabRefShape {
	presetId?: string;
}

interface UIControlPoint {
	x: number;
	y: number;
	angle: number;
}

export const useUIStore = defineStore('ui', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<UINodeShape | null>(null);
	const zoom = shallowRef<number | null>(null);
	const width = shallowRef<number | null>(null);
	const height = shallowRef<number | null>(null);
	const mode = shallowRef<string | null>(null);
	const controlPointTexture = shallowRef<ImageTexture | null>(null);
	const inspectorTypeMap = shallowRef<Record<string, string> | null>(null);
	/**
	 * `elements.list` / `.head` / `.body` / `.screen` 一律从**元素注册表**读取，
	 * 而不是靠桥接写入。
	 *
	 * ## 为什么改走注册表（2026-09-18 实测定位）
	 *
	 * 这四个字段原本靠 `UI.initialize()` 里的 `this.list = uiEls.get('ui-list')` 赋值，
	 * 而 `UI.initialize()` **只有一个调用方**：`LayoutPanel.vue` 的 `onMounted` 里
	 * `nextTick(() => getUIStore().initialize())`。也就是说它**确实会被调用**，
	 * 但时机是「LayoutPanel 挂载后的下一个 tick」——**晚于** `Layout.initialize`
	 * （`initCore` 在 `Editor.initialize` 里先跑），也晚于任何在挂载前发生的读取。
	 *
	 * 依赖这个时序的直接后果：任何**早于**该 tick 的读取都拿到 `null`，
	 * 而调用方写的是 `getUIStore().list!.unselect(...)`——`!` 把「可能为 null」在类型上
	 * 抹掉了，tsc 全程不报错，直到用户点选 UI 元素列表才炸出
	 * `Cannot read properties of null (reading 'unselect')`。
	 * 走注册表就不再有这个时序窗口：注册表在 `:ref` 登记那一刻就有值。
	 *
	 * ## 为什么注册表是对的
	 *
	 * `uiEls` 由 `LayoutPanel.vue` 的模板 `:ref="registryRef(uiEls, '<id>')"` 登记，
	 * Vue **同步 mount** 完成后才 `emitCustom('vue-app-mounted')` → `Editor.initialize`，
	 * 所以任何会用到这些元素的代码路径上，注册表都已经登记好；而且它始终反映**当前**元素，
	 * 不像桥接那样依赖"谁先初始化"。
	 *
	 * ## 为什么是「访问器」而不是 `ref` / `computed`
	 *
	 * 这四条必须是**每次读都重新求值**且**只读**的访问器（`elements` 上的 getter）。
	 * 三个坑都踩过，别再改回去：
	 *
	 * 1. **不能是 `computed`**：`uiEls` 是普通 `Map`，没有响应性，`computed` 首次求值后
	 *    **永不重新求值**。只要有人在元素登记**之前**读过一次，它就永久缓存 `null`
	 *    —— 那正是本次要修的崩溃本身。（vitest 实测：`computed(() => plainMap.get(k))`
	 *    在 `map.set(k, v)` 之后仍返回旧值；而 getter 写法则立刻返回新值。）
	 * 2. **不能是 `reactive(new Map())`** 换响应性：Vue 的集合代理让 `.get()` **每次返回新的
	 *    Proxy**，破坏元素**同一性**（实测 `m.get('k') === el` 为 `false`）。这些是
	 *    `YamiElementApi` 契约对象，调用方会长期持有并做同一性比较，换代理是行为回归。
	 * 3. **`elements` 必须 `markRaw`**：Pinia 会把 setup 返回的普通对象包成 `reactive()`，
	 *    `store.elements` 本身成了代理，读 `.list` 拿到的又是对元素的代理，同一性照样丢
	 *    （实测 `store.elements.list === el` 为 `false` 且 `isProxy(store.elements)` 为 `true`；
	 *    加 `markRaw` 后 `true` / `false`）。这里不需要深层响应性，数据源是裸 `Map`。
	 * 4. 副作用是这四个名字**不再可写**，因此已从 `uiStateKeys` 移除（`uiStateKeys` 是桥接
	 *    的写入白名单，留着只会误导后人以为可以从单例同步过来）。全仓库已确认没有任何
	 *    `store.list = …` 形态的写入，所以只读不构成回归。
	 *
	 * 回归保护见 `__tests__/ui-state.spec.ts` 的「DOM 引用从元素注册表派生」四条用例。
	 */
	const listEl = (): YamiElement | null =>
		(uiEls.get('ui-list') as YamiElement | undefined) ?? null;
	const headEl = (): YamiElement | null =>
		(uiEls.get('ui-head') as YamiElement | undefined) ?? null;
	const bodyEl = (): YamiElement | null =>
		(uiEls.get('ui-body') as YamiElement | undefined) ?? null;
	const screenEl = (): YamiElement | null =>
		(uiEls.get('ui-screen') as YamiElement | undefined) ?? null;
	const history = shallowRef<History | null>(null);
	const matrix = shallowRef<Matrix>(new Matrix());
	const root = shallowRef<UIElementInstance | null>(null);
	const foreground = shallowRef<StageColor>(new StageColor('000000ff', () => undefined));
	const background = shallowRef<StageColor>(new StageColor('00000000', () => undefined));
	const elements = markRaw({
		get list() {
			return listEl();
		},
		get head() {
			return headEl();
		},
		get body() {
			return bodyEl();
		},
		get screen() {
			return screenEl();
		},
		/**
		 * 当前选中的 UI 节点。
		 *
		 * 为什么需要它（2026-09-18 实测）：`target` 已经迁到 store，于是遗留层里
		 * `UI.updateTargetItem` 的 `const { target } = this` 读到 `undefined`，
		 * 而它下一句 `read(this.list)` 里的 `this.list` 是注册表未登记时的 `{}` 兜底
		 * ⇒ `read({})` 落到 `elementDataValueOf({})` 抛 `TypeError: Invalid value used
		 * as weak map key`。**每次点选都会抛**，表现就是「整个 UI 像截图一样冻住、
		 * 连选中框都不出现」——异常被 Vue 的事件错误处理吞掉，只在控制台留下一行 warn。
		 *
		 * 所以这里把 store 的 `target` 也挂到 `elements` 上，让遗留层有地方按新口径取。
		 */
		get target() {
			return target.value;
		}
	});
	const meta = shallowRef<{ guid: string; path: string } | null>(null);
	const nodes = shallowRef<UINodeShape[] | null>(null);
	const scrollLeft = computed<number | null>(() => UI?.scrollLeft ?? null);
	const scrollTop = computed<number | null>(() => UI?.scrollTop ?? null);
	const scrollRight = computed<number | null>(() => UI?.scrollRight ?? null);
	const scrollBottom = computed<number | null>(() => UI?.scrollBottom ?? null);
	const dragging = computed<{ node?: unknown } | null>(() => UI?.dragging ?? null);
	const hover = computed<unknown>(() => UI?.hover ?? null);

	const initialized = shallowRef(false);

	function initialize() {
		if (initialized.value) return;
		void loadWindow('ui', loadUI).then((u) => u?.initialize?.());
		initialized.value = true;
	}

	function open(context: UIContextShape) {
		UI?.open?.(context);
	}

	function close() {
		UI?.close?.();
	}

	function planToSave() {
		UI?.planToSave?.();
	}

	function requestRendering() {
		forwarders.requestRendering!();
	}

	function load(context: UIContextShape) {
		UI?.load?.(context);
	}

	function save() {
		UI?.save?.();
	}

	function destroy(context: UIContextShape) {
		UI?.destroy?.(context);
	}

	function copy() {
		UI?.copy?.();
	}

	function paste(x?: number, y?: number) {
		UI?.paste?.(x, y);
	}

	function duplicate() {
		UI?.duplicate?.();
	}

	function create(kind: string, x: number, y: number) {
		UI?.create?.(kind, x, y);
	}

	function createPrefab(
		prefab: UIPrefabShape,
		parent: UINodeShape | null,
		x?: number,
		y?: number
	) {
		UI?.createPrefab?.(prefab, parent, x, y);
	}

	function createShortcut(item: UINodeShape) {
		UI?.createShortcut?.(item);
	}

	function delete_() {
		UI?.delete?.();
	}

	function toggle() {
		UI?.toggle?.();
	}

	function undo() {
		UI?.undo?.();
	}

	function redo() {
		UI?.redo?.();
	}

	function setZoom(zoomValue: number) {
		forwarders.setZoom!(zoomValue);
	}

	function setSize(w: number, h: number) {
		UI?.setSize?.(w, h);
	}

	function setHover(hover: UINodeShape | null) {
		UI?.setHover?.(hover);
	}

	function setTarget(targetValue: UINodeShape | null) {
		UI?.setTarget?.(targetValue);
	}

	function revealTarget() {
		UI?.revealTarget?.();
	}

	function shiftAnchor(anchorX: number, anchorY: number) {
		forwarders.shiftAnchor!(anchorX, anchorY);
	}

	function shiftTarget(x: number, y: number) {
		forwarders.shiftTarget!(x, y);
	}

	function resizeTarget(width?: number, height?: number) {
		forwarders.resizeTarget!(width, height);
	}

	function rotateTarget(rotation: number) {
		forwarders.rotateTarget!(rotation);
	}

	function setControlPoint(point: UIControlPoint | null) {
		forwarders.setControlPoint!(point);
	}

	function updateHover() {
		UI?.updateHover?.();
	}

	function updateTarget() {
		UI?.updateTarget?.();
	}

	function updateElementFont() {
		UI?.updateElementFont?.();
	}

	function updateElementLanguage() {
		UI?.updateElementLanguage?.();
	}

	function updateElementTextScaling() {
		UI?.updateElementTextScaling?.();
	}

	function updateIndexedColor(index: number) {
		UI?.updateIndexedColor?.(index);
	}

	function updateAllTexts() {
		UI?.updateAllTexts?.();
	}

	function updateAllPrinters() {
		UI?.updateAllPrinters?.();
	}

	function updateElement(targetValue: UINodeShape) {
		UI?.updateElement?.(targetValue);
	}

	function deleteElement(targetValue: UINodeShape) {
		UI?.deleteElement?.(targetValue);
	}

	function switchSettings() {
		UI?.switchSettings?.();
	}

	function registerPreset(node: UINodeShape) {
		UI?.registerPreset?.(node);
	}

	function unregisterPreset(node: UINodeShape) {
		UI?.unregisterPreset?.(node);
	}

	function hasPrefab(node: PrefabRefShape) {
		return UI?.hasPrefab?.(node);
	}

	function setAsPrefab(node: UINodeShape) {
		UI?.setAsPrefab?.(node);
	}

	function unsetAsPrefab(node: UINodeShape) {
		UI?.unsetAsPrefab?.(node);
	}

	function clearInvalidPrefabs(uiPrefabs: string[]) {
		UI?.clearInvalidPrefabs?.(uiPrefabs);
	}

	/**
	 * 事件转发槽位：这些成员在 `ui-window.ts` 的对象字面量里都是 `null`，
	 * 由别的模块在运行时**整体赋值**（例如 `ui-events.ts` 挂 `headPointerdown`、
	 * `ui-list.ts` 挂 `listSelect`、`title-bar.ts` 挂 `destroy`）。
	 *
	 * 它们没有共享的签名（`() => void`、`(e: Event) => void`、`(node) => void` 都有），
	 * 逐个手写包装既啰嗦又容易抄错参数——所以这里用**同一个转发机制**批量生成：
	 * 调用时读目标对象上的成员（而不是捕获一次引用），因此「模块稍后才赋值」这件事天然成立。
	 *
	 * 调用方写 `getUIStore().listChange(e)`，语义与 `UI.listChange(e)` 完全一致
	 * （含 `this` 绑定、含不存在时静默跳过）。
	 *
	 * @param resolve 每次调用时求值，返回**真正的接收者对象**（延迟求值是这个机制的关键）。
	 *
	 * 具名接口到记录类型不是合法转换（TS2352），而**键本来就是运行时才知道的**
	 * （13 个事件槽位，一部分在 `UIDomainMembers` 里、一部分不在）。
	 * ⇒ 这一次动态读取改用 `Reflect.get(target, key)`；后面的 `typeof` 检查、
	 * 判空与 `.apply(target, args)` 全部保留，行为与 `target[key]` 逐字一致。
	 */
	const makeForwarder = (key: string, resolve: () => UIShape | null) => {
		return (...args: unknown[]) => {
			const target = resolve();
			if (target === null) return undefined;
			const fn: unknown = Reflect.get(target, key);
			if (typeof fn !== 'function') return undefined;
			return fn.apply(target, args);
		};
	};

	/**
	 * 引擎实现（`UIEngine`）的转发器 —— 与 `makeForwarder` 的区别只有**从哪里取函数**：
	 *
	 * - `makeForwarder`：从 `UI` 惰加载代理取（即 `ui-window.ts` 的**镜像**）；
	 * - 本函数：优先从引擎**注册进来的** `UIEngine` 取，取不到才回退到 `UI`。
	 *
	 * ⚠️ 接收者**两种情况都必须是 `UI`**：这些实现内部读 `this.planToSave` / `this.scale` 等
	 * UI 侧成员（见上面那段注释）。所以**绝不能**写成 `engine[key](...)`（那样 `this` 会变成
	 * `UIEngine`）—— 必须 `.apply(UI, args)`。
	 */
	const makeEngineForwarder = (key: string) => {
		return (...args: unknown[]) => {
			const fromEngine = uiEngineRef;
			if (fromEngine !== null) {
				const fn = fromEngine[key];
				if (typeof fn !== 'function') return undefined;
				return fn.apply(UI, args);
			}
			return makeForwarder(key, () => UI)(...args);
		};
	};

	const uiForwardKeys = [
		'listChange',
		'headPointerdown',
		'switchPointerdown',
		'shortcutPointerdown',
		'zoomFocus',
		'screenKeydown',
		'screenWheel',
		'marqueePointerdown',
		'marqueeDoubleclick',
		'listSelect',
		'listRecord',
		'listPopup',
		'listOpen'
	] as const;

	// oxlint-disable-next-line no-explicit-any
	const forwarders: Record<string, (...args: any[]) => unknown> = {};
	for (const key of uiForwardKeys) {
		forwarders[key] = makeForwarder(key, () => UI);
	}

	const uiEngineForwardKeys = [
		'requestRendering',
		'setZoom',
		'shiftAnchor',
		'shiftTarget',
		'resizeTarget',
		'rotateTarget',
		'setControlPoint'
	] as const;
	for (const key of uiEngineForwardKeys) {
		forwarders[key] = makeEngineForwarder(key);
	}

	function saveToConfig(config: { colors: Record<string, unknown> }) {
		UI?.saveToConfig?.(config);
	}

	function loadFromConfig(config: { colors: Record<string, unknown> }) {
		background.value = new StageColor(safeHex(config.colors.uiBackground, '00000000'), () =>
			requestRendering()
		);
		foreground.value = new StageColor(safeHex(config.colors.uiForeground, '000000ff'), () => {
			if (state.value === 'open') {
				root.value?.resize();
				requestRendering();
			}
		});
		UI?.loadFromConfig?.(config);
	}

	function saveToProject(project: { ui: { zoom?: number }; uiPrefabs?: string[] }) {
		UI?.saveToProject?.(project);
	}

	function loadFromProject(project: { ui: { zoom: number } }) {
		UI?.loadFromProject?.(project);
	}

	return {
		state,
		target,
		zoom,
		width,
		height,
		mode,
		controlPointTexture,
		inspectorTypeMap,
		elements,
		history,
		matrix,
		root,
		foreground,
		background,
		meta,
		nodes,
		scrollLeft,
		scrollTop,
		scrollRight,
		scrollBottom,
		dragging,
		hover,
		initialized,
		initialize,
		open,
		close,
		planToSave,
		requestRendering,
		load,
		save,
		destroy,
		copy,
		paste,
		duplicate,
		create,
		createPrefab,
		createShortcut,
		delete: delete_,
		toggle,
		undo,
		redo,
		setZoom,
		setSize,
		setHover,
		setTarget,
		revealTarget,
		shiftAnchor,
		shiftTarget,
		resizeTarget,
		rotateTarget,
		setControlPoint,
		updateHover,
		updateTarget,
		updateElementFont,
		updateElementLanguage,
		updateElementTextScaling,
		updateIndexedColor,
		updateAllTexts,
		updateAllPrinters,
		updateElement,
		deleteElement,
		switchSettings,
		registerPreset,
		unregisterPreset,
		hasPrefab,
		setAsPrefab,
		unsetAsPrefab,
		clearInvalidPrefabs,
		listChange: forwarders.listChange,
		headPointerdown: forwarders.headPointerdown,
		switchPointerdown: forwarders.switchPointerdown,
		shortcutPointerdown: forwarders.shortcutPointerdown,
		zoomFocus: forwarders.zoomFocus,
		screenKeydown: forwarders.screenKeydown,
		screenWheel: forwarders.screenWheel,
		marqueePointerdown: forwarders.marqueePointerdown,
		marqueeDoubleclick: forwarders.marqueeDoubleclick,
		listSelect: forwarders.listSelect,
		listRecord: forwarders.listRecord,
		listPopup: forwarders.listPopup,
		listOpen: forwarders.listOpen,
		saveToConfig,
		loadFromConfig,
		saveToProject,
		loadFromProject
	};
});

export function getUIStore() {
	return useUIStore(pinia);
}
