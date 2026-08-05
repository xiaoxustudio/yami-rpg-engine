import { describe, expect, it } from 'vitest';
import { createCustomBoxElement } from '../custom-box-api';

describe('createCustomBoxElement', () => {
	it('creates a custom-box element with api attached', () => {
		const el = createCustomBoxElement();
		expect(el.classList.contains('custom-box')).toBe(true);
		expect(typeof (el as any).read).toBe('function');
		expect(typeof (el as any).write).toBe('function');
		expect(typeof (el as any).input).toBe('function');
		expect(typeof (el as any).update).toBe('function');
		expect(typeof (el as any).enable).toBe('function');
		expect(typeof (el as any).disable).toBe('function');
		expect(typeof (el as any).on).toBe('function');
	});

	it('supports type/filter property proxy', () => {
		const el = createCustomBoxElement() as any;
		el.type = 'actor';
		el.filter = 'object';
		expect(el.type).toBe('actor');
		expect(el.filter).toBe('object');
		expect(el.getAttribute('type')).toBe('actor');
		expect(el.getAttribute('filter')).toBe('object');
	});

	it('write/read roundtrip', () => {
		const el = createCustomBoxElement() as any;
		el.write({ id: 1, name: 'Hero' });
		expect(el.read()).toEqual({ id: 1, name: 'Hero' });
		expect(el.info).toBeTruthy();
	});

	it('renders parser text when parser injected', () => {
		const el = createCustomBoxElement({
			type: 'actor',
			parsers: { actor: (actor: any) => ({ text: 'Actor:' + actor.name }) }
		}) as any;
		el.write({ id: 1, name: 'Hero' });
		expect(el.info.textContent).toBe('Actor:Hero');
	});
});
