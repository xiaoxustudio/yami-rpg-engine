import { describe, expect, it } from 'vitest';
import { createNumberBoxElement } from '../number-box-api';
import type { NumberBoxApi } from '../number-box-api';

describe('createNumberBoxElement', () => {
	it('creates number-box with input', () => {
		const el = createNumberBoxElement() as unknown as NumberBoxApi;
		expect(el.classList.contains('number-box')).toBe(true);
		expect(el.input!.type).toBe('number');
		expect(typeof el.read).toBe('function');
		expect(typeof el.write).toBe('function');
		expect(typeof el.enable).toBe('function');
		expect(typeof el.disable).toBe('function');
	});

	it('read clamps to min/max', () => {
		const el = createNumberBoxElement({ min: '0', max: '10' }) as unknown as NumberBoxApi;
		el.input!.value = '25';
		expect(el.read()).toBe(10);
		el.input!.value = '-5';
		expect(el.read()).toBe(0);
	});

	it('write/read roundtrip with decimals', () => {
		const el = createNumberBoxElement({
			min: '0',
			max: '100',
			decimals: 2
		}) as unknown as NumberBoxApi;
		el.write('3.14159');
		expect(el.read()).toBe(3.14);
	});
});
