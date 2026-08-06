import { describe, expect, it } from 'vitest';
import { createTextAreaElement } from '../text-area-api';

describe('createTextAreaElement', () => {
	it('creates text-area with textarea', () => {
		const el = createTextAreaElement() as any;
		expect(el.classList.contains('text-area')).toBe(true);
		expect(el.input.tagName).toBe('TEXTAREA');
		expect(typeof el.read).toBe('function');
		expect(typeof el.write).toBe('function');
		expect(typeof el.insert).toBe('function');
		expect(typeof el.enable).toBe('function');
		expect(typeof el.disable).toBe('function');
	});

	it('write/read roundtrip', () => {
		const el = createTextAreaElement() as any;
		el.write('hello\nworld');
		expect(el.read()).toBe('hello\nworld');
		expect(el.input.value).toBe('hello\nworld');
	});

	it('enable/disable toggles disabled class', () => {
		const el = createTextAreaElement() as any;
		el.disable();
		expect(el.classList.contains('disabled')).toBe(true);
		el.enable();
		expect(el.classList.contains('disabled')).toBe(false);
	});
});
