import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ChangeActorSprite from '@app/components/commands/ChangeActorSprite.vue';
import { useChangeActorSpriteCommandSchema } from '@app/composables/commands/useChangeActorSpriteCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Animation } from '@app/animation/animation-window.ts';
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

describe('useChangeActorSpriteCommandSchema（changeActorSprite 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Animation.getSpriteListItems = vi.fn(() => [{ name: 's0', value: 's0' }]) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(ChangeActorSprite, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useChangeActorSpriteCommandSchema();
		CommandSchema.insert(target, 'changeActorSprite');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('changeActorSprite');
		expect(form.actor).toEqual({ type: 'trigger' });
		expect(form.animationId).toBe('');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(ChangeActorSprite, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useChangeActorSpriteCommandSchema();
		CommandSchema.edit(target, {
			id: 'changeActorSprite',
			params: { actor: { type: 'player' }, animationId: 'a1', spriteId: 's1' }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('changeActorSprite');
		expect(form.actor).toEqual({ type: 'player' });
		expect(form.animationId).toBe('a1');
		wrapper.unmount();
	});

	it('save 校验：animationId/spriteId 必填，为空不保存', async () => {
		const wrapper = mount(ChangeActorSprite, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useChangeActorSpriteCommandSchema();
		Command.cases.changeActorSprite.customLoad!({
			actor: { type: 'trigger' },
			animationId: '',
			spriteId: '',
			image: ''
		});
		form.animationId = '';
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.changeActorSprite.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：form 值经 Command.cases.changeActorSprite.save 保存', async () => {
		const wrapper = mount(ChangeActorSprite, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useChangeActorSpriteCommandSchema();
		Command.cases.changeActorSprite.customLoad!({
			actor: { type: 'trigger' },
			animationId: 'a1',
			spriteId: 's1',
			image: 'img'
		});
		form.spriteId = 's2';
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.changeActorSprite.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			animationId: 'a1',
			spriteId: 's2',
			image: 'img'
		});
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 actor + sprite 文本', () => {
		setWords();
		Command.parseActor = vi.fn((a: unknown) => `A:${(a as { type: string }).type}`) as never;
		Command.parseFileName = vi.fn((v: unknown) => `F:${v}`) as never;
		Command.parseSpriteName = vi.fn(() => 'SPRITE') as never;
		const contents = Command.cases.changeActorSprite.parse!({
			actor: { type: 'trigger' },
			animationId: 'a1',
			spriteId: 's1',
			image: 'img'
		});
		expect(contents[0]).toHaveProperty('color');
		expect(contents[2]).toHaveProperty('text');
	});
});
