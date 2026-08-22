import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetTriggerSpeed from '@app/components/commands/SetTriggerSpeed.vue';
import { useSetTriggerSpeedCommandSchema } from '@app/composables/commands/useSetTriggerSpeedCommandSchema';
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

describe('useSetTriggerSpeedCommandSchema（setTriggerSpeed 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(SetTriggerSpeed, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetTriggerSpeedCommandSchema();
		CommandSchema.insert(target, 'setTriggerSpeed');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setTriggerSpeed');
		expect(form.trigger).toEqual({ type: 'trigger' });
		expect(form.speed).toBe(0);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(SetTriggerSpeed, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetTriggerSpeedCommandSchema();
		CommandSchema.edit(target, {
			id: 'setTriggerSpeed',
			params: { trigger: { type: 'player' }, speed: 8 }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setTriggerSpeed');
		expect(form.trigger).toEqual({ type: 'player' });
		expect(form.speed).toBe(8);
		wrapper.unmount();
	});

	it('save 路径：form 值经 Command.cases.setTriggerSpeed.save 保存', async () => {
		const wrapper = mount(SetTriggerSpeed, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetTriggerSpeedCommandSchema();
		Command.cases.setTriggerSpeed.customLoad!({ trigger: { type: 'trigger' }, speed: 0 });
		form.speed = 16;
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setTriggerSpeed.save!();
		expect(saved).toHaveBeenCalledWith({ trigger: { type: 'trigger' }, speed: 16 });
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 trigger + speed 文本', () => {
		setWords();
		Command.parseTrigger = vi.fn((t: { type: string }) => `TR:${t.type}`) as never;
		Command.parseVariableNumber = vi.fn((v: unknown) => `N:${v}`) as never;
		const contents = Command.cases.setTriggerSpeed.parse!({
			trigger: { type: 'trigger' },
			speed: 0
		});
		expect(contents).toContainEqual({ text: 'TR:triggerN:0' });
	});
});
