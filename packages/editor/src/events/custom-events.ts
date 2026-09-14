/**
 * E1：应用级自定义事件的**类型化通道**。
 *
 * 现状（`pnpm events:surface`）：`window` 上有 15 个自定义事件，载荷靠"往 `Event` 上挂字段"传递，
 * 派发/监听两侧各自写 `as Event & { … }`（全仓曾 70+ 处，已收口成 `createPayloadEvent`/`readPayload`）。
 * 本文件再往前一步：把**事件名与载荷形状**集中成一张表，提供 `emitCustom` / `onCustom`——
 * 事件名写错、载荷形状不符会在编译期暴露，而不是运行时静默拿不到值。
 *
 * 为什么不用 `mitt`（依赖已删）：自定义事件已经在"window 事件 + 元素注册表"这套机制上跑通，
 * 再引入总线只会多一条并行通道；类型化的收益不需要换机制就能拿到。
 */
import { createPayloadEvent, readPayload } from '@ui-kit';

/** 事件名 → 载荷形状（`undefined` 表示无载荷）。名册与 `pnpm events:surface` 的自定义事件列表一致。 */
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
		listener(
			readPayload<Record<string, unknown>>(event) as unknown as CustomEventPayloads[K],
			event
		);
	window.addEventListener(type, handler);
	return () => window.removeEventListener(type, handler);
}
