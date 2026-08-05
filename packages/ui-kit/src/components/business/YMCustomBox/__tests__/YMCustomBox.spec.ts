import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMCustomBox from '../YMCustomBox.vue';

const makeProps = (overrides: any = {}) => ({
	getters: {
		actor: (el: any) => {
			(window as any).__opened = 'actor';
		},
		file: (el: any) => {
			(window as any).__opened = 'file';
		}
	},
	parsers: {
		actor: (value: any) => ({ text: value?.name ?? 'None' }),
		file: (value: string) => ({ text: value || 'no file', invalid: value === 'bad' })
	},
	localize: (key: string) => key,
	...overrides
});

describe('YMCustomBox', () => {
	it('mounts and exposes api', () => {
		const wrapper = mount(YMCustomBox, { props: makeProps() });
		expect(wrapper.element.classList.contains('custom-box')).toBe(true);
		const el = wrapper.element as any;
		for (const name of ['read', 'write', 'input', 'enable', 'disable', 'focus', 'on']) {
			expect(typeof el[name], name).toBe('function');
		}
	});

	it('write displays parsed text', () => {
		const wrapper = mount(YMCustomBox, { props: makeProps({ type: 'actor' }) });
		const el = wrapper.element as any;
		el.write({ name: 'Hero' });
		expect(el.querySelector('.custom-box-text').textContent).toBe('Hero');
		expect(el.read()).toEqual({ name: 'Hero' });
	});

	it('write with invalid marks error class', () => {
		const wrapper = mount(YMCustomBox, { props: makeProps({ type: 'file' }) });
		const el = wrapper.element as any;
		el.write('bad');
		expect(el.querySelector('.custom-box-text').classList.contains('invalid')).toBe(true);
		el.write('good.png');
		expect(el.querySelector('.custom-box-text').classList.contains('invalid')).toBe(false);
	});

	it('click opens getter for type', () => {
		const wrapper = mount(YMCustomBox, { props: makeProps({ type: 'actor' }) });
		const el = wrapper.element as any;
		el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect((window as any).__opened).toBe('actor');
		delete (window as any).__opened;
	});

	it('unknown type renders raw value', () => {
		const wrapper = mount(YMCustomBox, { props: makeProps({ type: 'unknown-type' }) });
		const el = wrapper.element as any;
		el.write('raw-value');
		expect(el.querySelector('.custom-box-text').textContent).toBe('raw-value');
	});

	it('input dispatches change and events', () => {
		const wrapper = mount(YMCustomBox, { props: makeProps({ type: 'actor' }) });
		const el = wrapper.element as any;
		let changed = 0;
		el.addEventListener('change', () => changed++);
		el.input({ name: 'New' });
		expect(el.read()).toEqual({ name: 'New' });
		expect(changed).toBe(1);
	});

	it('enable and disable toggle class', () => {
		const wrapper = mount(YMCustomBox, { props: makeProps() });
		const el = wrapper.element as any;
		el.disable();
		expect(el.classList.contains('disabled')).toBe(true);
		el.enable();
		expect(el.classList.contains('disabled')).toBe(false);
	});

	it('drop accepts browser active file', () => {
		const wrapper = mount(YMCustomBox, {
			props: makeProps({
				type: 'file',
				browser: () => ({
					dragging: true,
					body: { activeFile: { type: 'image', meta: { guid: 'g1' } } }
				})
			})
		});
		const el = wrapper.element as any;
		const makeDrag = (type: string): Event => {
			const e = new Event(type, { bubbles: true });
			(e as any).dataTransfer = { dropEffect: '' };
			return e;
		};
		el.dispatchEvent(makeDrag('dragover'));
		expect(el.classList.contains('dragover')).toBe(true);
		el.dispatchEvent(makeDrag('drop'));
		expect(el.read()).toBe('g1');
		expect(el.querySelector('.custom-box-text').textContent).toBe('g1');
	});
});
