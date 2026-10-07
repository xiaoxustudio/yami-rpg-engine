import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Easing } from '@app/data/transition-window.ts';

type Drag = { pointerId: number; clientX: number; clientY: number };

const drag = (pointerId: number): Drag => ({ pointerId, clientX: 10, clientY: 10 });

describe('Easing.pointerup 的拖拽收尾', () => {
	let removeListener: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		removeListener = vi.spyOn(window, 'removeEventListener');
		Easing.dragging = drag(7) as unknown as typeof Easing.dragging;
	});

	afterEach(() => {
		Easing.dragging = null;
		vi.restoreAllMocks();
	});

	it('同一个指针的 pointerup：清掉拖拽并摘掉两个监听（旧代码在这里抛 relate 不是函数）', () => {
		expect(() => Easing.pointerup({ pointerId: 7 } as PointerEvent)).not.toThrow();

		expect(Easing.dragging).toBe(null);
		expect(removeListener).toHaveBeenCalledWith('pointerup', Easing.pointerup);
		expect(removeListener).toHaveBeenCalledWith('pointermove', Easing.pointermove);
	});

	it('别的指针的 pointerup：不算收尾（拖拽继续，监听不摘）', () => {
		Easing.pointerup({ pointerId: 8 } as PointerEvent);

		expect(Easing.dragging).not.toBe(null);
		expect(removeListener).not.toHaveBeenCalled();
	});

	it('不带事件参数（blur/窗口失焦路径）：拿拖拽起始事件自身比对，即视为同一指针', () => {
		expect(() => Easing.pointerup()).not.toThrow();

		expect(Easing.dragging).toBe(null);
		expect(removeListener).toHaveBeenCalledWith('pointerup', Easing.pointerup);
	});

	it('没有在拖拽时是空操作', () => {
		Easing.dragging = null;

		expect(() => Easing.pointerup({ pointerId: 7 } as PointerEvent)).not.toThrow();
		expect(removeListener).not.toHaveBeenCalled();
	});
});
