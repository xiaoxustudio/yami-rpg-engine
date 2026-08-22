import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetSkill from '@app/components/commands/SetSkill.vue';
import { useSetSkillCommandSchema } from '@app/composables/commands/useSetSkillCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
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

describe('useSetSkillCommandSchema（setSkill 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(SetSkill, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetSkillCommandSchema();
		CommandSchema.insert(target, 'setSkill');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setSkill');
		expect(form.skill).toEqual({ type: 'trigger' });
		expect(form.operation).toBe('set-cooldown');
		expect(form.cooldown).toBe(0);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(SetSkill, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetSkillCommandSchema();
		CommandSchema.edit(target, {
			id: 'setSkill',
			params: { skill: { type: 'player' }, operation: 'decrease-cooldown', cooldown: 200 }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setSkill');
		expect(form.skill).toEqual({ type: 'player' });
		expect(form.operation).toBe('decrease-cooldown');
		expect(form.cooldown).toBe(200);
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.setSkill.save 保存', async () => {
		const wrapper = mount(SetSkill, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setSkill.customLoad!({
			skill: { type: 'trigger' },
			operation: 'set-cooldown',
			cooldown: 0
		});
		getControl('setSkill-skill').write({ type: 'player' });
		getControl('setSkill-cooldown').write(500);
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setSkill.save!();
		expect(saved).toHaveBeenCalledWith({
			skill: { type: 'player' },
			operation: 'set-cooldown',
			cooldown: 500
		});
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 skill + 操作文本', () => {
		setWords();
		Command.parseSkill = vi.fn((s: { type: string }) => `SK:${s.type}`) as never;
		Command.parseVariableNumber = vi.fn((v: unknown) => `N:${v}`) as never;
		const contents = Command.cases.setSkill.parse!({
			skill: { type: 'trigger' },
			operation: 'set-cooldown',
			cooldown: 300
		});
		const text = (contents[2] as { text: string }).text;
		expect(text).toContain('SK:trigger');
		expect(text).toContain('set-cooldown');
		expect(text).toContain('N:300');
	});
});
