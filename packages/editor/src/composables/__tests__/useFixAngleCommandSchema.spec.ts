import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import FixAngle from '@app/components/commands/FixAngle.vue';
import { useFixAngleCommandSchema } from '@app/composables/commands/useFixAngleCommandSchema';
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

describe('useFixAngleCommandSchema（fixAngle 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(FixAngle, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useFixAngleCommandSchema();
		CommandSchema.insert(target, 'fixAngle');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('fixAngle');
		expect(form.actor).toEqual({ type: 'trigger' });
		expect(form.fixed).toBe(true);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(FixAngle, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useFixAngleCommandSchema();
		CommandSchema.edit(target, {
			id: 'fixAngle',
			params: { actor: { type: 'player' }, fixed: false }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('fixAngle');
		expect(form.fixed).toBe(false);
		wrapper.unmount();
	});

	it('save 路径：form 值经 Command.cases.fixAngle.save 保存', async () => {
		const wrapper = mount(FixAngle, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useFixAngleCommandSchema();
		Command.cases.fixAngle.customLoad!({ actor: { type: 'trigger' }, fixed: true });
		form.fixed = false;
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.fixAngle.save!();
		expect(saved).toHaveBeenCalledWith({ actor: { type: 'trigger' }, fixed: false });
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 actor + fixed 文本', () => {
		setWords();
		Command.parseActor = vi.fn((a: unknown) => `A:${(a as { type: string }).type}`) as never;
		const contents = Command.cases.fixAngle.parse!({ actor: { type: 'trigger' }, fixed: true });
		expect(contents[0]).toHaveProperty('color');
		expect(contents[2]).toHaveProperty('text');
	});
});
