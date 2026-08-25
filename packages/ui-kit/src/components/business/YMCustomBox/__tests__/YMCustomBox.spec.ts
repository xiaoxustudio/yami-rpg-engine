import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMCustomBox from '../YMCustomBox.vue';
import type { CustomBoxApi } from '../custom-box-api';

const testWindow = window as unknown as { __opened?: unknown };

const makeProps = (overrides: Record<string, unknown> = {}) => ({
	getters: {
		actor: (_el: HTMLElement) => {
			testWindow.__opened = 'actor';
		},
		file: (_el: HTMLElement) => {
			testWindow.__opened = 'file';
		}
	},
	parsers: {
		actor: (value: unknown) => ({ text: (value as { name?: string } | null)?.name ?? 'None' }),
		file: (value: unknown) => ({
			text: (value as string) || 'no file',
			invalid: value === 'bad'
		})
	},
	localize: (key: string) => key,
	...overrides
});

describe('YMCustomBox', () => {
	it('mounts and exposes api', () => {
		const wrapper = mount(YMCustomBox, { props: makeProps() });
		expect(wrapper.element.classList.contains('custom-box')).toBe(true);
		const el = wrapper.element as unknown as CustomBoxApi;
		for (const name of ['read', 'write', 'input', 'enable', 'disable', 'focus', 'on']) {
			expect(typeof el[name as keyof CustomBoxApi], name).toBe('function');
		}
	});

	it('write displays parsed text', () => {
		const wrapper = mount(YMCustomBox, { props: makeProps({ type: 'actor' }) });
		const el = wrapper.element as unknown as CustomBoxApi;
		el.write({ name: 'Hero' });
		expect(el.querySelector('.custom-box-text')!.textContent).toBe('Hero');
		expect(el.read()).toEqual({ name: 'Hero' });
	});

	it('write with invalid marks error class', () => {
		const wrapper = mount(YMCustomBox, { props: makeProps({ type: 'file' }) });
		const el = wrapper.element as unknown as CustomBoxApi;
		el.write('bad');
		expect(el.querySelector('.custom-box-text')!.classList.contains('invalid')).toBe(true);
		el.write('good.png');
		expect(el.querySelector('.custom-box-text')!.classList.contains('invalid')).toBe(false);
	});

	it('click opens getter for type', () => {
		const wrapper = mount(YMCustomBox, { props: makeProps({ type: 'actor' }) });
		const el = wrapper.element as unknown as CustomBoxApi;
		el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(testWindow.__opened).toBe('actor');
		delete testWindow.__opened;
	});

	it('unknown type renders raw value', () => {
		const wrapper = mount(YMCustomBox, { props: makeProps({ type: 'unknown-type' }) });
		const el = wrapper.element as unknown as CustomBoxApi;
		el.write('raw-value');
		expect(el.querySelector('.custom-box-text')!.textContent).toBe('raw-value');
	});

	it('input dispatches change and events', () => {
		const wrapper = mount(YMCustomBox, { props: makeProps({ type: 'actor' }) });
		const el = wrapper.element as unknown as CustomBoxApi;
		let changed = 0;
		el.addEventListener('change', () => changed++);
		el.input({ name: 'New' });
		expect(el.read()).toEqual({ name: 'New' });
		expect(changed).toBe(1);
	});

	it('enable and disable toggle class', () => {
		const wrapper = mount(YMCustomBox, { props: makeProps() });
		const el = wrapper.element as unknown as CustomBoxApi;
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
		const el = wrapper.element as unknown as CustomBoxApi;
		const makeDrag = (type: string): Event => {
			const e = new Event(type, { bubbles: true });
			(e as unknown as Event & { dataTransfer?: { dropEffect: string } }).dataTransfer = {
				dropEffect: ''
			};
			return e;
		};
		el.dispatchEvent(makeDrag('dragover'));
		expect(el.classList.contains('dragover')).toBe(true);
		el.dispatchEvent(makeDrag('drop'));
		expect(el.read()).toBe('g1');
		expect(el.querySelector('.custom-box-text')!.textContent).toBe('g1');
	});
});

describe('无数据时显示 None（null/undefined/空串）', () => {
	const parserProps = {
		parsers: {
			file: (value: unknown) => ({
				// oxlint-disable-next-line no-base-to-string
				text: value == null || value === '' ? 'None' : String(value)
			}),
			actor: (value: unknown) => ({
				// oxlint-disable-next-line no-base-to-string
				text: value == null || value === '' ? 'None' : String(value)
			})
		}
	};

	it('write 空串显示 None', async () => {
		const wrapper = mount(YMCustomBox, {
			props: { ...parserProps, type: 'file', modelValue: '' },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const info = wrapper.element.querySelector('.custom-box-text') as HTMLElement;
		expect(info.textContent).toBe('None');
		wrapper.unmount();
	});

	it('write null/undefined 显示 None', async () => {
		const wrapper = mount(YMCustomBox, {
			props: { ...parserProps, type: 'actor' },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as unknown as { write(v: unknown): void };
		el.write(null);
		await wrapper.vm.$nextTick();
		const info = wrapper.element.querySelector('.custom-box-text') as HTMLElement;
		expect(info.textContent).toBe('None');
		el.write(undefined);
		await wrapper.vm.$nextTick();
		expect(info.textContent).toBe('None');
		wrapper.unmount();
	});

	it('有值时正常显示', async () => {
		const wrapper = mount(YMCustomBox, {
			props: { ...parserProps, type: 'file', modelValue: 'guid-1' },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const info = wrapper.element.querySelector('.custom-box-text') as HTMLElement;
		expect(info.textContent).toBe('guid-1');
		wrapper.unmount();
	});
});
