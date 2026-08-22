import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetTriggerAngle from '@app/components/commands/SetTriggerAngle.vue';
import { useSetTriggerAngleCommandSchema } from '@app/composables/commands/useSetTriggerAngleCommandSchema';
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

describe('useSetTriggerAngleCommandSchema（setTriggerAngle 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(SetTriggerAngle, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetTriggerAngleCommandSchema();
		CommandSchema.insert(target, 'setTriggerAngle');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setTriggerAngle');
		expect(form.trigger).toEqual({ type: 'trigger' });
		expect(form.angle).toEqual({ type: 'absolute', degrees: 0 });
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(SetTriggerAngle, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetTriggerAngleCommandSchema();
		CommandSchema.edit(target, {
			id: 'setTriggerAngle',
			params: { trigger: { type: 'player' }, angle: { type: 'absolute', degrees: 90 } }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setTriggerAngle');
		expect(form.trigger).toEqual({ type: 'player' });
		expect(form.angle).toEqual({ type: 'absolute', degrees: 90 });
		wrapper.unmount();
	});

	it('save 路径：form 值经 Command.cases.setTriggerAngle.save 保存', async () => {
		const wrapper = mount(SetTriggerAngle, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetTriggerAngleCommandSchema();
		Command.cases.setTriggerAngle.customLoad!({
			trigger: { type: 'trigger' },
			angle: { type: 'absolute', degrees: 0 }
		});
		form.angle = { type: 'absolute', degrees: 180 };
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setTriggerAngle.save!();
		expect(saved).toHaveBeenCalledWith({
			trigger: { type: 'trigger' },
			angle: { type: 'absolute', degrees: 180 }
		});
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 trigger + angle 文本', () => {
		setWords();
		Command.parseTrigger = vi.fn((t: { type: string }) => `TR:${t.type}`) as never;
		Command.parseAngle = vi.fn(() => 'ANG') as never;
		const contents = Command.cases.setTriggerAngle.parse!({
			trigger: { type: 'trigger' },
			angle: { type: 'absolute', degrees: 0 }
		});
		expect(contents).toContainEqual({ text: 'TR:triggerANG' });
	});
});
