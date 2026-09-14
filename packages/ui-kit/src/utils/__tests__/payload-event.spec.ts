import { describe, expect, it } from 'vitest';
import { createPayloadEvent, readPayload } from '../payload-event';

/**
 * E1：载荷事件的**类型**入口。运行时语义与旧的
 * `new Event(type) as Event & { … }` + 逐字段赋值完全一致，这几条把它钉住。
 */
describe('payload-event（E1 载荷事件）', () => {
	it('createPayloadEvent：事件类型正确，载荷字段可读', () => {
		const event = createPayloadEvent('write', { value: 42 });
		expect(event.type).toBe('write');
		expect(event.value).toBe(42);
	});

	it('createPayloadEvent：可带 EventInit（bubbles 等）', () => {
		const event = createPayloadEvent('change', { index: 3 }, { bubbles: true });
		expect(event.bubbles).toBe(true);
		expect((event as Event & { index: number }).index).toBe(3);
	});

	it('createPayloadEvent：监听侧能收到同样的字段（派发-监听闭环）', () => {
		const target = new EventTarget();
		let received: unknown;
		target.addEventListener('write', (event) => {
			received = readPayload<{ value: string }>(event).value;
		});
		target.dispatchEvent(createPayloadEvent('write', { value: 'ok' }));
		expect(received).toBe('ok');
	});

	it('readPayload：缺字段时返回 undefined（与旧断言行为一致）', () => {
		const event = new Event('select');
		expect(readPayload<{ value: unknown }>(event).value).toBeUndefined();
	});
});
