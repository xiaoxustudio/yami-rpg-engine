import { describe, expect, it } from 'vitest';
import { createNumberBoxElement } from '../number-box-api';
import type { NumberBoxApi } from '../number-box-api';
import { getElementApi } from '../../../../utils/element-apis';

describe('createNumberBoxElement', () => {
	it('creates number-box with input', () => {
		const el = createNumberBoxElement() as unknown as NumberBoxApi;
		const api = getElementApi<NumberBoxApi>(el)!;
		expect(el.classList.contains('number-box')).toBe(true);
		expect(el.input!.type).toBe('number');
		// 契约锁：能力在旁表里，元素上不再挂方法
		expect(typeof (el as unknown as Record<string, unknown>).read).toBe('undefined');
		expect(typeof api.read).toBe('function');
		expect(typeof api.write).toBe('function');
		expect(typeof api.enable).toBe('function');
		expect(typeof api.disable).toBe('function');
	});

	it('read clamps to min/max', () => {
		const el = createNumberBoxElement({ min: '0', max: '10' }) as unknown as NumberBoxApi;
		const api = getElementApi<NumberBoxApi>(el)!;
		el.input!.value = '25';
		expect(api.read()).toBe(10);
		el.input!.value = '-5';
		expect(api.read()).toBe(0);
	});

	it('write/read roundtrip with decimals', () => {
		const el = createNumberBoxElement({
			min: '0',
			max: '100',
			decimals: 2
		}) as unknown as NumberBoxApi;
		const api = getElementApi<NumberBoxApi>(el)!;
		api.write('3.14159');
		expect(api.read()).toBe(3.14);
	});
});
