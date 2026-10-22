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
 * `await clusterReady` 必须保留：它等 Scene / UI / Animation / Particle / Palette
 * 五个窗口全部就绪。
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
	 * `elements.list` / `.head` / `.body` / `.screen` 一律从**元素注册表**读取，而不是靠桥接写入。
	 *
	 * 必须是每次读都重新求值且只读的 getter：`uiEls` 是无响应性的普通 `Map`，用 `computed`
	 * 会永久缓存首次读到的 `null`；用 `reactive(new Map())` 会破坏元素同一性；`elements`
	 * 必须 `markRaw`，否则 Pinia 的代理同样会破坏同一性。
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
		/** 当前选中的 UI 节点（同时挂到 `elements` 上供遗留层读取）。 */
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
