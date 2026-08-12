import { describe, expect, it } from 'vitest';
import { createTextBoxElement } from '../text-box-api';
import type { TextBoxApi } from '../text-box-api';

describe('createTextBoxElement', () => {
	it('creates a text-box element with api attached', () => {
		const el = createTextBoxElement() as unknown as TextBoxApi;
		expect(el.classList.contains('text-box')).toBe(true);
		expect(el.input).toBeTruthy();
		expect(typeof el.read).toBe('function');
		expect(typeof el.write).toBe('function');
		expect(typeof el.insert).toBe('function');
		expect(typeof el.enable).toBe('function');
		expect(typeof el.disable).toBe('function');
		expect(typeof el.on).toBe('function');
	});

	it('write/read roundtrip', () => {
		const el = createTextBoxElement() as unknown as TextBoxApi;
		el.write('Hello');
		expect(el.read()).toBe('Hello');
		expect(el.input!.value).toBe('Hello');
	});
});
