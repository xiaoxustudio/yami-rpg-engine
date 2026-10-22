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
 * 返回 `Event & T` 而不是 `Partial<T>`。
 */
export function readPayload<T>(event: Event): PayloadEvent<T> {
	return event as PayloadEvent<T>;
}
