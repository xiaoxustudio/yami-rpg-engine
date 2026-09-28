/**
 * ④-4 契约（生成物 —— 由 scripts/oneoff/gen-contract-members.mjs 产出，第 193 轮）。
 *
 * 成员类型来自类型检查器对 `uiMembers` 的**推断**（源码里没有可抬的注解）。
 * 生成 75 条；跳过 7 条（原因见生成器输出）。
 */
import type { UIElementInstance, UINodeShape } from './element-classes.ts';
import type { UIPointerEvent } from './ui-singleton.ts';
import type { YamiMouseEvent } from '../../types/editor-event.ts';

export interface UIDomainMembers {
	selectObject: ((x: number, y: number) => UINodeShape | null) | null;
	marqueePointerdown: ((event: UIPointerEvent) => void) | null;
	marqueePointermove: ((event: UIPointerEvent) => void) | null;
	marqueePointerleave: ((_event: UIPointerEvent) => void) | null;
	marqueeDoubleclick: ((_event: UIPointerEvent) => void) | null;
	pointerup: ((event?: UIPointerEvent) => void) | null;
	pointermove: ((event: UIPointerEvent) => void) | null;
	menuPopup: ((event: UIPointerEvent) => void) | null;
	switchSettings: (() => void) | null;
	planToSave: (() => void) | null;
	saveToConfig: ((config: { colors: Record<string, unknown> }) => void) | null;
	loadFromConfig: ((config: { colors: Record<string, unknown> }) => void) | null;
	saveToProject:
		| ((project: {
				ui: { zoom?: number } & Record<string, unknown>;
				uiPrefabs?: string[];
		  }) => void)
		| null;
	loadFromProject: ((project: { ui: { zoom: number } }) => void) | null;
	webglRestored: ((_event: Event) => void) | null;
	windowResize: ((_event: Event) => void) | null;
	themechange: ((_event: Event) => void) | null;
	localizationchange: ((_event: Event) => void) | null;
	keydown: ((event: KeyboardEvent) => void) | null;
	headPointerdown: ((event: PointerEvent) => void) | null;
	shortcutPointerdown: ((event: PointerEvent) => void) | null;
	zoomFocus: ((_event?: Event) => void) | null;
	zoomInput: ((_event: Event & { value?: number }) => void) | null;
	translationKeyup: ((event?: KeyboardEvent) => void) | null;
	screenWheel: ((event: WheelEvent) => void) | null;
	screenUserscroll: ((_event: Event) => void) | null;
	screenBlur: ((_event?: FocusEvent) => void) | null;
	save: (() => void) | null;
	close: (() => void) | null;
	copy: (() => void) | null;
	paste: ((x?: number, y?: number) => void) | null;
	duplicate: (() => void) | null;
	create: ((kind: string, x: number, y: number) => void) | null;
	createPrefab:
		| ((
				prefab:
					| UINodeShape
					| { name: string; presetId: string; transform: { x: number; y: number } },
				parent?: UINodeShape | null,
				x?: number,
				y?: number
		  ) => void)
		| null;
	createShortcut: ((item: UINodeShape) => void) | null;
	delete: (() => void) | null;
	toggle: (() => void) | null;
	undo: (() => void) | null;
	redo: (() => void) | null;
	setSize: ((width: number, height: number) => void) | null;
	setHover: ((hover: UINodeShape | null) => void) | null;
	setTarget: ((target: UINodeShape | null) => void) | null;
	revealTarget: (() => void) | null;
	updateHover: (() => void) | null;
	updateTarget: (() => void) | null;
	updateTargetItem: (() => void) | null;
	updateElementFont: (() => void) | null;
	updateElementLanguage: (() => void) | null;
	updateElementTextScaling: (() => void) | null;
	updateIndexedColor: ((index: number) => void) | null;
	updateAllTexts: (() => void) | null;
	updateAllPrinters: (() => void) | null;
	updateAllReferences: (() => void) | null;
	updateElement: ((target: UINodeShape) => void) | null;
	deleteElement: ((target: UINodeShape) => void) | null;
	updateHead: (() => void) | null;
	resize: (() => void) | null;
	createPrefabItem:
		| ((
				parent?: UINodeShape | null,
				x?: number,
				y?: number
		  ) => {
				label: string;
				enabled: boolean;
				submenu: { label: string; data: UINodeShape; click: () => void }[];
		  })
		| null;
	/**
	 * 递归装配节点树（`ui-prefab.ts` 的实现）。
	 *
	 * `parent` 是**实例**：实现里就是 `parent.appendChild(instance)`（`element-base.ts:250`
	 * 的实例方法）。调用点（`ui-file.ts:92` 传 `this.root`）传的也正是根**实例**。
	 */
	loadElement: ((node: UINodeShape, parent?: UIElementInstance) => void) | null;
	searcherInput: ((event: InputEvent) => void) | null;
	listPointerdown: ((event: PointerEvent) => void) | null;
	listSelect: ((event: Event) => void) | null;
	listRecord: ((event: Event) => void) | null;
	listPopup: ((event: Event) => void) | null;
	listOpen: ((_event: Event) => void) | null;
	listRename:
		| ((response: { item: UINodeShape; oldValue: string; newValue: string }) => void)
		| null;
	listChange: ((_event: Event) => void) | null;
	listPageResize: ((_event: YamiMouseEvent) => void) | null;
	initialize: (() => void) | null;
	hasPrefab: ((node: UINodeShape | { presetId?: string }) => boolean) | null;
	clearInvalidPrefabs: ((uiPrefabs: string[]) => void) | null;
	registerPreset: ((node: UINodeShape) => void) | null;
	unregisterPreset: ((node: UINodeShape) => void) | null;
	setAsPrefab: ((node: UINodeShape) => void) | null;
	unsetAsPrefab: ((node: UINodeShape) => void) | null;
}

// ④-4 接线（**贪心**，第 198 轮）：只接不会让全仓变红的成员；其余留在 UIDomainMembers 里待定。
// 待定 0 条：(无)
declare module './ui-singleton.ts' {
	interface UIShape extends Pick<
		UIDomainMembers,
		| 'selectObject'
		| 'marqueePointerdown'
		| 'marqueePointermove'
		| 'marqueePointerleave'
		| 'marqueeDoubleclick'
		| 'pointerup'
		| 'pointermove'
		| 'menuPopup'
		| 'switchSettings'
		| 'planToSave'
		| 'saveToConfig'
		| 'loadFromConfig'
		| 'saveToProject'
		| 'loadFromProject'
		| 'webglRestored'
		| 'windowResize'
		| 'themechange'
		| 'localizationchange'
		| 'keydown'
		| 'headPointerdown'
		| 'shortcutPointerdown'
		| 'zoomFocus'
		| 'zoomInput'
		| 'translationKeyup'
		| 'screenWheel'
		| 'screenUserscroll'
		| 'screenBlur'
		| 'save'
		| 'close'
		| 'copy'
		| 'paste'
		| 'duplicate'
		| 'create'
		| 'createPrefab'
		| 'createShortcut'
		| 'delete'
		| 'toggle'
		| 'undo'
		| 'redo'
		| 'setSize'
		| 'setHover'
		| 'setTarget'
		| 'revealTarget'
		| 'updateHover'
		| 'updateTarget'
		| 'updateTargetItem'
		| 'updateElementFont'
		| 'updateElementLanguage'
		| 'updateElementTextScaling'
		| 'updateIndexedColor'
		| 'updateAllTexts'
		| 'updateAllPrinters'
		| 'updateAllReferences'
		| 'updateElement'
		| 'deleteElement'
		| 'updateHead'
		| 'resize'
		| 'createPrefabItem'
		| 'loadElement'
		| 'searcherInput'
		| 'listPointerdown'
		| 'listSelect'
		| 'listRecord'
		| 'listPopup'
		| 'listOpen'
		| 'listRename'
		| 'listChange'
		| 'listPageResize'
		| 'initialize'
		| 'hasPrefab'
		| 'clearInvalidPrefabs'
		| 'registerPreset'
		| 'unregisterPreset'
		| 'setAsPrefab'
		| 'unsetAsPrefab'
	> {}
}
