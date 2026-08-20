import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ShowText from '@app/components/commands/ShowText.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Window } from '@app/legacy/tools/window-object.ts';

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

describe('useShowTextCommandSchema（showText 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口后 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(ShowText, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'showText');
		expect(Window.open).toHaveBeenCalledWith('showText');
		expect(getControl('showText-target').read()).toEqual({ type: 'trigger' });
		expect(getControl('showText-parameters').read()).toBe('');
		expect(getControl('showText-content').read()).toBe('');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(ShowText, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'showText',
			params: { target: { type: 'trigger' }, parameters: 'a,b', content: 'hello\nworld' }
		});
		expect(Window.open).toHaveBeenCalledWith('showText');
		expect(getControl('showText-parameters').read()).toBe('a,b');
		expect(getControl('showText-content').read()).toBe('hello\nworld');
		wrapper.unmount();
	});

	it('save 路径：content 为空时校验失败不保存', async () => {
		const wrapper = mount(ShowText, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.showText.customLoad!({ content: '' });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.showText.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：用户输入后经 Command.cases.showText.save 保存', async () => {
		const wrapper = mount(ShowText, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.showText.customLoad!({ content: '' });
		getControl('showText-content').write('hello');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.showText.save!();
		expect(saved).toHaveBeenCalledWith({
			target: { type: 'trigger' },
			parameters: '',
			content: 'hello'
		});
		wrapper.unmount();
	});
});
