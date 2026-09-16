import { describe, expect, it } from 'vitest';
import { createRadioBoxElement } from '../radio-box-api';
import type { RadioBoxApi } from '../radio-box-api';
import { elementDataOf } from '../../../../utils/element-data';

describe('createRadioBoxElement', () => {
	it('creates radio-box with proxy', () => {
		const el = createRadioBoxElement({ name: 'grp', value: 'a' }) as unknown as RadioBoxApi;
		document.body.appendChild(el);
		expect(el.classList.contains('radio-box')).toBe(true);
		expect(el.getAttribute('name')).toBe('grp');
		expect(el.dataValue).toBe('a');
		expect(elementDataOf<{ proxy?: { read(): unknown } }>(el).proxy).toBeTruthy();
		expect(typeof el.read).toBe('function');
		el.remove();
	});

	it('shares proxy across same group', () => {
		const a = createRadioBoxElement({ name: 'g2', value: 'a' }) as unknown as RadioBoxApi;
		const b = createRadioBoxElement({ name: 'g2', value: 'b' }) as unknown as RadioBoxApi;
		document.body.appendChild(a);
		document.body.appendChild(b);
		expect(elementDataOf<{ proxy?: unknown }>(a).proxy).toBe(
			elementDataOf<{ proxy?: unknown }>(b).proxy
		);
		a.remove();
		b.remove();
	});

	it('input selects value and updates proxy', () => {
		const a = createRadioBoxElement({ name: 'g3', value: 'a' }) as unknown as RadioBoxApi;
		const b = createRadioBoxElement({ name: 'g3', value: 'b' }) as unknown as RadioBoxApi;
		document.body.appendChild(a);
		document.body.appendChild(b);
		b.input('b');
		expect(elementDataOf<{ proxy: { read(): unknown } }>(b).proxy.read()).toBe('b');
		expect(a.classList.contains('selected')).toBe(false);
		expect(b.classList.contains('selected')).toBe(true);
		a.remove();
		b.remove();
	});

	it('standard mode adds radio-mark', () => {
		const el = createRadioBoxElement({
			standard: true,
			name: 'g4',
			value: 'x'
		}) as unknown as RadioBoxApi;
		expect(el.querySelector('.radio-mark')).toBeTruthy();
		expect(el.tabIndex).toBe(0);
	});
});
