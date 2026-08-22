import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ChangeActorMotion from '@app/components/commands/ChangeActorMotion.vue';
import { useChangeActorMotionCommandSchema } from '@app/composables/commands/useChangeActorMotionCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Data } from '@app/data/data-object.ts';
import { GameLocal } from '@app/local/local-object.ts';
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

describe('useChangeActorMotionCommandSchema（changeActorMotion 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Data.enumeration = { context: { getString: (id: string) => id } } as never;
		GameLocal.replace = ((text: string) => text) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(ChangeActorMotion, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useChangeActorMotionCommandSchema();
		CommandSchema.insert(target, 'changeActorMotion');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('changeActorMotion');
		expect(form.actor).toEqual({ type: 'trigger' });
		expect(form.type).toBe('move');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(ChangeActorMotion, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useChangeActorMotionCommandSchema();
		CommandSchema.edit(target, {
			id: 'changeActorMotion',
			params: { type: 'idle', motion: 'walk' }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('changeActorMotion');
		expect(form.type).toBe('idle');
		expect(form.motion).toBe('walk');
		wrapper.unmount();
	});

	it('save 校验：motion 必填，为空不保存', async () => {
		const wrapper = mount(ChangeActorMotion, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useChangeActorMotionCommandSchema();
		Command.cases.changeActorMotion.customLoad!({
			actor: { type: 'trigger' },
			type: 'move',
			motion: ''
		});
		form.motion = '';
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.changeActorMotion.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：form 值经 Command.cases.changeActorMotion.save 保存', async () => {
		const wrapper = mount(ChangeActorMotion, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useChangeActorMotionCommandSchema();
		Command.cases.changeActorMotion.customLoad!({
			actor: { type: 'trigger' },
			type: 'move',
			motion: 'walk'
		});
		form.motion = 'run';
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.changeActorMotion.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			type: 'move',
			motion: 'run'
		});
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 actor + 动作类型文本', () => {
		setWords();
		Command.parseActor = vi.fn((a: unknown) => `A:${(a as { type: string }).type}`) as never;
		Command.parseEnumString = vi.fn((v: unknown) => `E:${v}`) as never;
		const contents = Command.cases.changeActorMotion.parse!({
			actor: { type: 'trigger' },
			type: 'move',
			motion: 'walk'
		});
		expect(contents[0]).toHaveProperty('color');
		expect(contents[2]).toHaveProperty('text');
	});
});
