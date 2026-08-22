import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ClampCamera from '@app/components/commands/ClampCamera.vue';
import { useClampCameraCommandSchema } from '@app/composables/commands/useClampCameraCommandSchema';
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

const words: string[] = [];
const setWords = (): void => {
	words.length = 0;
	Command.words = {
		push: (value: string) => {
			words.push(value);
			return Command.words;
		},
		join: (separator?: string) => words.join(separator ?? '')
	} as never;
};

describe('useClampCameraCommandSchema（clampCamera 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form（四边均为 0）', async () => {
		const wrapper = mount(ClampCamera, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useClampCameraCommandSchema();
		CommandSchema.insert(target, 'clampCamera');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('clampCamera');
		expect(form.left).toBe(0);
		expect(form.top).toBe(0);
		expect(form.right).toBe(0);
		expect(form.bottom).toBe(0);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(ClampCamera, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useClampCameraCommandSchema();
		CommandSchema.edit(target, {
			id: 'clampCamera',
			params: { left: 1, top: 2, right: 3, bottom: 4 }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('clampCamera');
		expect(form.left).toBe(1);
		expect(form.bottom).toBe(4);
		wrapper.unmount();
	});

	it('save 路径：form 值经 Command.cases.clampCamera.save 保存', async () => {
		const wrapper = mount(ClampCamera, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useClampCameraCommandSchema();
		Command.cases.clampCamera.customLoad!({ left: 0, top: 0, right: 0, bottom: 0 });
		form.left = 10;
		form.bottom = -10;
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.clampCamera.save!();
		expect(saved).toHaveBeenCalledWith({ left: 10, top: 0, right: 0, bottom: -10 });
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染四边文本', () => {
		setWords();
		Command.parseVariableNumber = vi.fn((v: unknown) => `N:${v}`) as never;
		const contents = Command.cases.clampCamera.parse!({ left: 1, top: 2, right: 3, bottom: 4 });
		expect(contents[0]).toHaveProperty('color');
		expect(contents[2]).toHaveProperty('text');
	});
});
