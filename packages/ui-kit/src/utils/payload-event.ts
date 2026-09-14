/**
 * E1（事件载荷）：把"往 `Event` 上挂字段"的既有约定收成**一处**类型化入口。
 *
 * 背景：本仓的自定义事件（`write`/`input`/`select`/`popup`/`change` …）长期靠
 * `const e = new Event('write') as Event & { value: boolean }; e.value = v;` 传载荷——
 * 派发侧与监听侧各自写一遍 `as Event & { … }`（全仓 70+ 处）。这里只做**类型集中**：
 * 运行时行为与之前完全一致（仍是同一个 `Event` 加上若干自有字段），因此可以逐处迁移、不必大改。
 *
 * 注意：**没有**改用 `CustomEvent.detail`——那会改变事件对象的形状，监听方（含测试）都要跟着改，
 * 属于更大的改动；本次只消除"散落的断言"。
 */

/** 带载荷的事件类型：`Event` 加上若干自有字段 */
export type PayloadEvent<T extends object> = Event & T;

/** 造一个带载荷的事件（等价于原先 `new Event(type, init) as Event & T` + 逐字段赋值） */
export function createPayloadEvent<T extends object>(
	type: string,
	payload: T,
	init?: EventInit
): PayloadEvent<T> {
	const event = new Event(type, init) as PayloadEvent<T>;
	Object.assign(event, payload);
	return event;
}

/** 读取载荷（监听侧用；等价于 `(event as Event & T).field`，但只有一个转换点） */
export function readPayload<T extends object>(event: Event): Partial<T> {
	return event as unknown as Partial<T>;
}
