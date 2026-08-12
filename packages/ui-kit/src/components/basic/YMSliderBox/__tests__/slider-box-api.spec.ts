import { describe, expect, it } from 'vitest';
import { createSliderBoxElement } from '../slider-box-api';
import type { SliderBoxApi } from '../slider-box-api';

describe('createSliderBoxElement', () => {
	it('creates slider-box with range input', () => {
		const el = createSliderBoxElement({ min: '0', max: '100' }) as unknown as SliderBoxApi;
		expect(el.classList.contains('slider-box')).toBe(true);
		expect(el.input!.type).toBe('range');
		expect(el.querySelector('.slider-bar')).toBeTruthy();
		expect(typeof el.read).toBe('function');
		expect(typeof el.write).toBe('function');
		expect(typeof el.updateFiller).toBe('function');
	});

	it('write updates filler width', () => {
		const el = createSliderBoxElement({ min: '0', max: '100' }) as unknown as SliderBoxApi;
		el.write(50);
		expect(el.read()).toBe(50);
		expect(el.filler!.style.width).toBe('50%');
	});

	it('enable/disable toggles class', () => {
		const el = createSliderBoxElement() as unknown as SliderBoxApi;
		el.disable();
		expect(el.classList.contains('disabled')).toBe(true);
		el.enable();
		expect(el.classList.contains('disabled')).toBe(false);
	});
});
