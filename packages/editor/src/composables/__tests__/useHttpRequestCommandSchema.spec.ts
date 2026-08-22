import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import HttpRequest from '@app/components/commands/HttpRequest.vue';
import { useHttpRequestCommandSchema } from '@app/composables/commands/useHttpRequestCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface ControlEl extends HTMLElement {
	read(): unknown;
	write(value: unknown): void;
	input(value: unknown): void;
}

const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

const target = {
	scrollAndResize: vi.fn(),
	getSelectionPosition: () => ({ x: 100, y: 100 }),
	save: vi.fn()
};

describe('useHttpRequestCommandSchema（httpRequest 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = (v: unknown) => v === null || v === undefined || v === '';
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(HttpRequest, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useHttpRequestCommandSchema();
		CommandSchema.insert(target, 'httpRequest');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('httpRequest');
		expect(form.url).toBe('');
		expect(form.method).toBe('GET');
		expect(form.responseType).toBe('json');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(HttpRequest, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useHttpRequestCommandSchema();
		CommandSchema.edit(target, {
			id: 'httpRequest',
			params: { url: 'https://x', method: 'POST', headers: [{ key: 'k', value: 'v' }] }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('httpRequest');
		expect(form.url).toBe('https://x');
		expect(form.method).toBe('POST');
		wrapper.unmount();
	});

	it('save 校验：url 为空不保存', async () => {
		const wrapper = mount(HttpRequest, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.httpRequest.customLoad!({
			url: '',
			method: 'GET',
			headers: [],
			data: [],
			callback: '',
			timeout: '',
			responseType: 'json',
			withCredentials: false,
			authUser: '',
			authPass: ''
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.httpRequest.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：url 非空且 timeout 转数字保存', async () => {
		const wrapper = mount(HttpRequest, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.httpRequest.customLoad!({
			url: 'https://x',
			method: 'GET',
			headers: [{ key: 'k', value: 'v' }],
			data: [],
			callback: '',
			timeout: '5000',
			responseType: 'json',
			withCredentials: true,
			authUser: '',
			authPass: ''
		});
		getControl('httpRequest-url').write('https://x');
		getControl('httpRequest-timeout').write(8000);
		(getControl('httpRequest-timeout') as { read: () => unknown }).read = () => 8000;
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.httpRequest.save!();
		expect(saved).toHaveBeenCalledWith({
			url: 'https://x',
			method: 'GET',
			headers: [{ key: 'k', value: 'v' }],
			data: [],
			callback: '',
			timeout: 8000,
			responseType: 'json',
			withCredentials: true,
			authUser: '',
			authPass: ''
		});
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 URL 文本', () => {
		const contents = Command.cases.httpRequest.parse!({
			url: 'https://x',
			method: 'GET',
			headers: [],
			data: [],
			callback: '',
			timeout: '',
			responseType: 'json',
			withCredentials: false,
			authUser: '',
			authPass: ''
		});
		expect(contents[0]).toHaveProperty('color');
		expect(contents).toContainEqual({ text: 'https://x' });
	});
});
