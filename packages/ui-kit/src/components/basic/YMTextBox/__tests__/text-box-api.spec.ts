import { describe, expect, it } from 'vitest';
import { createTextBoxElement } from '../text-box-api';
import type { TextBoxApi } from '../text-box-api';
import { getElementApi } from '../../../../utils/element-apis';

describe('createTextBoxElement', () => {
	it('creates a text-box element with api attached', () => {
		const el = createTextBoxElement() as unknown as TextBoxApi;
		const api = getElementApi<TextBoxApi>(el)!;
		expect(el.classList.contains('text-box')).toBe(true);
		expect(el.input).toBeTruthy();
		// 契约锁：能力在旁表里，元素上不再挂方法
		expect(typeof (el as unknown as Record<string, unknown>).read).toBe('undefined');
		expect(typeof api.read).toBe('function');
		expect(typeof api.write).toBe('function');
		expect(typeof api.insert).toBe('function');
		expect(typeof api.enable).toBe('function');
		expect(typeof api.disable).toBe('function');
		expect(typeof api.on).toBe('function');
	});

	it('write/read roundtrip', () => {
		const el = createTextBoxElement() as unknown as TextBoxApi;
		const api = getElementApi<TextBoxApi>(el)!;
		api.write('Hello');
		expect(api.read()).toBe('Hello');
		expect(el.input!.value).toBe('Hello');
	});
});
