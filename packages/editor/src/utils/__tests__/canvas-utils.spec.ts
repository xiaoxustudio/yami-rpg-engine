import { describe, expect, it } from 'vitest';
import { resizeCanvasContext } from '@app/utils/canvas-utils';

/**
 * 探针画布：记录 `width` / `height` 被赋值的顺序与次数。
 *
 * 这个函数的语义正是「赋值次数」——原补丁注释写的就是「尽量少的画布缓冲区重置次数」，
 * 所以断言必须看得见调用序列，而不是只看最终尺寸。
 */
function probe(width: number, height: number) {
	const writes: string[] = [];
	const canvas = {
		get width() {
			return width;
		},
		set width(value: number) {
			writes.push('width');
			width = value;
		},
		get height() {
			return height;
		},
		set height(value: number) {
			writes.push('height');
			height = value;
		}
	};
	const context = { canvas } as unknown as CanvasRenderingContext2D;
	return { canvas, context, writes };
}

describe('resizeCanvasContext', () => {
	it('两个维度都变化时分别重设', () => {
		const { canvas, context, writes } = probe(0, 0);
		resizeCanvasContext(context, 32, 16);
		expect(writes).toEqual(['width', 'height']);
		expect(canvas.width).toBe(32);
		expect(canvas.height).toBe(16);
	});

	it('尺寸相同时仍然重设 width，以便清空后备缓冲', () => {
		const { canvas, context, writes } = probe(32, 16);
		resizeCanvasContext(context, 32, 16);
		expect(writes).toEqual(['width']);
		expect(canvas.width).toBe(32);
		expect(canvas.height).toBe(16);
	});

	it('只有宽度变化时不动高度', () => {
		const { canvas, context, writes } = probe(32, 16);
		resizeCanvasContext(context, 64, 16);
		expect(writes).toEqual(['width']);
		expect(canvas.width).toBe(64);
		expect(canvas.height).toBe(16);
	});

	it('只有高度变化时不动宽度', () => {
		const { canvas, context, writes } = probe(32, 16);
		resizeCanvasContext(context, 32, 64);
		expect(writes).toEqual(['height']);
		expect(canvas.width).toBe(32);
		expect(canvas.height).toBe(64);
	});

	it('在真实的 canvas 元素上生效', () => {
		const canvas = document.createElement('canvas');
		canvas.width = 0;
		canvas.height = 0;
		const context = { canvas } as unknown as CanvasRenderingContext2D;
		resizeCanvasContext(context, 40, 20);
		expect(canvas.width).toBe(40);
		expect(canvas.height).toBe(20);
	});
});
