import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ControlDialog from '@app/components/commands/ControlDialog.vue';
import { useControlDialogCommandSchema } from '@app/composables/commands/useControlDialogCommandSchema';
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

describe('useControlDialogCommandSchema（controlDialog 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(ControlDialog, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useControlDialogCommandSchema();
		CommandSchema.insert(target, 'controlDialog');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('controlDialog');
		expect(form.element).toEqual({ type: 'trigger' });
		expect(form.operation).toBe('pause');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(ControlDialog, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useControlDialogCommandSchema();
		CommandSchema.edit(target, {
			id: 'controlDialog',
			params: { element: { type: 'player' }, operation: 'continue' }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('controlDialog');
		expect(form.element).toEqual({ type: 'player' });
		expect(form.operation).toBe('continue');
		wrapper.unmount();
	});

	it('save 路径：form 值经 Command.cases.controlDialog.save 保存', async () => {
		const wrapper = mount(ControlDialog, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useControlDialogCommandSchema();
		Command.cases.controlDialog.customLoad!({
			element: { type: 'trigger' },
			operation: 'pause'
		});
		form.operation = 'print-immediately';
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.controlDialog.save!();
		expect(saved).toHaveBeenCalledWith({
			element: { type: 'trigger' },
			operation: 'print-immediately'
		});
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 element + 操作文本', () => {
		setWords();
		Command.parseElement = vi.fn((e: unknown) => `E:${(e as { type: string }).type}`) as never;
		const contents = Command.cases.controlDialog.parse!({
			element: { type: 'dialog' },
			operation: 'pause'
		});
		expect(contents[0]).toHaveProperty('color');
		expect(contents[2]).toHaveProperty('text');
	});
});
