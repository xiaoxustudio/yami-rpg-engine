import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetWeight from '@app/components/commands/SetWeight.vue';
import { useSetWeightCommandSchema } from '@app/composables/commands/useSetWeightCommandSchema';
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

describe('useSetWeightCommandSchema（setWeight 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(SetWeight, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetWeightCommandSchema();
		CommandSchema.insert(target, 'setWeight');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setWeight');
		expect(form.actor).toEqual({ type: 'trigger' });
		expect(form.weight).toBe(0);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(SetWeight, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetWeightCommandSchema();
		CommandSchema.edit(target, {
			id: 'setWeight',
			params: { actor: { type: 'player' }, weight: 3.5 }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setWeight');
		expect(form.actor).toEqual({ type: 'player' });
		expect(form.weight).toBe(3.5);
		wrapper.unmount();
	});

	it('save 路径：form 值经 Command.cases.setWeight.save 保存', async () => {
		const wrapper = mount(SetWeight, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetWeightCommandSchema();
		Command.cases.setWeight.customLoad!({ actor: { type: 'trigger' }, weight: 0 });
		form.weight = 2.5;
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setWeight.save!();
		expect(saved).toHaveBeenCalledWith({ actor: { type: 'trigger' }, weight: 2.5 });
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 actor + weight 文本', () => {
		setWords();
		Command.parseActor = vi.fn((a: { type: string }) => `A:${a.type}`) as never;
		Command.parseVariableNumber = vi.fn((v: unknown) => `N:${v}`) as never;
		const contents = Command.cases.setWeight.parse!({
			actor: { type: 'trigger' },
			weight: 0
		});
		expect(contents).toContainEqual({ text: 'A:triggerN:0' });
	});
});
