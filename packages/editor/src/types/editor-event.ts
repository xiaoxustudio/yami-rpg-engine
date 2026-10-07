// oxlint-disable-next-line no-explicit-any
type Loose = any;
export interface EventPayloadFields {
	value?: Loose;
	mode?: Loose;
	last?: Loose;
	latest?: Loose;
	lastValue?: Loose;
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

export type YamiEvent = Event & EventPayloadFields;

export type YamiMouseEvent = MouseEvent & EventPayloadFields;

export type YamiPointerEvent = PointerEvent & EventPayloadFields;

export type YamiKeyboardEvent = KeyboardEvent & EventPayloadFields;

export interface EventExtension {
	readonly dragKey: boolean;
	readonly cmdOrCtrlKey: boolean;
	readonly macRedoKey: boolean;
}

export type ExtendedEvent = Event & EventExtension;

export type ExtendedKeyboardEvent = KeyboardEvent & EventExtension;

export type ExtendedMouseEvent = MouseEvent & EventExtension;

export type ExtendedPointerEvent = PointerEvent & EventExtension;

export type ExtendedDragEvent = DragEvent & EventExtension;
