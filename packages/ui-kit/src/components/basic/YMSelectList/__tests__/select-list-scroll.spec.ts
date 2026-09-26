import { describe, expect, it, vi, afterEach } from 'vitest';
import { createSelectListElement } from '../select-list-api';
import type { SelectListApi } from '../select-list-api';
import { elementDataOf } from '../../../../utils/element-data';

function makeBox(): SelectListApi {
	return createSelectListElement() as unknown as SelectListApi;
}

function makeTarget() {
	const target = document.createElement('div');
	target.classList.add('select-box');
	Object.assign(target, {
		read: vi.fn(),
		write: vi.fn(),
		input: vi.fn()
	});
	// `dataItems` / `dataValue` 是**元素数据**（生产侧由 `select-box-api.ts` 写入同一份 WeakMap）。
	// 访问器退役前 `Object.assign` 会经原型 setter 落进 WeakMap，退役后只会变成 own 属性 ⇒
	// 夹具必须显式写元素数据，否则 `open()` 读到的 `dataItems` 是 undefined（`items is not iterable`）。
	elementDataOf<{ dataItems: Array<{ value: string; name: string }> }>(target).dataItems = [
		{ value: 'a', name: 'A' },
		{ value: 'b', name: 'B' }
	];
	elementDataOf<{ dataValue: unknown }>(target).dataValue = null;
	return target;
}

describe('YMSelectList scroll 监听（回归保护）', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('open 后绑定 scroll 事件监听', () => {
		const box = makeBox();
		const addSpy = vi.spyOn(box, 'addEventListener');
		box.open(makeTarget() as any);
		expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
		expect(addSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
		box.close();
		if (box.isConnected) {
			box.remove();
		}
	});

	it('close 后移除 scroll 事件监听', () => {
		const box = makeBox();
		const removeSpy = vi.spyOn(box, 'removeEventListener');
		box.open(makeTarget() as any);
		box.close();
		expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
		expect(removeSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
		if (box.isConnected) {
			box.remove();
		}
	});
});
