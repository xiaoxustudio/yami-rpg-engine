import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import RequestURL from '@app/components/commands/RequestURL.vue';
import { Command } from '@/command/command-object.ts';
import { CommandSchema } from '@/module/command/schema.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { Window } from '@/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface ParamListElement extends HTMLElement {
	read(): unknown[] | null;
	write(data: unknown[]): void;
}

interface ControlEl extends HTMLElement {
	read(): unknown;
	write(value: unknown): void;
	input(value: unknown): void;
}

const getList = (id: string): ParamListElement =>
	document.getElementById(id) as unknown as ParamListElement;
const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

const target = {
	scrollAndResize: vi.fn(),
	getSelectionPosition: () => ({ x: 100, y: 100 }),
	save: vi.fn()
};

describe('useRequestURLCommandSchema（requestURL 命令表单 composable：insert/edit/save/校验路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = vi.fn((variable: unknown) => {
			return !variable || (variable as { key?: string })?.key === '';
		}) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 method 选项', async () => {
		const wrapper = mount(RequestURL, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const method = document.getElementById('requestURL-method') as unknown as {
			dataItems?: Array<{ value: string }>;
		};
		expect(method.dataItems).toHaveLength(4);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(RequestURL, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'requestURL');
		expect(Window.open).toHaveBeenCalledWith('requestURL');
		expect(getControl('requestURL-url').read()).toBe('');
		expect(getControl('requestURL-method').read()).toBe('GET');
		expect(getControl('requestURL-callback').read()).toBe('');
		expect(getList('requestURL-header').read()).toEqual([]);
		expect(getList('requestURL-data').read()).toEqual([]);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(RequestURL, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'requestURL',
			params: {
				url: 'https://example.com',
				method: 'POST',
				headers: [{ key: 'a', value: 'b' }],
				data: [{ key: 'c', value: 'd' }],
				callback: 'onDone'
			}
		});
		expect(Window.open).toHaveBeenCalledWith('requestURL');
		expect(getControl('requestURL-url').read()).toBe('https://example.com');
		expect(getControl('requestURL-method').read()).toBe('POST');
		expect(getList('requestURL-header').read()).toEqual([{ key: 'a', value: 'b' }]);
		expect(getList('requestURL-data').read()).toEqual([{ key: 'c', value: 'd' }]);
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.requestURL.save 保存', async () => {
		const wrapper = mount(RequestURL, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.requestURL.customLoad!({
			url: '',
			method: 'GET',
			headers: [],
			data: [],
			callback: ''
		});
		getControl('requestURL-url').write('https://example.com');
		getControl('requestURL-method').input('PUT');
		getList('requestURL-header').write([{ key: 'k', value: 'v' }]);
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.requestURL.save!();
		expect(saved).toHaveBeenCalledWith({
			url: 'https://example.com',
			method: 'PUT',
			headers: [{ key: 'k', value: 'v' }],
			data: [],
			callback: ''
		});
		wrapper.unmount();
	});

	it('save 路径：空 url 校验失败不保存', async () => {
		const wrapper = mount(RequestURL, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.requestURL.customLoad!({
			url: '',
			method: 'GET',
			headers: [],
			data: [],
			callback: ''
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.requestURL.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
