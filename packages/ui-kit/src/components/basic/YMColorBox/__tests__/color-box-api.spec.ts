import { describe, expect, it } from 'vitest';
import { createColorBoxElement } from '../color-box-api';
import type { ColorBoxApi } from '../color-box-api';
import { getElementApi } from '../../../../utils/element-apis';

describe('createColorBoxElement', () => {
	it('creates color-box with foreground', () => {
		const el = createColorBoxElement() as unknown as ColorBoxApi;
		const api = getElementApi<ColorBoxApi>(el)!;
		expect(el.classList.contains('color-box')).toBe(true);
		expect(el.querySelector('.color-box-foreground')).toBeTruthy();
		// 契约锁：能力在旁表里，元素上不再挂方法
		expect(typeof (el as unknown as Record<string, unknown>).read).toBe('undefined');
		expect(typeof api.read).toBe('function');
		expect(typeof api.write).toBe('function');
		expect(typeof api.input).toBe('function');
		expect(typeof api.enable).toBe('function');
		expect(typeof api.disable).toBe('function');
	});

	it('write sets foreground rgba', () => {
		const el = createColorBoxElement() as unknown as ColorBoxApi;
		const api = getElementApi<ColorBoxApi>(el)!;
		api.write('ff0000ff');
		expect(api.read()).toBe('ff0000ff');
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
