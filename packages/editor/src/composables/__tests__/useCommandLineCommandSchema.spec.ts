import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import CommandLine from '@app/components/commands/CommandLine.vue';
import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
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

describe('useCommandLineCommandSchema（commandLine 命令表单 composable：insert/edit/save/校验路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = vi.fn((variable: unknown) => {
			return !variable || (variable as { key?: string })?.key === '';
		}) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 type 选项', async () => {
		const wrapper = mount(CommandLine, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const type = document.getElementById('commandLine-type') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		expect(type.dataItems).toHaveLength(4);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(CommandLine, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'commandLine');
		expect(Window.open).toHaveBeenCalledWith('commandLine');
		expect(getControl('commandLine-type').read()).toBe('get');
		expect(getControl('commandLine-key').read()).toBe('');
		expect(getControl('commandLine-value').read()).toBe('');
		expect(getControl('commandLine-variable').read()).toEqual({ type: 'local', key: '' });
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(CommandLine, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'commandLine',
			params: {
				type: 'set',
				key: 'foo',
				value: 'bar',
				variable: { type: 'local', key: 'v' }
			}
		});
		expect(Window.open).toHaveBeenCalledWith('commandLine');
		expect(getControl('commandLine-type').read()).toBe('set');
		expect(getControl('commandLine-key').read()).toBe('foo');
		expect(getControl('commandLine-value').read()).toBe('bar');
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.commandLine.save 保存', async () => {
		const wrapper = mount(CommandLine, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.commandLine.customLoad!({
			type: 'get',
			key: '',
			value: '',
			variable: { type: 'local', key: 'v' }
		});
		getControl('commandLine-type').input('set');
		getControl('commandLine-key').write('foo');
		getControl('commandLine-value').write('bar');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.commandLine.save!();
		expect(saved).toHaveBeenCalledWith({
			type: 'set',
			key: 'foo',
			value: 'bar',
			variable: { type: 'local', key: 'v' }
		});
		wrapper.unmount();
	});

	it('save 路径：空 key 校验失败不保存', async () => {
		const wrapper = mount(CommandLine, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.commandLine.customLoad!({
			type: 'get',
			key: '',
			value: '',
			variable: { type: 'local', key: 'v' }
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.commandLine.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：variable 无效校验失败不保存', async () => {
		const wrapper = mount(CommandLine, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.commandLine.customLoad!({
			type: 'get',
			key: 'foo',
			value: '',
			variable: { type: 'local', key: '' }
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.commandLine.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
