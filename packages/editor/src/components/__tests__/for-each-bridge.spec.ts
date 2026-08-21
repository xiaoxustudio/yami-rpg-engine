import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ForEach from '@app/components/commands/ForEach.vue';
import { Command } from '@app/commands/command-object.ts';
import { useForEachCommandSchema } from '@app/composables/commands/useForEachCommandSchema';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

describe('forEach 窗口表单桥接（Vue 双向绑定迁移回归）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = (variable: { key: string }) => variable.key === '';
	});

	it('customLoad 经共享 form 填充表单，customSave 经 form 保存（list 分支带 commands）', async () => {
		const wrapper = mount(ForEach, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useForEachCommandSchema();
		Command.cases.forEach.customLoad!({
			data: 'list',
			list: { type: 'local', key: 'items' },
			variable: { type: 'local', key: 'item' },
			commands: [{ id: 'comment' }]
		});
		await wrapper.vm.$nextTick();
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

	it('customLoad 各 data 分支映射到 form（attribute/enum/save/touch）', async () => {
		const wrapper = mount(ForEach, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useForEachCommandSchema();
		Command.cases.forEach.customLoad!({
			data: 'attribute',
			groupId: 'g1',
			variable: { type: 'local', key: 'k' }
		});
		await wrapper.vm.$nextTick();
		expect(form.attributeGroupId).toBe('g1');
		Command.cases.forEach.customLoad!({
			data: 'enum',
			groupId: 'g2',
			variable: { type: 'local', key: 'k' }
		});
		await wrapper.vm.$nextTick();
		expect(form.enumGroupId).toBe('g2');
		Command.cases.forEach.customLoad!({
			data: 'save',
			saveIndex: { type: 'local', key: 's' }
		});
		await wrapper.vm.$nextTick();
		expect(form.saveIndex).toEqual({ type: 'local', key: 's' });
		Command.cases.forEach.customLoad!({
			data: 'changed-touch',
			touchId: { type: 'local', key: 't' }
		});
		await wrapper.vm.$nextTick();
		expect(form.touchId).toEqual({ type: 'local', key: 't' });
		wrapper.unmount();
	});

	it('控件变更通过 v-model 更新 form', async () => {
		const wrapper = mount(ForEach, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useForEachCommandSchema();
		const data = document.getElementById('forEach-data') as unknown as HTMLElement & {
			input(value: unknown): void;
		};
		data.input('member');
		const variable = document.getElementById('forEach-variable') as unknown as HTMLElement & {
			input(value: unknown): void;
		};
		variable.input({ type: 'local', key: 'm' });
		await wrapper.vm.$nextTick();
		expect(form.data).toBe('member');
		expect(form.variable).toEqual({ type: 'local', key: 'm' });
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
