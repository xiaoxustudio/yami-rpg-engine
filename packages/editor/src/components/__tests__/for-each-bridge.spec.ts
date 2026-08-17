import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ForEach from '@app/components/commands/ForEach.vue';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import '@app/legacy/module/command/forEach.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface ForEachFrame extends HTMLElement {
	setForm(data: Record<string, unknown>): void;
	getForm(): Record<string, unknown>;
}

const getFrame = (): ForEachFrame => document.getElementById('forEach') as unknown as ForEachFrame;

describe('forEach 窗口表单桥接（Vue 双向绑定迁移回归）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = (variable: { key: string }) => variable.key === '';
	});

	it('窗口根元素暴露 setForm/getForm 桥接，setForm 写入控件 DOM', async () => {
		const wrapper = mount(ForEach, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const frame = getFrame();
		expect(typeof frame.setForm).toBe('function');
		expect(typeof frame.getForm).toBe('function');
		frame.setForm({
			data: 'attribute',
			attributeGroupId: 'g1',
			variable: { type: 'local', key: 'key' },
			saveIndex: { type: 'local', key: 'idx' },
			touchId: { type: 'local', key: 't' }
		});
		await wrapper.vm.$nextTick();
		const form = frame.getForm();
		expect(form.data).toBe('attribute');
		expect(form.attributeGroupId).toBe('g1');
		expect(form.variable).toEqual({ type: 'local', key: 'key' });
		expect(form.saveIndex).toEqual({ type: 'local', key: 'idx' });
		expect(form.touchId).toEqual({ type: 'local', key: 't' });
		const variable = document.getElementById('forEach-variable') as unknown as HTMLElement & {
			read(): unknown;
		};
		expect(variable.read()).toEqual({ type: 'local', key: 'key' });
		wrapper.unmount();
	});

	it('控件值变更在 getForm 时读回（SelectBox/CustomBox）', async () => {
		const wrapper = mount(ForEach, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const frame = getFrame();
		const data = document.getElementById('forEach-data') as unknown as HTMLElement & {
			input(value: unknown): void;
		};
		data.input('member');
		const variable = document.getElementById('forEach-variable') as unknown as HTMLElement & {
			input(value: unknown): void;
		};
		variable.input({ type: 'local', key: 'm' });
		const list = document.getElementById('forEach-list') as unknown as HTMLElement & {
			input(value: unknown): void;
		};
		list.input({ type: 'local', key: 'items' });
		await wrapper.vm.$nextTick();
		const form = frame.getForm();
		expect(form.data).toBe('member');
		expect(form.variable).toEqual({ type: 'local', key: 'm' });
		expect(form.list).toEqual({ type: 'local', key: 'items' });
		wrapper.unmount();
	});

	it('customLoad 经 setForm 填充表单，customSave 经 getForm 保存（list 分支带 commands）', async () => {
		const wrapper = mount(ForEach, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.forEach.customLoad!({
			data: 'list',
			list: { type: 'local', key: 'items' },
			variable: { type: 'local', key: 'item' },
			commands: [{ id: 'comment' }]
		});
		await wrapper.vm.$nextTick();
		const form = getFrame().getForm();
		expect(form.data).toBe('list');
		expect(form.list).toEqual({ type: 'local', key: 'items' });
		expect(form.variable).toEqual({ type: 'local', key: 'item' });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.forEach.customSave!();
		expect(saved).toHaveBeenCalledWith({
			data: 'list',
			list: { type: 'local', key: 'items' },
			variable: { type: 'local', key: 'item' },
			commands: [{ id: 'comment' }]
		});
		wrapper.unmount();
	});

	it('customLoad 各 data 分支映射（attribute/enum/save/touch）', async () => {
		const wrapper = mount(ForEach, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.forEach.customLoad!({
			data: 'attribute',
			groupId: 'g1',
			variable: { type: 'local', key: 'k' }
		});
		await wrapper.vm.$nextTick();
		expect(getFrame().getForm().attributeGroupId).toBe('g1');
		Command.cases.forEach.customLoad!({
			data: 'enum',
			groupId: 'g2',
			variable: { type: 'local', key: 'k' }
		});
		await wrapper.vm.$nextTick();
		expect(getFrame().getForm().enumGroupId).toBe('g2');
		Command.cases.forEach.customLoad!({
			data: 'save',
			saveIndex: { type: 'local', key: 's' }
		});
		await wrapper.vm.$nextTick();
		expect(getFrame().getForm().saveIndex).toEqual({ type: 'local', key: 's' });
		Command.cases.forEach.customLoad!({
			data: 'changed-touch',
			touchId: { type: 'local', key: 't' }
		});
		await wrapper.vm.$nextTick();
		expect(getFrame().getForm().touchId).toEqual({ type: 'local', key: 't' });
		wrapper.unmount();
	});

	it('customSave 校验失败时聚焦对应控件且不保存', async () => {
		const wrapper = mount(ForEach, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.forEach.customLoad!({
			data: 'member',
			variable: { type: 'local', key: '' }
		});
		await wrapper.vm.$nextTick();
		Command.cases.forEach.customSave!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
