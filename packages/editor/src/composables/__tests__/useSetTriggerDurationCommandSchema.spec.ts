import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetTriggerDuration from '@app/components/commands/SetTriggerDuration.vue';
import { useSetTriggerDurationCommandSchema } from '@app/composables/commands/useSetTriggerDurationCommandSchema';
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

describe('useSetTriggerDurationCommandSchema（setTriggerDuration 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(SetTriggerDuration, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetTriggerDurationCommandSchema();
		CommandSchema.insert(target, 'setTriggerDuration');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setTriggerDuration');
		expect(form.trigger).toEqual({ type: 'trigger' });
		expect(form.operation).toBe('set');
		expect(form.duration).toBe(0);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(SetTriggerDuration, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetTriggerDurationCommandSchema();
		CommandSchema.edit(target, {
			id: 'setTriggerDuration',
			params: { trigger: { type: 'player' }, operation: 'increase', duration: 300 }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setTriggerDuration');
		expect(form.trigger).toEqual({ type: 'player' });
		expect(form.operation).toBe('increase');
		expect(form.duration).toBe(300);
		wrapper.unmount();
	});

	it('save 路径：form 值经 Command.cases.setTriggerDuration.save 保存', async () => {
		const wrapper = mount(SetTriggerDuration, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetTriggerDurationCommandSchema();
		Command.cases.setTriggerDuration.customLoad!({
			trigger: { type: 'trigger' },
			operation: 'set',
			duration: 0
		});
		form.operation = 'decrease';
		form.duration = 200;
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setTriggerDuration.save!();
		expect(saved).toHaveBeenCalledWith({
			trigger: { type: 'trigger' },
			operation: 'decrease',
			duration: 200
		});
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 trigger + 操作/时长文本', () => {
		setWords();
		Command.parseTrigger = vi.fn((t: { type: string }) => `TR:${t.type}`) as never;
		Command.parseVariableNumber = vi.fn((v: unknown) => `N:${v}`) as never;
		const contents = Command.cases.setTriggerDuration.parse!({
			trigger: { type: 'trigger' },
			operation: 'set',
			duration: 0
		});
		const text = (contents[2] as { text: string }).text;
		expect(text).toContain('TR:trigger');
		expect(text).toContain('set');
		expect(text).toContain('N:0');
	});
});
