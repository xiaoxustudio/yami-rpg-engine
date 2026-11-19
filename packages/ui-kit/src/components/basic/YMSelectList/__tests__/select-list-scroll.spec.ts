import { describe, expect, it, vi, afterEach } from 'vitest';
import { createSelectListElement } from '../select-list-api';
import type { SelectListApi } from '../select-list-api';
import { elementDataOf } from '../../../../utils/element-data';
import { getElementApi } from '../../../../utils/element-apis';

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
		const api = getElementApi<SelectListApi>(box)!;
		const addSpy = vi.spyOn(box, 'addEventListener');
		api.open(makeTarget() as any);
		expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
		expect(addSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
		api.close();
		if (box.isConnected) {
			box.remove();
		}
	});

	it('close 后移除 scroll 事件监听', () => {
		const box = makeBox();
		const api = getElementApi<SelectListApi>(box)!;
		const removeSpy = vi.spyOn(box, 'removeEventListener');
		api.open(makeTarget() as any);
		api.close();
		expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
		expect(removeSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
		if (box.isConnected) {
			box.remove();
		}
	});
});
