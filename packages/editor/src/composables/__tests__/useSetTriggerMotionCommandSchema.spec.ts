import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetTriggerMotion from '@app/components/commands/SetTriggerMotion.vue';
import { useSetTriggerMotionCommandSchema } from '@app/composables/commands/useSetTriggerMotionCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Enum } from '@app/enum/enum-window.ts';
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

describe('useSetTriggerMotionCommandSchema（setTriggerMotion 命令表单 composable：insert/edit/save/validate/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Enum.getString = vi.fn((stringId: string) => ({ name: stringId })) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(SetTriggerMotion, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetTriggerMotionCommandSchema();
		CommandSchema.insert(target, 'setTriggerMotion');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setTriggerMotion');
		expect(form.trigger).toEqual({ type: 'trigger' });
		expect(form.motion).toBe('');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(SetTriggerMotion, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetTriggerMotionCommandSchema();
		CommandSchema.edit(target, {
			id: 'setTriggerMotion',
			params: { trigger: { type: 'player' }, motion: 'active' }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setTriggerMotion');
		expect(form.trigger).toEqual({ type: 'player' });
		expect(form.motion).toBe('active');
		wrapper.unmount();
	});

	it('save 路径：form 值经 Command.cases.setTriggerMotion.save 保存', async () => {
		const wrapper = mount(SetTriggerMotion, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetTriggerMotionCommandSchema();
		Command.cases.setTriggerMotion.customLoad!({
			trigger: { type: 'trigger' },
			motion: 'active'
		});
		form.motion = 'idle';
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setTriggerMotion.save!();
		expect(saved).toHaveBeenCalledWith({ trigger: { type: 'trigger' }, motion: 'idle' });
		wrapper.unmount();
	});

	it('save 路径：motion 为空校验失败不保存', async () => {
		const wrapper = mount(SetTriggerMotion, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setTriggerMotion.customLoad!({ trigger: { type: 'trigger' }, motion: '' });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setTriggerMotion.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 trigger + motion 文本', () => {
		setWords();
		Command.parseTrigger = vi.fn((t: { type: string }) => `TR:${t.type}`) as never;
		Command.parseEnumString = vi.fn((v: unknown) => `EN:${v}`) as never;
		const contents = Command.cases.setTriggerMotion.parse!({
			trigger: { type: 'trigger' },
			motion: 'active'
		});
		expect(contents).toContainEqual({ text: 'TR:triggerEN:active' });
	});
});
