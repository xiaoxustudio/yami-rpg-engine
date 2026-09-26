// 编辑器高频事件联合类型。替代渲染进程中大量 `(event: any) => void` 形参残留，在保留
// HTMLElement 子类协变契约的同时收敛为精确类型。
//
// 说明：`Event.prototype` 在 `utils/event-accessors.ts` 已扩展 `dragKey`/`cmdOrCtrlKey`/
// `macRedoKey`，此处通过 interface 声明合并补全访问器，避免在各调用方重复 `as any` 断言。
//
// 本模块同时接管**事件载荷契约**——过去 `Project/global.d.ts` 用
// `interface Event { value: any; mode: any; … }` 给**全局**每个事件都加上了本仓库的载荷字段
// （连原生 `resize` 事件也"看起来"带 `value`），拼错的字段名同样能通过编译。现在只有显式
// 标注为 `EditorEvent` / `YamiEvent` 的处理器才具备这些字段——它们全部由本仓库派发
// （元素 `dispatchEvent` + `createPayloadEvent`）。

// 历史载荷签名的宽松别名（**单点豁免**，避免把上百处 `: any` 散成上百条 lint 警告）。
// oxlint-disable-next-line no-explicit-any
type Loose = any;
/**
 * 本仓库在事件对象上挂载的字段（元素事件 / 窗口事件载荷）。
 *
 * **全部可选**——这是刻意的：`utils/element-utils.ts` 的 `on()` 与各模块的处理器会被注册到
 * 原生 `addEventListener`（形参 `Event`），只有"`Event` 可赋给本类型"才不需要在每个注册点写
 * `as EventListener`。代价是这里的字段读出来带 `| undefined`，因此**需要 `clientX` / `button`
 * 这类原生成员的处理器要用 `YamiMouseEvent` / `YamiMouseEvent` / `YamiKeyboardEvent`**
 * （它们把原生成员保留为必需）。
 */
export interface EventPayloadFields {
	/** 事件载荷（元素 `write` / `change` / 列表 `select` / `record` / `open` …） */
	value?: Loose;
	/** 滚动 / 拖拽模式标记（`'scroll'` 等） */
	mode?: Loose;
	last?: Loose;
	latest?: Loose;
	lastValue?: Loose;
	/** 原始宿主事件（右键菜单 `popup` 携带） */
	raw?: Loose;
	key?: Loose;
	spaceKey?: boolean;
	cmdOrCtrlKey?: boolean;
	doubleclickProcessed?: boolean;
	scrollLeft?: number;
	scrollTop?: number;
}

export type EditorEvent =
	| KeyboardEvent
	| MouseEvent
	| PointerEvent
	| DragEvent
	| WheelEvent
	| InputEvent
	| Event;

/** 泛化的事件句柄：原生 `Event` + 本仓库载荷字段（载荷字段可选，见 `EventPayloadFields`）。 */
export type YamiEvent = Event & EventPayloadFields;

/** 鼠标 / 指针类元素事件（保留原生 `clientX` / `button` / `altKey` 等必需成员）。 */
export type YamiMouseEvent = MouseEvent & EventPayloadFields;

/** 指针类元素事件（拖拽滚动 / 画布指针）的显式句柄。 */
export type YamiPointerEvent = PointerEvent & EventPayloadFields;

/** 键盘类元素事件（保留原生 `key` / `ctrlKey` 等必需成员）。 */
export type YamiKeyboardEvent = KeyboardEvent & EventPayloadFields;

export interface EventExtension {
	readonly dragKey: boolean;
	readonly cmdOrCtrlKey: boolean;
	readonly macRedoKey: boolean;
}

// 合并扩展后的 Event（声明合并，供需要扩展访问器的形参使用）
export type ExtendedEvent = Event & EventExtension;

export type ExtendedKeyboardEvent = KeyboardEvent & EventExtension;

export type ExtendedMouseEvent = MouseEvent & EventExtension;

export type ExtendedPointerEvent = PointerEvent & EventExtension;

export type ExtendedDragEvent = DragEvent & EventExtension;
