import { describe, expect, it, vi } from 'vitest';
import { emitCustom, onCustom } from '../custom-events';

/**
 * 自定义事件类型化通道。三条要点——无载荷事件就是普通 `Event`；
 * 带载荷事件的字段能原样读到；`onCustom` 返回的取消订阅函数真的能摘掉监听。
 */
describe('custom-events（类型化事件通道）', () => {
	it('emitCustom：无载荷事件派发普通 Event，监听方能收到', () => {
		const listener = vi.fn();
		const off = onCustom('themechange', listener);
		emitCustom('themechange');
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener.mock.calls[0][1].type).toBe('themechange');
		off();
	});

	it('emitCustom：带载荷事件的字段原样可读（datachange 的 key/last）', () => {
		const seen: unknown[] = [];
		const off = onCustom('datachange', (payload) => seen.push(payload.key, payload.last));
		emitCustom('datachange', { key: 'speed', last: 3 });
		expect(seen).toEqual(['speed', 3]);
		off();
	});

	it('onCustom：返回的取消订阅函数摘掉监听（再派发不触发）', () => {
		const listener = vi.fn();
		const off = onCustom('variablechange', listener);
		off();
		emitCustom('variablechange');
		expect(listener).not.toHaveBeenCalled();
	});

	it('多个监听者都能收到同一个事件', () => {
		const a = vi.fn();
		const b = vi.fn();
		const offA = onCustom('localizationchange', a);
		const offB = onCustom('localizationchange', b);
		emitCustom('localizationchange');
		expect(a).toHaveBeenCalledTimes(1);
		expect(b).toHaveBeenCalledTimes(1);
		offA();
		offB();
	});
});
