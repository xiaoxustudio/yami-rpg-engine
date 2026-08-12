import { describe, expect, it, vi, afterEach } from 'vitest';
import { createSelectListElement } from '../select-list-api';
import type { SelectListApi } from '../select-list-api';

function makeBox(): SelectListApi {
	return createSelectListElement() as unknown as SelectListApi;
}

function makeTarget() {
	const target = document.createElement('div');
	target.classList.add('select-box');
	Object.assign(target, {
		dataItems: [
			{ value: 'a', name: 'A' },
			{ value: 'b', name: 'B' }
		],
		dataValue: null,
		read: vi.fn(),
		write: vi.fn(),
		input: vi.fn()
	});
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
