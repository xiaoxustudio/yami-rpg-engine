import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import UploadFile from '@app/components/commands/UploadFile.vue';
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

describe('useUploadFileCommandSchema（uploadFile 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = vi.fn((variable: unknown) => {
			return !variable || variable === '';
		}) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(UploadFile, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'uploadFile');
		expect(Window.open).toHaveBeenCalledWith('uploadFile');
		expect(getControl('uploadFile-url').read()).toBe('');
		expect(getControl('uploadFile-method').read()).toBe('POST');
		expect(getControl('uploadFile-path').read()).toBe('');
		expect(getControl('uploadFile-field').read()).toBe('file');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(UploadFile, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'uploadFile',
			params: {
				url: 'http://example.com/up',
				method: 'PUT',
				path: { type: 'local', key: 'path' },
				field: 'f1',
				callback: 'cb1'
			}
		});
		expect(Window.open).toHaveBeenCalledWith('uploadFile');
		expect(getControl('uploadFile-url').read()).toBe('http://example.com/up');
		expect(getControl('uploadFile-method').read()).toBe('PUT');
		expect(getControl('uploadFile-path').read()).toEqual({ type: 'local', key: 'path' });
		expect(getControl('uploadFile-field').read()).toBe('f1');
		expect(getControl('uploadFile-callback').read()).toBe('cb1');
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.uploadFile.save 保存', async () => {
		const wrapper = mount(UploadFile, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.uploadFile.customLoad!({
			url: 'http://example.com/up',
			method: 'POST',
			path: 'C:/file'
		});
		getControl('uploadFile-method').input('PUT');
		getControl('uploadFile-field').write('f2');
		getControl('uploadFile-callback').input('cb2');
		getControl('uploadFile-rateCallback').input('rc2');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.uploadFile.save!();
		expect(saved).toHaveBeenCalledWith({
			url: 'http://example.com/up',
			method: 'PUT',
			path: 'C:/file',
			field: 'f2',
			headers: [],
			callback: 'cb2',
			rateCallback: 'rc2'
		});
		wrapper.unmount();
	});

	it('save 路径：url 为 none 校验失败不保存', async () => {
		const wrapper = mount(UploadFile, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.uploadFile.customLoad!({
			url: ''
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.uploadFile.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
