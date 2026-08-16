import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetBooleanWindow from '@app/components/commands/SetBoolean.vue';
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
	filter: string;
}

const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

describe('useSetBooleanCommandSchema (setBoolean operand linkage + insert/edit/save paths)', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = (variable: { key: string }) => variable.key === '';
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	const mountWindow = async () => {
		const wrapper = mount(SetBooleanWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		return wrapper;
	};

	it('insert path: CommandSchema.insert opens setBoolean window and loads default form', async () => {
		const wrapper = await mountWindow();
		const target = {
			scrollAndResize: vi.fn(),
			getSelectionPosition: () => ({ x: 100, y: 100 }),
			save: vi.fn()
		};
		CommandSchema.insert(target, 'setBoolean');
		expect(Window.open).toHaveBeenCalledWith('setBoolean');
		expect(getControl('setBoolean-variable').read()).toEqual({ type: 'local', key: '' });
		expect(getControl('setBoolean-operation').read()).toBe('set');
		expect(getControl('setBoolean-operand-type').read()).toBe('constant');
		expect(getControl('setBoolean-constant-value').read()).toBe(false);
		wrapper.unmount();
	});

	it('writeHandler switches common-variable filter by operand type', async () => {
		const wrapper = await mountWindow();
		Command.cases.setBoolean.writeHandler!({ value: 'variable' });
		expect(getControl('setBoolean-common-variable').filter).toBe('boolean');
		Command.cases.setBoolean.writeHandler!({ value: 'list' });
		expect(getControl('setBoolean-common-variable').filter).toBe('object');
		Command.cases.setBoolean.writeHandler!({ value: 'constant' });
		expect(getControl('setBoolean-common-variable').filter).toBe('all');
		wrapper.unmount();
	});

	it('edit path: CommandSchema.edit maps params to form, variable/list/parameter/script branches save', async () => {
		const wrapper = await mountWindow();
		const target = {
			scrollAndResize: vi.fn(),
			getSelectionPosition: () => ({ x: 100, y: 100 }),
			save: vi.fn()
		};
		const saved = vi.fn();
		Command.save = saved;
		CommandSchema.edit(target, {
			id: 'setBoolean',
			params: {
				variable: { type: 'local', key: 'flag' },
				operation: 'and',
				operand: { type: 'variable', variable: { type: 'local', key: 'other' } }
			}
		});
		expect(Window.open).toHaveBeenCalledWith('setBoolean');
		expect(getControl('setBoolean-common-variable').read()).toEqual({
			type: 'local',
			key: 'other'
		});
		Command.cases.setBoolean.save!();
		expect(saved).toHaveBeenCalledWith({
			variable: { type: 'local', key: 'flag' },
			operation: 'and',
			operand: { type: 'variable', variable: { type: 'local', key: 'other' } }
		});
		Command.cases.setBoolean.customLoad!({
			variable: { type: 'local', key: 'flag' },
			operation: 'set',
			operand: { type: 'list', variable: { type: 'local', key: 'items' }, index: 2 }
		});
		await wrapper.vm.$nextTick();
		Command.cases.setBoolean.save!();
		expect(saved).toHaveBeenLastCalledWith({
			variable: { type: 'local', key: 'flag' },
			operation: 'set',
			operand: { type: 'list', variable: { type: 'local', key: 'items' }, index: 2 }
		});
		Command.cases.setBoolean.customLoad!({
			variable: { type: 'local', key: 'flag' },
			operation: 'set',
			operand: { type: 'parameter', key: 'mode' }
		});
		await wrapper.vm.$nextTick();
		Command.cases.setBoolean.save!();
		expect(saved).toHaveBeenLastCalledWith({
			variable: { type: 'local', key: 'flag' },
			operation: 'set',
			operand: { type: 'parameter', key: 'mode' }
		});
		Command.cases.setBoolean.customLoad!({
			variable: { type: 'local', key: 'flag' },
			operation: 'set',
			operand: { type: 'script', script: 'isReady()' }
		});
		await wrapper.vm.$nextTick();
		Command.cases.setBoolean.save!();
		expect(saved).toHaveBeenLastCalledWith({
			variable: { type: 'local', key: 'flag' },
			operation: 'set',
			operand: { type: 'script', script: 'isReady()' }
		});
		wrapper.unmount();
	});

	it('save validation: empty variable or unselected operand do not save', async () => {
		const wrapper = await mountWindow();
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setBoolean.customLoad!({
			variable: { type: 'local', key: '' },
			operation: 'set',
			operand: { type: 'constant', value: false }
		});
		await wrapper.vm.$nextTick();
		Command.cases.setBoolean.save!();
		expect(saved).not.toHaveBeenCalled();
		Command.cases.setBoolean.customLoad!({
			variable: { type: 'local', key: 'flag' },
			operation: 'set',
			operand: { type: 'variable', variable: { type: 'local', key: '' } }
		});
		await wrapper.vm.$nextTick();
		Command.cases.setBoolean.save!();
		expect(saved).not.toHaveBeenCalled();
		Command.cases.setBoolean.customLoad!({
			variable: { type: 'local', key: 'flag' },
			operation: 'set',
			operand: { type: 'script', script: '  ' }
		});
		await wrapper.vm.$nextTick();
		Command.cases.setBoolean.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
