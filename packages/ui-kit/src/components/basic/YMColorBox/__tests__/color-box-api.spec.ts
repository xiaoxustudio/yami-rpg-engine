import { describe, expect, it } from 'vitest';
import { createColorBoxElement } from '../color-box-api';
import type { ColorBoxApi } from '../color-box-api';

describe('createColorBoxElement', () => {
	it('creates color-box with foreground', () => {
		const el = createColorBoxElement() as unknown as ColorBoxApi;
		expect(el.classList.contains('color-box')).toBe(true);
		expect(el.querySelector('.color-box-foreground')).toBeTruthy();
		expect(typeof el.read).toBe('function');
		expect(typeof el.write).toBe('function');
		expect(typeof el.input).toBe('function');
		expect(typeof el.enable).toBe('function');
		expect(typeof el.disable).toBe('function');
	});

	it('write sets foreground rgba', () => {
		const el = createColorBoxElement() as unknown as ColorBoxApi;
		el.write('ff0000ff');
		expect(el.read()).toBe('ff0000ff');
		expect(el.foreground.style.backgroundColor).toBe('rgb(255, 0, 0)');
	});

	it('click calls colorPicker injection', () => {
		let opened = false;
		const el = createColorBoxElement({
			colorPicker: () => (opened = true)
		}) as unknown as ColorBoxApi;
		el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(opened).toBe(true);
	});
});
