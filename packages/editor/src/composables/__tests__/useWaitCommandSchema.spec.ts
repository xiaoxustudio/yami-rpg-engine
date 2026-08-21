import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import Wait from '@app/components/commands/Wait.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { useWaitCommandSchema } from '@app/composables/commands/useWaitCommandSchema';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

const target = {
	scrollAndResize: vi.fn(),
	getSelectionPosition: () => ({ x: 100, y: 100 }),
	save: vi.fn()
};

describe('useWaitCommandSchema（wait 命令表单 composable：form 状态 + insert/edit/save）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form（v-model 驱动控件）', async () => {
		const wrapper = mount(Wait, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useWaitCommandSchema();
		CommandSchema.insert(target, 'wait');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('wait');
		expect(form.duration).toBe(1);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form（v-model 驱动控件）', async () => {
		const wrapper = mount(Wait, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useWaitCommandSchema();
		CommandSchema.edit(target, { id: 'wait', params: { duration: 500 } });
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('wait');
		expect(form.duration).toBe(500);
		wrapper.unmount();
	});

	it('save 路径：用户改 form 后经 Command.cases.wait.save 保存', async () => {
		const wrapper = mount(Wait, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useWaitCommandSchema();
		Command.cases.wait.customLoad!({ duration: 1 });
		form.duration = 800;
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.wait.save!();
		expect(saved).toHaveBeenCalledWith({ duration: 800 });
		wrapper.unmount();
	});
});
