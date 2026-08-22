import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetState from '@app/components/commands/SetState.vue';
import { useSetStateCommandSchema } from '@app/composables/commands/useSetStateCommandSchema';
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

describe('useSetStateCommandSchema（setState 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(SetState, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetStateCommandSchema();
		CommandSchema.insert(target, 'setState');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setState');
		expect(form.state).toEqual({ type: 'trigger' });
		expect(form.operation).toBe('set-time');
		expect(form.time).toBe(0);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(SetState, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetStateCommandSchema();
		CommandSchema.edit(target, {
			id: 'setState',
			params: { state: { type: 'player' }, operation: 'increase-time', time: 500 }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setState');
		expect(form.state).toEqual({ type: 'player' });
		expect(form.operation).toBe('increase-time');
		expect(form.time).toBe(500);
		wrapper.unmount();
	});

	it('save 路径：form 值经 Command.cases.setState.save 保存', async () => {
		const wrapper = mount(SetState, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetStateCommandSchema();
		Command.cases.setState.customLoad!({
			state: { type: 'trigger' },
			operation: 'set-time',
			time: 0
		});
		form.operation = 'decrease-time';
		form.time = 400;
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setState.save!();
		expect(saved).toHaveBeenCalledWith({
			state: { type: 'trigger' },
			operation: 'decrease-time',
			time: 400
		});
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 state + 操作文本', () => {
		setWords();
		Command.parseState = vi.fn((s: { type: string }) => `ST:${s.type}`) as never;
		Command.parseVariableNumber = vi.fn((v: unknown) => `N:${v}`) as never;
		const contents = Command.cases.setState.parse!({
			state: { type: 'trigger' },
			operation: 'set-time',
			time: 0
		});
		const text = (contents[2] as { text: string }).text;
		expect(text).toContain('ST:trigger');
		expect(text).toContain('set-time');
		expect(text).toContain('N:0');
	});
});
