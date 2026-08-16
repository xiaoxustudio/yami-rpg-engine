import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import DownloadFile from '@app/components/commands/DownloadFile.vue';
import { Command } from '@/command/command-object.ts';
import { CommandSchema } from '@/module/command/schema.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { Window } from '@/tools/window-object.ts';

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

describe('useDownloadFileCommandSchema（downloadFile 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = vi.fn((variable: unknown) => {
			return !variable || variable === '';
		}) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(DownloadFile, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'downloadFile');
		expect(Window.open).toHaveBeenCalledWith('downloadFile');
		expect(getControl('downloadFile-url').read()).toBe('');
		expect(getControl('downloadFile-method').read()).toBe('GET');
		expect(getControl('downloadFile-isBackground').read()).toBe(false);
		expect(getControl('downloadFile-isBackground-path').read()).toBe('');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(DownloadFile, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'downloadFile',
			params: {
				url: { type: 'local', key: 'url' },
				method: 'POST',
				callback: 'cb1',
				isBackground: true,
				isBackgroundPath: 'C:/temp'
			}
		});
		expect(Window.open).toHaveBeenCalledWith('downloadFile');
		expect(getControl('downloadFile-url').read()).toEqual({ type: 'local', key: 'url' });
		expect(getControl('downloadFile-method').read()).toBe('POST');
		expect(getControl('downloadFile-callback').read()).toBe('cb1');
		expect(getControl('downloadFile-isBackground').read()).toBe(true);
		expect(getControl('downloadFile-isBackground-path').read()).toBe('C:/temp');
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.downloadFile.save 保存', async () => {
		const wrapper = mount(DownloadFile, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.downloadFile.customLoad!({
			url: 'http://example.com',
			method: 'GET'
		});
		getControl('downloadFile-method').input('DELETE');
		getControl('downloadFile-callback').input('cb2');
		getControl('downloadFile-rateCallback').input('rc2');
		getControl('downloadFile-isBackground').input(true);
		getControl('downloadFile-isBackground-path').write('C:/out');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.downloadFile.save!();
		expect(saved).toHaveBeenCalledWith({
			url: 'http://example.com',
			method: 'DELETE',
			headers: [],
			data: [],
			callback: 'cb2',
			rateCallback: 'rc2',
			isBackground: true,
			isBackgroundPath: 'C:/out'
		});
		wrapper.unmount();
	});

	it('save 路径：url 为 none 校验失败不保存', async () => {
		const wrapper = mount(DownloadFile, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.downloadFile.customLoad!({
			url: ''
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.downloadFile.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
