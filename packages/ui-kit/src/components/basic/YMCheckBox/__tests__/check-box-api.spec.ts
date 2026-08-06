import { describe, expect, it } from 'vitest';
import { createCheckBoxElement } from '../check-box-api';

describe('createCheckBoxElement', () => {
	it('creates check-box with api', () => {
		const el = createCheckBoxElement() as any;
		expect(el.classList.contains('check-box')).toBe(true);
		expect(typeof el.read).toBe('function');
		expect(typeof el.write).toBe('function');
		expect(typeof el.input).toBe('function');
		expect(typeof el.enable).toBe('function');
		expect(typeof el.disable).toBe('function');
		expect(typeof el.relate).toBe('function');
		expect(typeof el.on).toBe('function');
	});

	it('write/read roundtrip with selected class', () => {
		const el = createCheckBoxElement() as any;
		el.write(true);
		expect(el.read()).toBe(true);
		expect(el.classList.contains('selected')).toBe(true);
		el.write(false);
		expect(el.read()).toBe(false);
		expect(el.classList.contains('selected')).toBe(false);
	});

	it('pointerdown toggles value', () => {
		const el = createCheckBoxElement() as any;
		el.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
		expect(el.read()).toBe(true);
		el.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
		expect(el.read()).toBe(false);
	});

	it('standard mode adds check-mark span', () => {
		const el = createCheckBoxElement({ standard: true }) as any;
		expect(el.querySelector('.check-mark')).toBeTruthy();
		expect(el.tabIndex).toBe(0);
	});

	it('relate toggles related elements', () => {
		const el = createCheckBoxElement() as any;
		const target = document.createElement('div');
		el.relate([target]);
		el.write(true);
		expect(target.classList.contains('disabled')).toBe(false);
		el.write(false);
		expect(target.classList.contains('disabled')).toBe(true);
	});
});
