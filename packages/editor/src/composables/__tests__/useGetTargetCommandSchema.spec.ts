import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import GetTarget from '@app/components/commands/GetTarget.vue';
import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from '@app/legacy/module/command/schema.ts';
import { Attribute } from '@app/legacy/attribute/attribute-window.ts';
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

describe('useGetTargetCommandSchema（getTarget 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Attribute.getDefAttributeId = vi.fn(() => 'atk') as never;
		Attribute.getAttributeItems = vi.fn(() => [
			{ name: 'Attack', value: 'atk' },
			{ name: 'Defense', value: 'def' }
		]) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 selector/condition 选项', async () => {
		const wrapper = mount(GetTarget, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const selector = document.getElementById('getTarget-selector') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		const condition = document.getElementById('getTarget-condition') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		expect(selector.dataItems).toHaveLength(6);
		expect(condition.dataItems).toHaveLength(8);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(GetTarget, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'getTarget');
		expect(Window.open).toHaveBeenCalledWith('getTarget');
		expect(getControl('getTarget-actor').read()).toEqual({ type: 'trigger' });
		expect(getControl('getTarget-selector').read()).toBe('enemy');
		expect(getControl('getTarget-condition').read()).toBe('max-threat');
		expect(getControl('getTarget-attribute').read()).toBe('atk');
		expect(getControl('getTarget-divisor').read()).toBe('atk');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(GetTarget, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'getTarget',
			params: {
				actor: { type: 'player' },
				selector: 'team',
				condition: 'max-attribute-ratio',
				attribute: 'atk',
				divisor: 'def'
			}
		});
		expect(Window.open).toHaveBeenCalledWith('getTarget');
		expect(getControl('getTarget-selector').read()).toBe('team');
		expect(getControl('getTarget-condition').read()).toBe('max-attribute-ratio');
		expect(getControl('getTarget-attribute').read()).toBe('atk');
		expect(getControl('getTarget-divisor').read()).toBe('def');
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.getTarget.save 保存', async () => {
		const wrapper = mount(GetTarget, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.getTarget.customLoad!({
			actor: { type: 'trigger' },
			selector: 'enemy',
			condition: 'max-threat'
		});
		getControl('getTarget-selector').input('friend');
		getControl('getTarget-condition').input('min-attribute-value');
		getControl('getTarget-attribute').input('def');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.getTarget.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			selector: 'friend',
			condition: 'min-attribute-value',
			attribute: 'def'
		});
		wrapper.unmount();
	});

	it('save 路径：attribute 为空校验失败不保存', async () => {
		const wrapper = mount(GetTarget, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.getTarget.customLoad!({
			actor: { type: 'trigger' },
			selector: 'enemy',
			condition: 'max-attribute-value',
			attribute: ''
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.getTarget.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
