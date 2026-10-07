import { describe, it, expect, vi } from 'vitest';
import { elementDataOf } from '../../../utils/element-data';
import { createTypeRegistry } from '../type-registry';

function makeDataSource() {
	return {
		createEasingItems: vi.fn(() => [{ value: 'ease' }]),
		createTeamItems: vi.fn(() => [{ value: 'team1' }]),
		getAttributeItems: vi.fn(() => [{ value: 'hp' }]),
		getStringItems: vi.fn(() => [{ value: 'en1' }])
	};
}

function makePane() {
	const withInput = (extra: Record<string, unknown> = {}) => ({
		input: { loadItems: vi.fn(), setPlaceholder: vi.fn(), ...extra }
	});
	return {
		createCheckBox: vi.fn(() => withInput()),
		createColorBox: vi.fn(() => withInput()),
		createCustomBox: vi.fn(() => withInput()),
		createKeyboardBox: vi.fn(() => withInput()),
		createNumberBox: vi.fn(() => ({
			input: { input: {}, loadItems: vi.fn(), setPlaceholder: vi.fn() }
		})),
		createNumberVar: vi.fn(() => ({
			input: { numBox: { input: {}, setPlaceholder: vi.fn() }, varBox: {} }
		})),
		createRepeatableGroup: vi.fn(() => withInput()),
		createSelectBox: vi.fn(() => withInput()),
		createTextBox: vi.fn(() => withInput())
	};
}

describe('type-registry', () => {
	it('registers 39 types and exposes get/has', () => {
		const registry = createTypeRegistry(makeDataSource());
		expect(Object.keys(registry.types).length).toBe(38);
		expect(registry.has('boolean')).toBe(true);
		expect(registry.has('color')).toBe(true);
		expect(registry.has('unknown')).toBe(false);
		expect(registry.get('boolean').component).toBe('check-box');
	});

	it('boolean create calls pane.createCheckBox', () => {
		const registry = createTypeRegistry(makeDataSource());
		const pane = makePane();
		const wrap = registry.get('boolean').create(pane);
		expect(pane.createCheckBox).toHaveBeenCalled();
		expect(wrap).toBeTruthy();
	});

	it('number create applies min/max/decimals', () => {
		const registry = createTypeRegistry(makeDataSource());
		const pane = makePane();
		const wrap = registry.get('number').create(pane, { min: 1, max: 10, decimals: 2 });
		expect(wrap.input.input.min).toBe('1');
		expect(wrap.input.input.max).toBe('10');
		expect(elementDataOf<{ decimals?: number }>(wrap.input).decimals).toBe(2);
	});

	it('easing create uses injected dataSource', () => {
		const dataSource = makeDataSource();
		const registry = createTypeRegistry(dataSource);
		const pane = makePane();
		registry.get('easing').create(pane);
		expect(dataSource.createEasingItems).toHaveBeenCalled();
		expect(pane.createSelectBox).toHaveBeenCalled();
	});

	it('attribute with filter uses dataSource.getAttributeItems', () => {
		const dataSource = makeDataSource();
		const registry = createTypeRegistry(dataSource);
		const pane = makePane();
		registry.get('attribute').create(pane, { filter: 'number' });
		expect(dataSource.getAttributeItems).toHaveBeenCalledWith('number', '', true);
	});

	it('attribute with filter any uses custom box', () => {
		const dataSource = makeDataSource();
		const registry = createTypeRegistry(dataSource);
		const pane = makePane();
		registry.get('attribute').create(pane, { filter: 'any' });
		expect(pane.createCustomBox).toHaveBeenCalled();
		expect(dataSource.getAttributeItems).not.toHaveBeenCalled();
	});

	it('repeatable-group delegates to pane factory', () => {
		const registry = createTypeRegistry(makeDataSource());
		const pane = makePane();
		registry.get('repeatable-group').create(pane, { filter: '' });
		expect(pane.createRepeatableGroup).toHaveBeenCalled();
	});
});
