import { createPayloadEvent, readPayload } from '@ui-kit';

export interface CustomEventPayloads {
	localizationchange: undefined;
	localize: undefined;
	themechange: undefined;
	datachange: { key?: string; last?: unknown };
	variablechange: undefined;
	enumchange: undefined;
	dirchange: undefined;
	dprchange: undefined;
	'script-change': undefined;
	'home-recent-update': undefined;
	'update-log-update': undefined;
	'os-dragstart': undefined;
	'os-dragend': undefined;
	'vue-app-mounted': undefined;
	'boot-ready': { ok: boolean };
	'yami:error': { detail?: { message?: string } | string };
}

export type CustomEventName = keyof CustomEventPayloads;

/** 派发一个自定义事件（无载荷时就是普通 `Event`，有载荷时走 `createPayloadEvent`） */
export function emitCustom<K extends CustomEventName>(
	type: K,
	...args: CustomEventPayloads[K] extends undefined ? [] : [payload: CustomEventPayloads[K]]
): void {
	const payload = args[0];
	window.dispatchEvent(
		payload === undefined
			? new Event(type)
			: createPayloadEvent(type, payload as Record<string, unknown>)
	);
}

/**
 * 监听一个自定义事件；返回取消订阅函数。
 * 载荷以**第二个参数**给出（无载荷事件为 `undefined`），调用点不必再写 `as Event & { … }`。
 */
export function onCustom<K extends CustomEventName>(
	type: K,
	listener: (payload: CustomEventPayloads[K], event: Event) => void
): () => void {
	const handler = (event: Event): void =>
		listener(readPayload<CustomEventPayloads[K]>(event), event);
	window.addEventListener(type, handler);
	return () => window.removeEventListener(type, handler);
}
