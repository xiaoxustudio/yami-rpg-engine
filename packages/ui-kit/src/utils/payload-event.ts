export type PayloadEvent<T> = Event & T;

/** 造一个带载荷的事件（等价于 `new Event(type, init) as Event & T` 再逐字段赋值） */
export function createPayloadEvent<T extends object>(
	type: string,
	payload: T,
	init?: EventInit
): PayloadEvent<T> {
	const event = new Event(type, init) as PayloadEvent<T>;
	Object.assign(event, payload);
	return event;
}

/**
 * 读取载荷（监听侧用；等价于 `(event as Event & T).field`，但只有一个转换点）。
 * 返回 `PayloadEvent<T>`（= `Event & T`）而不是 `Partial<T>`：与旧的断言**类型完全一致**，
 * 因此赋值给 `Event & { … }` 的既有变量不会因为"变窄/变宽"报错。
 *
 * `T` 的约束从 `extends object` 放开。原来的约束只是**书写时的假设**（运行时
 * 就是一次 `as`，什么都不检查），却挡住了两件真事：① 载荷表里的 `undefined`（无载荷事件）
 * 与 `string`（`'yami:error'` 是 `{…} | string`）；② 于是 `events/custom-events.ts` 的
 * `onCustom` 只能写 `readPayload<Record<string, unknown>>(event) as unknown as CustomEventPayloads[K]`
 * 两层跳板 —— 放开后直接 `readPayload<CustomEventPayloads[K]>(event)`。
 * 现有调用点全部显式给类型实参（`readPayload<{…}>`），故放开不会改变它们的推断。
 */
export function readPayload<T>(event: Event): PayloadEvent<T> {
	return event as PayloadEvent<T>;
}
