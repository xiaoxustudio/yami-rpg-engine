import { elementDataOf } from '../../../../utils/element-data';
import { describe, expect, it } from 'vitest';
import { createCustomBoxElement } from '../custom-box-api';
import type { CustomBoxApi } from '../custom-box-api';

describe('createCustomBoxElement', () => {
	it('creates a custom-box element with api attached', () => {
		const el = createCustomBoxElement();
		expect(el.classList.contains('custom-box')).toBe(true);
		expect(typeof el.read).toBe('function');
		expect(typeof el.write).toBe('function');
		expect(typeof el.input).toBe('function');
		expect(typeof el.update).toBe('function');
		expect(typeof el.enable).toBe('function');
		expect(typeof el.disable).toBe('function');
		expect(typeof el.on).toBe('function');
	});

	it('supports type/filter property proxy', () => {
		const el = createCustomBoxElement() as unknown as CustomBoxApi;
		el.type = 'actor';
		el.filter = 'object';
		expect(el.type).toBe('actor');
		expect(el.filter).toBe('object');
		expect(el.getAttribute('type')).toBe('actor');
		expect(el.getAttribute('filter')).toBe('object');
	});

	it('write/read roundtrip', () => {
		const el = createCustomBoxElement() as unknown as CustomBoxApi;
		el.write({ id: 1, name: 'Hero' });
		expect(el.read()).toEqual({ id: 1, name: 'Hero' });
		expect(elementDataOf<{ info: HTMLElement }>(el).info).toBeTruthy();
	});

	it('renders parser text when parser injected', () => {
		const el = createCustomBoxElement({
			type: 'actor',
			parsers: {
				actor: (actor: unknown) => ({ text: 'Actor:' + (actor as { name: string }).name })
			}
		}) as unknown as CustomBoxApi;
		el.write({ id: 1, name: 'Hero' });
		expect(elementDataOf<{ info: HTMLElement }>(el).info.textContent).toBe('Actor:Hero');
	});
});
