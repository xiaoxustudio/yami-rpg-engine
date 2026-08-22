import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SwitchCollisionSystem from '@app/components/commands/SwitchCollisionSystem.vue';
import { useSwitchCollisionSystemCommandSchema } from '@app/composables/commands/useSwitchCollisionSystemCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

const target = {
	scrollAndResize: vi.fn(),
	getSelectionPosition: () => ({ x: 100, y: 100 }),
	save: vi.fn()
};

describe('useSwitchCollisionSystemCommandSchema（switchCollisionSystem 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(SwitchCollisionSystem, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSwitchCollisionSystemCommandSchema();
		CommandSchema.insert(target, 'switchCollisionSystem');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('switchCollisionSystem');
		expect(form.operation).toBe('enable-actor-collision');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(SwitchCollisionSystem, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSwitchCollisionSystemCommandSchema();
		CommandSchema.edit(target, {
			id: 'switchCollisionSystem',
			params: { operation: 'disable-scene-collision' }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('switchCollisionSystem');
		expect(form.operation).toBe('disable-scene-collision');
		wrapper.unmount();
	});

	it('save 路径：form 值经 Command.cases.switchCollisionSystem.save 保存', async () => {
		const wrapper = mount(SwitchCollisionSystem, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSwitchCollisionSystemCommandSchema();
		Command.cases.switchCollisionSystem.customLoad!({ operation: 'enable-actor-collision' });
		form.operation = 'enable-scene-collision';
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.switchCollisionSystem.save!();
		expect(saved).toHaveBeenCalledWith({ operation: 'enable-scene-collision' });
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染操作文本', () => {
		const contents = Command.cases.switchCollisionSystem.parse!({
			operation: 'enable-actor-collision'
		});
		expect(contents[2]).toHaveProperty('text');
		expect((contents[2] as { text: string }).text).toContain('enable-actor-collision');
	});
});
