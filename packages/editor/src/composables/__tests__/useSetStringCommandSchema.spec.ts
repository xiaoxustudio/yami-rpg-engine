import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetString from '@app/components/commands/SetString.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
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

describe('useSetStringCommandSchema（setString 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = vi.fn((variable: unknown) => {
			return !variable || (variable as { key?: string })?.key === '';
		}) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 operand-type 选项', async () => {
		const wrapper = mount(SetString, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const type = document.getElementById('setString-operand-type') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		expect(type.dataItems).toHaveLength(12);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(SetString, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'setString');
		expect(Window.open).toHaveBeenCalledWith('setString');
		expect(getControl('setString-variable').read()).toEqual({ type: 'local', key: '' });
		expect(getControl('setString-operation').read()).toBe('set');
		expect(getControl('setString-operand-type').read()).toBe('constant');
		expect(getControl('setString-operand-common-value').read()).toBe('');
		expect(getControl('setString-operand-common-actor').read()).toEqual({ type: 'trigger' });
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 operand 到控件 DOM', async () => {
		const wrapper = mount(SetString, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'setString',
			params: {
				variable: { type: 'local', key: 'foo' },
				operation: 'add',
				operand: {
					type: 'string',
					method: 'slice',
					variable: { type: 'global', key: 'bar' },
					begin: 1,
					end: 3
				}
			}
		});
		expect(Window.open).toHaveBeenCalledWith('setString');
		expect(getControl('setString-variable').read()).toEqual({ type: 'local', key: 'foo' });
		expect(getControl('setString-operation').read()).toBe('add');
		expect(getControl('setString-operand-type').read()).toBe('string');
		expect(getControl('setString-operand-string-method').read()).toBe('slice');
		expect(getControl('setString-operand-common-variable').read()).toEqual({
			type: 'global',
			key: 'bar'
		});
		expect(getControl('setString-operand-string-slice-begin').read()).toBe(1);
		expect(getControl('setString-operand-string-slice-end').read()).toBe(3);
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.setString.save 保存', async () => {
		const wrapper = mount(SetString, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setString.customLoad!({
			variable: { type: 'local', key: 'foo' },
			operation: 'add',
			operand: {
				type: 'string',
				method: 'slice',
				variable: { type: 'global', key: 'bar' },
				begin: 1,
				end: 3
			}
		});
		getControl('setString-operand-string-method').input('char');
		getControl('setString-operand-string-char-index').write(7);
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setString.save!();
		expect(saved).toHaveBeenCalledWith({
			variable: { type: 'local', key: 'foo' },
			operation: 'add',
			operand: {
				type: 'string',
				method: 'char',
				variable: { type: 'global', key: 'bar' },
				index: 7
			}
		});
		wrapper.unmount();
	});

	it('save 路径：variable 为 none 校验失败不保存', async () => {
		const wrapper = mount(SetString, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setString.customLoad!({
			variable: { type: 'none', key: '' },
			operation: 'set',
			operand: { type: 'constant', value: 'x' }
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setString.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：replace pattern 为空校验失败不保存', async () => {
		const wrapper = mount(SetString, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setString.customLoad!({
			variable: { type: 'local', key: 'foo' },
			operation: 'set',
			operand: {
				type: 'string',
				method: 'replace',
				variable: { type: 'global', key: 'bar' },
				pattern: '',
				replacement: 'cd'
			}
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setString.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
