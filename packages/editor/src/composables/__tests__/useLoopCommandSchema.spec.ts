import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import Loop from '@app/components/commands/Loop.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { useLoopCommandSchema } from '@app/composables/commands/useLoopCommandSchema';
import { Window } from '@app/tools/window-object.ts';

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

describe('useLoopCommandSchema（loop 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(Loop, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useLoopCommandSchema();
		CommandSchema.insert(target, 'loop');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('loop');
		expect(form.mode).toBe('all');
		expect(form.conditions).toEqual([]);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(Loop, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useLoopCommandSchema();
		CommandSchema.edit(target, {
			id: 'loop',
			params: { mode: 'any', conditions: [{ type: 'self' }], commands: [] }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('loop');
		expect(form.mode).toBe('any');
		expect(form.conditions).toEqual([{ type: 'self' }]);
		wrapper.unmount();
	});

	it('save 路径：mode 从控件读取并连同 conditions/commands 保存', async () => {
		const wrapper = mount(Loop, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useLoopCommandSchema();
		Command.cases.loop.customLoad!({
			mode: 'all',
			conditions: [],
			commands: [{ id: 'wait', params: { duration: 1 } }]
		});
		getControl('loop-mode').write('any');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.loop.save!();
		expect(saved).toHaveBeenCalledWith({
			mode: 'any',
			conditions: [],
			commands: [{ id: 'wait', params: { duration: 1 } }]
		});
		wrapper.unmount();
	});

	it('parse 路径：无条件时渲染 loop 内容', () => {
		const contents = Command.cases.loop.parse!({ mode: 'all', conditions: [], commands: [] });
		expect(contents[0]).toEqual({ fold: true });
		expect(contents[1]).toEqual({ color: 'flow' });
		expect(contents[2]).toEqual({ text: 'command.loop' });
		expect(contents[3]).toEqual({ children: [] });
		expect(contents[5]).toEqual({ text: 'command.loop.end' });
	});
});
