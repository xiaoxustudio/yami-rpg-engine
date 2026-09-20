import { defineStore } from 'pinia';
import { getLazyWindow, loadWindow } from '@app/tools/window-registry';
import { computed, markRaw, shallowRef } from 'vue';
import { pinia } from './pinia';
import { Matrix } from '@app/engine/webgl/matrix2.ts';
import { uiEls } from '@app/engine/ui/element-registry';
import { StageColor } from '@app/utils/stage-color';
import type { ImageTexture } from '@app/engine/webgl/image-texture.ts';
import type { History } from '@app/tools/history.ts';
import type { UIElementInstance } from '@app/engine/ui/element-classes.ts';
import type { YamiElement } from '@app/types/element-api';

/**
 * 惰加载 UI 窗口单例。
 *
 * 导出给 `engine/ui/ui-engine.ts`：它的 `renderingFunction` 需要以**方法调用**形态
 * 调用 `UI.drawXxx()`（见该处注释——`Timer` 是裸调用，没有接收者），
 * 而直接 `import { UI } from '@app/engine/ui/legacy/ui-window.ts'` 会与 `ui-window.ts → ui-engine.ts`
 * 形成静态循环导入。这个惰加载代理只在**运行时**解析目标，天然避开循环。
 */
export const loadUI = () =>
	import('@app/tools/window-cluster').then(async (m) => {
		await m.clusterReady;
		return m.UI;
	});
const UI = getLazyWindow('ui', loadUI);

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

interface UINodeShape {
	class: string;
	children: UINodeShape[];
	// oxlint-disable-next-line no-explicit-any
	[key: string]: any;
}

interface UIContextShape {
	meta: { guid: string; path: string };
	ui?: { width: number; height: number; nodes: UINodeShape[] } & Record<string, unknown>;
	editor?: {
		target: UINodeShape | null;
		root: UINodeShape | null;
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

/**
 * `hasPrefab` 的真实入参口径。
 *
 * 两处调用方都是**图标渲染器**（`LayoutPanel.vue` / `PresetElement.vue`），
 * 手里只有节点的局部视图（`class?: string`、没有 `children`），
 * 按完整的 `UINodeShape` 收参会让它们在 vue-tsc 报 TS2345；
 * 而该动作实际只读 `presetId`。
 */
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
	/**
	 * 控制点贴图（WebGL 资源）。原先只挂在遗留单例 `UI.controlPointTexture` 上，
	 * 由 `ui-initialize.ts:87` 在异步载图回调里赋值、`animation-window-engine.ts:716` 读取。
	 *
	 * 升进 store 的理由：它正是让 `animation-window-engine` 摆脱 `@app/engine/ui/legacy/ui-window.ts` 的
	 * 唯一阻塞点（那个文件只用到这一个成员）。
	 *
	 * 为什么写入能同步过来：`stores/ui.ts:63` 是 `u?.initialize?.()`，接收者就是 UI 单例，
	 * 因此 `ui-initialize.ts` 里的 `this.controlPointTexture = …` 会命中 `uiStateKeys` 的
	 * `defineProperty` setter。`shallowRef` 不深追代理——WebGL 包装对象不该进深层响应式。
	 */
	const controlPointTexture = shallowRef<ImageTexture | null>(null);
	/**
	 * class 名 → 检查器类型 的映射表。由 `ui-initialize.ts:149` 以对象字面量整体赋值
	 * （`this.inspectorTypeMap = { … }`），所以按**整体替换**语义存取即可，不需要深层响应式。
	 *
	 * 升进 store 的理由：它是 `update/updater-hooks.ts` 摆脱 `@app/engine/ui/legacy/ui-window.ts` 的唯一阻塞点。
	 * 同一个名字在 Scene / Animation 单例上各有一份互不相干的表，这里只接 UI 那一份。
	 */
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
	/**
	 * UI 画布的历史栈（撤销/重做）。
	 *
	 * 注意它与 `ParamHistory` 是**两套不同的东西**：后者（`composables/useParamHistory.ts`）
	 * 是检查器参数编辑的历史，前者只服务 UI 画布节点的增删改。
	 *
	 * 生命周期：`ui-file.ts` 在 `load()` 里从 `context.editor.history` 取出、在 `close()` 里置 null。
	 * 因为写入走的是同一个单例的 setter，store 会**跟随时序**变化（关闭后即 null），
	 * 不会留下陈旧引用。调用方必须判空——老代码是 `UI.history.save(...)`，
	 * 关闭后调用会直接抛 TypeError，这里暴露成可判空的形状正是修掉那个隐患。
	 */
	const history = shallowRef<History | null>(null);
	/**
	 * UI 画布的 GL 变换矩阵。
	 *
	 * ⚠️ 这里的初值只是**防止初始化前读到 null 的兜底**，它**不是**真源。
	 * 真源是 `UI.matrix`（`ui-initialize.ts` 里 `this.matrix = new Matrix()`），
	 * 由相机 `ui-engine.ts` 的 `updateTransform` 每帧 `reset().scale().translate()`。
	 * `ui-initialize.ts` 会把**同一个实例**赋给本字段，因此之后两边是同一个对象。
	 *
	 * ## 为什么初值不能当成真源（2026-09-18，实测「画面冻结」）
	 *
	 * 纯计算对象不代表它是**常量**。曾经这里只放一个 `new Matrix()` 兜底、又没有写入方，
	 * 于是所有绘制（`element-base.ts` 的 `gl.matrix.set(getUIStore().matrix!)…`、
	 * `ui-engine.ts` 的坐标轴/控制点）都在用一个**永远停在单位矩阵**的副本：
	 * 相机怎么平移缩放，画面都一模一样，而且**一个异常都不抛**
	 * （单位矩阵是合法值）。这是最难查的一类：不崩、不报错、只是不动。
	 *
	 * 教训：给 store 字段补"安全初值"之前，先确认它**是谁在改**；
	 * 否则等于把「崩溃」悄悄换成「静默失效」。
	 */
	const matrix = shallowRef<Matrix>(new Matrix());
	/**
	 * UI 画布的根节点**实例**（`RootElement`，由 `ui-file.ts:68` 从
	 * `context.editor.root` 取出、`close()` 时置 null）。
	 *
	 * 注意与 `uiElClasses.Root`（那个**类**）的区别：这里是实例。
	 * `element-base.ts` 通过 `elementDataOf` 之外的方式引用它来调
	 * `tryUpdateReferenceElements()`（`root-element.ts:59` 的实例方法）。
	 */
	const root = shallowRef<UIElementInstance | null>(null);
	/**
	 * 前景色 / 背景色。
	 *
	 * ⚠️ **不要**退回 `null`（2026-09-18 实测崩溃）：`RootElement.resize()` 直接调
	 * `getUIStore().foreground!.getINTRGBA()`，而 `resize()` 会在 `UI.initialize()` 之前被触发
	 * （`ui-events.ts` 的 resize handler → `UI.resize` → `root.resize`），于是
	 * `Cannot read properties of null (reading 'getINTRGBA')`。
	 *
	 * 遗留层里它们是 `ui-window.ts` 模块加载期的 `null` + 由 `ui-events.ts` 在 config 回调里
	 * `new StageColor(...)` —— 也就是说**旧代码同样可能在初始化前为 null**，只是那条路径
	 * 恰好没被触发。这里给 `services/project/config.ts` 的默认色（透明背景 / 不透明前景），
	 * 语义上等于「还没配过颜色」，且 `getINTRGBA()` 对全 0 hex 是安全的。
	 *
	 * 真正的颜色由本 store 的 `loadFromConfig` 写入（**不是**经 `ui-events.ts` 桥接 ——
	 * 那正是「UI 画布一片黑」的根因，见该函数注释与
	 * `__tests__/ui-state.spec.ts` 的 loadFromConfig 用例）。
	 */
	const foreground = shallowRef<StageColor>(new StageColor('000000ff', () => undefined));
	const background = shallowRef<StageColor>(new StageColor('00000000', () => undefined));
	// 四个 DOM 引用走注册表派生值（每次读都重新求值，永远反映当前元素）。见上方说明。
	//
	// ⚠️ 这里**必须**是「访问器」，不能是 `computed(...)`。
	// `uiEls` 是**普通 Map**（`createElementRegistry` 返回的裸 `Map`），本身没有响应性，
	// 所以 `computed` 在**首次求值后永远不再重新求值**：只要有人在元素登记**之前**读过一次
	// （例如某个开着 UI 窗口的路径、或任何一次早期读取），它就永久缓存 `null`
	// —— 那恰好就是这次要修的崩溃本身。
	//
	// 实测（vitest，2026-09-18）：`computed(() => plainMap.get(k))` 在 `map.set(k, v)` 之后
	// 仍然返回旧值；换成下面这种 getter 写法则每次读都求值。
	//
	// 也不用 `reactive(new Map())` 换取响应性：Vue 的集合代理会让 `.get()` **每次返回新的
	// Proxy**，破坏元素**同一性**（实测 `m.get('k') === el` 为 `false`）。这些元素是
	// `YamiElementApi` 契约对象，调用方会把它们当命令式 API 长期持有并做同一性比较，
	// 换成每读一个新代理是实打实的行为回归。裸 `Map` 保证返回的就是登记时那个对象。
	//
	// ⚠️ `markRaw` 不可省：Pinia 会把 setup 返回的**普通对象包成 `reactive()`**，于是
	// `store.elements` 本身成了代理，读 `.list` 拿到的又是**对元素的代理**
	// —— 同一性照样丢（实测 `store.elements.list === el` 为 `false`，
	// `isProxy(store.elements)` 为 `true`）。`markRaw` 让 Pinia 跳过包装，访问器结果原样透出
	// （实测 `same=true` / `isProxy=false`）。
	// 这里本来就不需要深层响应性——`elements` 只是个只读访问器容器，数据源是裸 `Map`。
	//
	// `screen` 与 `ui-initialize.ts:23` 读的是**同一个元素**；`addScrollbars` 作用于该元素本身，
	// 因此这里不需要（也不应该）再挂一次。
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
	/**
	 * 当前可视区域的滚动边界（`updateTransform` 每帧算出的世界坐标范围）。
	 *
	 * ⚠️ 这四个**委托**给遗留 `UI.scrollLeft/Top/Right/Bottom`，不能是 store 自己的
	 * `shallowRef`。原因（2026-09-18 定位）：写入方是 `engine/ui/ui-engine.ts:434` 的
	 * `this.scrollLeft = …`（写的就是 `UI.scrollLeft`），而 store 里的同名 `shallowRef`
	 * **没有任何写入方** —— 读取方 `engine/ui/animation-element.ts` 的
	 * `getUIStore().scrollLeft!` 会读到 `null`，进而在
	 * `gl.matrix.project(gl.flip, sr - sl, sb - st)` 上抛错。
	 *
	 * 之所以能零改动地委托：`UIShape` 已声明 `scrollLeft/Top/Right/Bottom: number`，
	 * 所以 `UI.scrollLeft` 是**强类型**的，不需要任何断言（也不给 `unknown-casts` 加数）。
	 * 等 1c 把 `ui-engine.ts` 的 `this.*` 收编进 store，这四个就能换回普通 `shallowRef`。
	 */
	const scrollLeft = computed<number | null>(() => UI?.scrollLeft ?? null);
	const scrollTop = computed<number | null>(() => UI?.scrollTop ?? null);
	const scrollRight = computed<number | null>(() => UI?.scrollRight ?? null);
	const scrollBottom = computed<number | null>(() => UI?.scrollBottom ?? null);
	/**
	 * 当前拖拽中的指针事件 / 当前 hover 的节点。
	 *
	 * 同 `scrollLeft`：两者都委托给遗留字段（`ui/ui-pointer.ts` 写 `this.dragging`、
	 * `ui-transform.ts` 写 `this.hover`），因为 store 里的同名 `shallowRef` 没有写入方 ——
	 * 那会让 `engine/ui/button-element.ts:328-330` 的按下态/hover 判断永远为 false
	 * （按钮的 active 与 hover 贴图静默失效）。
	 *
	 * `UIShape` 里这两个的字面量初值是 `null`，推断类型因此是 `null`（而非
	 * `UIPointerEvent | null` / `UINodeShape | null`），所以这里各断言一次。这是本文件
	 * 既有的写法（见下方 `UI as unknown as Record<string, unknown>`），根因是遗留类型契约
	 * 没跟上，属于独立的清理项。
	 */
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
		UI?.requestRendering?.();
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
		UI?.setZoom?.(zoomValue);
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
		UI?.shiftAnchor?.(anchorX, anchorY);
	}

	function shiftTarget(x: number, y: number) {
		UI?.shiftTarget?.(x, y);
	}

	function resizeTarget(width?: number, height?: number) {
		UI?.resizeTarget?.(width, height);
	}

	function rotateTarget(rotation: number) {
		UI?.rotateTarget?.(rotation);
	}

	function setControlPoint(point: UIControlPoint | null) {
		UI?.setControlPoint?.(point);
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

	// 只读 presetId：`presetId` 缺失时遗留实现里的 `includes(undefined)` 本就返回 false，
	// 所以收窄入参不改变行为，只是让图标渲染器的局部视图能传进来。
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
	 * 这也是**未迁移调用方零改动**的前提：调用方写 `getUIStore().listChange(e)`，
	 * 语义与原来的 `UI.listChange(e)` 完全一致（含 `this` 绑定、含不存在时静默跳过）。
	 *
	 * @param resolve 每次调用时求值，返回**真正的接收者对象**（延迟求值是这个机制的关键）
	 *
	 * `resolve` 的返回类型是 `Record<string, unknown>` 而不是 `Record<string, any>`：
	 * 两个调用点（`UI` 惰加载代理）本来就写的是 `() => UI as Record<string, unknown> | null`，
	 * 这里只是把形参对齐到调用方已有的口径。`any` 换来的是 `target[key]` 不经 `typeof`
	 * 检查就能当函数调用 —— 而下面紧跟着的就是那次检查，所以它没有任何作用。
	 */
	const makeForwarder = (key: string, resolve: () => Record<string, unknown> | null) => {
		return (...args: unknown[]) => {
			const target = resolve();
			if (target === null) return undefined;
			const fn = target[key];
			if (typeof fn !== 'function') return undefined;
			return fn.apply(target, args);
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
		forwarders[key] = makeForwarder(key, () => UI as Record<string, unknown> | null);
	}

	/**
	 * UIEngine 自身实现的转发（7 个）。与上面那批的区别：它们的**实现**在
	 * `engine/ui/ui-engine.ts` 里，`ui-window.ts` 只是 `UI.x = UIEngine.x` 地镜像过去
	 * ——而那不是「间接层」，是 **`this` 绑定**（`UIEngine.requestRendering` 内部用
	 * `this.renderingFunction`、`shiftAnchor` 内部用 `this.planToSave`）。
	 *
	 * 为什么现在就要把它们单列出来：阶段 1c 会把 `stores/ui.ts` 的 `loadUI` 从
	 * `window-cluster → m.UI` 改为直连 `ui-engine.ts`（因为 `src/ui/` 要删）。
	 * 那一步之后 `UI` 就不再被加载，这 7 个动作会**静默失效**（`UI?.x?.()` 返回 undefined）。
	 * 让它们改为直连 `UIEngine`，就把这 7 个从「依赖遗留层」移出去了：
	 * `ui-slot-coverage` 轴的 `legacyOnly` 计数随之下降，1c ① 才真正可做。
	 *
	 * 注意**不能**写成 `UIEngine.setZoom(…)`：那样 `this` 会变成 `UIEngine`，而实现里读的
	 * 是 `this.planToSave` 等 UI 侧成员。必须以 `UI` 为接收者（`apply`），
	 * 在 1c ① 之前 `UI` 仍是那个对象。
	 */
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
		forwarders[key] = makeForwarder(key, () => UI as Record<string, unknown> | null);
	}

	function saveToConfig(config: { colors: Record<string, unknown> }) {
		UI?.saveToConfig?.(config);
	}

	/**
	 * 配置颜色的合法性兜底 + 归一化。
	 *
	 * `StageColor` 的 `input()` 是**8 位 RGBA hex** 的解析器：
	 * `slice(0,2)/slice(2,4)/slice(4,6)` 取 RGB，`slice(6,8)` 取 **alpha**
	 * （`getGLRGBA()` 用 alpha 与 `GL.BACKGROUND_*` 做混合）。
	 * 所以只给 6 位 hex 会得到 `alpha = NaN`，进而把 NaN 交给 WebGL —— 实测
	 * `'ff1e1e1e'` 与 `'ffffff'` 都是坏输入（2026-09-18）。
	 *
	 * 这里按「6 位补 `ff`、8 位原样、其余退回 fallback」归一化。
	 * 默认配置给的就是 8 位（`services/project/config.ts` 的
	 * `uiBackground: '00000000'` / `uiForeground: '000000ff'`）。
	 */
	const safeHex = (value: unknown, fallback: string): string => {
		if (typeof value !== 'string') return fallback;
		if (/^[0-9a-fA-F]{8}$/.test(value)) return value;
		// 6 位视为不透明：alpha 补 ff，而不是留一个 NaN
		if (/^[0-9a-fA-F]{6}$/.test(value)) return `${value}ff`;
		return fallback;
	};

	function loadFromConfig(config: { colors: Record<string, unknown> }) {
		// ⚠️ store 侧必须**自己**建 StageColor，不能只转发给 `UI.loadFromConfig`：
		// 那个遗留实现写的是 `this.background` / `this.foreground`（UI 单例上的另一份），
		// 而 `drawBackground` 读的是 `getUIStore().background` —— 只转发的话 store 里
		// 永远是构造时那个**透明**兜底值，于是每帧 `clearColor(0,0,0,0)`，
		// 表现就是「UI 画布一片黑，且不报错」（2026-09-18 实测）。
		//
		// 两份 StageColor 由同一份 config 驱动、回调语义一致（改色即请求重绘），
		// 因此不会漂移；store 这份才是 `drawBackground` 的真源。
		// `UI.loadFromConfig` 继续调用是为了兼容仍读 `UI.background` 的遗留路径
		// （例如 `saveToConfig` 的 `config.colors.uiBackground = this.background.hex`）。
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
		// 事件转发槽位（见 uiForwardKeys）：类型上必须逐个具名列出——`...forwarders` 只是
		// 运行时的批量实现，TS 无法从展开推断出属性名，调用方 `getUIStore().listChange` 会报错。
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
