import { describe, expect, it } from 'vitest';
import { createSelectBoxElement } from '../select-box-api';

describe('createSelectBoxElement', () => {
	it('creates a select-box element with api attached', () => {
		const el = createSelectBoxElement() as any;
		expect(el.classList.contains('select-box')).toBe(true);
		expect(typeof el.loadItems).toBe('function');
		expect(typeof el.read).toBe('function');
		expect(typeof el.write).toBe('function');
		expect(typeof el.writeDefault).toBe('function');
		expect(typeof el.enable).toBe('function');
		expect(typeof el.disable).toBe('function');
		expect(typeof el.on).toBe('function');
		expect(el.info).toBeTruthy();
	});

	it('loadItems + write + read roundtrip with names', () => {
		const el = createSelectBoxElement() as any;
		el.loadItems([
			{ name: 'False', value: false },
			{ name: 'True', value: true }
		]);
		el.write(true);
		expect(el.read()).toBe(true);
		expect(el.info.textContent).toBe('True');
	});

	it('write2 falls back to first item when value unknown', () => {
		const el = createSelectBoxElement() as any;
		el.loadItems([
			{ name: 'A', value: 'a' },
			{ name: 'B', value: 'b' }
		]);
		el.write2('unknown');
		expect(el.read()).toBe('a');
	});

	it('enableHiddenMode returns element for chaining', () => {
		const el = createSelectBoxElement() as any;
		const result = el.enableHiddenMode();
		expect(result).toBe(el);
	});
});
