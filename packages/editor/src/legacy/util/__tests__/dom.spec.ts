import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { getElementReader, getElementWriter } from '../dom';

describe('getElementReader/getElementWriter 防御（回归保护）', () => {
	beforeEach(() => {
		vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		document.body.innerHTML = '';
		vi.restoreAllMocks();
	});

	it('reader 对缺失元素返回 undefined 且不抛错', () => {
		expect(() => {
			const value = getElementReader('prefix')('missing');
			expect(value).toBeUndefined();
		}).not.toThrow();
	});

	it('writer 对缺失元素不抛错', () => {
		expect(() => {
			getElementWriter('prefix')('missing', 42);
		}).not.toThrow();
	});

	it('writer 对带 write 方法的元素调用 write', () => {
		const calls: unknown[] = [];
		const el = document.createElement('div');
		el.id = 'prefix-suffix';
		(el as unknown as { write: (v: unknown) => void }).write = (v: unknown) => {
			calls.push(v);
		};
		document.body.appendChild(el);
		getElementWriter('prefix')('suffix', 42);
		expect(calls).toEqual([42]);
	});

	it('writer 对无 write 的元素告警且不写入 dataValue', () => {
		const el = document.createElement('div') as HTMLElement & { dataValue?: unknown };
		el.id = 'prefix-suffix';
		document.body.appendChild(el);
		getElementWriter('prefix')('suffix', 42);
		expect(el.dataValue).toBeUndefined();
		expect(console.warn).toHaveBeenCalledWith(
			expect.stringContaining('element has no write()')
		);
	});
});
