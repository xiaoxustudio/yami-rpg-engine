import { describe, expect, it } from 'vitest';
import { createCheckBoxElement } from '../check-box-api';
import type { CheckBoxApi } from '../check-box-api';
import { getElementApi } from '../../../../utils/element-apis';

describe('createCheckBoxElement', () => {
	it('creates check-box with api in side table', () => {
		const el = createCheckBoxElement() as unknown as CheckBoxApi;
		const api = getElementApi<CheckBoxApi>(el)!;
		expect(el.classList.contains('check-box')).toBe(true);
		// 契约锁：能力从元素移到旁表后，元素上不应再有这些方法
		expect(typeof (el as unknown as Record<string, unknown>).read).toBe('undefined');
		expect(typeof (el as unknown as Record<string, unknown>).write).toBe('undefined');
		expect(typeof api.read).toBe('function');
		expect(typeof api.write).toBe('function');
		expect(typeof api.input).toBe('function');
		expect(typeof api.enable).toBe('function');
		expect(typeof api.disable).toBe('function');
		expect(typeof api.relate).toBe('function');
		expect(typeof api.on).toBe('function');
	});

	it('write/read roundtrip with selected class', () => {
		const el = createCheckBoxElement() as unknown as CheckBoxApi;
		const api = getElementApi<CheckBoxApi>(el)!;
		api.write(true);
		expect(api.read()).toBe(true);
		expect(el.classList.contains('selected')).toBe(true);
		api.write(false);
		expect(api.read()).toBe(false);
		expect(el.classList.contains('selected')).toBe(false);
	});

	it('pointerdown toggles value', () => {
		const el = createCheckBoxElement() as unknown as CheckBoxApi;
		const api = getElementApi<CheckBoxApi>(el)!;
		el.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
		expect(api.read()).toBe(true);
		el.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
		expect(api.read()).toBe(false);
	});

	it('standard mode adds check-mark span', () => {
		const el = createCheckBoxElement({ standard: true }) as unknown as CheckBoxApi;
		expect(el.querySelector('.check-mark')).toBeTruthy();
		expect(el.tabIndex).toBe(0);
	});

	it('relate toggles related elements', () => {
		const el = createCheckBoxElement() as unknown as CheckBoxApi;
		const api = getElementApi<CheckBoxApi>(el)!;
		const target = document.createElement('div');
		api.relate([target]);
		api.write(true);
		expect(target.classList.contains('disabled')).toBe(false);
		api.write(false);
		expect(target.classList.contains('disabled')).toBe(true);
	});
});
