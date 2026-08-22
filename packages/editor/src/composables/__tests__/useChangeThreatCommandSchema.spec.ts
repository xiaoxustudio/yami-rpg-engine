import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ChangeThreat from '@app/components/commands/ChangeThreat.vue';
import { useChangeThreatCommandSchema } from '@app/composables/commands/useChangeThreatCommandSchema';
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

describe('useChangeThreatCommandSchema（changeThreat 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(ChangeThreat, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useChangeThreatCommandSchema();
		CommandSchema.insert(target, 'changeThreat');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('changeThreat');
		expect(form.actor).toEqual({ type: 'trigger' });
		expect(form.operation).toBe('increase');
		expect(form.threat).toBe(0);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(ChangeThreat, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useChangeThreatCommandSchema();
		CommandSchema.edit(target, {
			id: 'changeThreat',
			params: { actor: { type: 'player' }, operation: 'decrease', threat: 5 }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('changeThreat');
		expect(form.actor).toEqual({ type: 'player' });
		expect(form.threat).toBe(5);
		wrapper.unmount();
	});

	it('save 路径：form 值经 Command.cases.changeThreat.save 保存', async () => {
		const wrapper = mount(ChangeThreat, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useChangeThreatCommandSchema();
		Command.cases.changeThreat.customLoad!({
			actor: { type: 'trigger' },
			target: { type: 'player' },
			operation: 'increase',
			threat: 0
		});
		form.threat = 100;
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.changeThreat.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			target: { type: 'player' },
			operation: 'increase',
			threat: 100
		});
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 actor + 操作文本', () => {
		setWords();
		Command.parseActor = vi.fn((a: unknown) => `A:${(a as { type: string }).type}`) as never;
		Command.parseVariableNumber = vi.fn((v: unknown) => `N:${v}`) as never;
		const contents = Command.cases.changeThreat.parse!({
			actor: { type: 'trigger' },
			target: { type: 'player' },
			operation: 'increase',
			threat: 5
		});
		expect(contents[0]).toHaveProperty('color');
		expect(contents[2]).toHaveProperty('text');
	});
});
