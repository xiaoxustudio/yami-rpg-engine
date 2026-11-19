import { describe, expect, it } from 'vitest';
import { createTextAreaElement } from '../text-area-api';
import type { TextAreaApi } from '../text-area-api';
import { getElementApi } from '../../../../utils/element-apis';

describe('createTextAreaElement', () => {
	it('creates text-area with textarea', () => {
		const el = createTextAreaElement() as unknown as TextAreaApi;
		const api = getElementApi<TextAreaApi>(el)!;
		expect(el.classList.contains('text-area')).toBe(true);
		expect(el.input!.tagName).toBe('TEXTAREA');
		// 契约锁：能力在旁表里，元素上不再挂方法
		expect(typeof (el as unknown as Record<string, unknown>).read).toBe('undefined');
		expect(typeof api.read).toBe('function');
		expect(typeof api.write).toBe('function');
		expect(typeof api.insert).toBe('function');
		expect(typeof api.enable).toBe('function');
		expect(typeof api.disable).toBe('function');
	});

	it('write/read roundtrip', () => {
		const el = createTextAreaElement() as unknown as TextAreaApi;
		const api = getElementApi<TextAreaApi>(el)!;
		api.write('hello\nworld');
		expect(api.read()).toBe('hello\nworld');
		expect(el.input!.value).toBe('hello\nworld');
	});

	it('enable/disable toggles disabled class', () => {
		const el = createTextAreaElement() as unknown as TextAreaApi;
		const api = getElementApi<TextAreaApi>(el)!;
		api.disable();
		expect(el.classList.contains('disabled')).toBe(true);
		api.enable();
		expect(el.classList.contains('disabled')).toBe(false);
	});
});
