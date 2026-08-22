import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import TranslateActor from '@app/components/commands/TranslateActor.vue';
import { useTranslateActorCommandSchema } from '@app/composables/commands/useTranslateActorCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Data } from '@app/data/data-object.ts';
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

describe('useTranslateActorCommandSchema（translateActor 命令表单 composable：insert/edit/save/validate/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Data.easings = [{ id: 'easing0', name: 'Linear' }] as never;
		Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'easing0' }]) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(TranslateActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useTranslateActorCommandSchema();
		CommandSchema.insert(target, 'translateActor');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('translateActor');
		expect(form.actor).toEqual({ type: 'trigger' });
		expect(form.angle).toEqual({ type: 'absolute', degrees: 0 });
		expect(form.distance).toBe(0);
		expect(form.easingId).toBe('easing0');
		expect(form.duration).toBe(0);
		expect(form.wait).toBe(false);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(TranslateActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useTranslateActorCommandSchema();
		CommandSchema.edit(target, {
			id: 'translateActor',
			params: {
				actor: { type: 'player' },
				angle: { type: 'absolute', degrees: 45 },
				distance: 5,
				easingId: 'e2',
				duration: 400,
				wait: true
			}
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('translateActor');
		expect(form.actor).toEqual({ type: 'player' });
		expect(form.angle).toEqual({ type: 'absolute', degrees: 45 });
		expect(form.distance).toBe(5);
		expect(form.easingId).toBe('e2');
		expect(form.duration).toBe(400);
		expect(form.wait).toBe(true);
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.translateActor.save 保存', async () => {
		const wrapper = mount(TranslateActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.translateActor.customLoad!({
			actor: { type: 'trigger' },
			angle: { type: 'absolute', degrees: 0 },
			distance: 0,
			easingId: 'easing0',
			duration: 0,
			wait: false
		});
		getControl('translateActor-distance').write(5);
		getControl('translateActor-wait').write(true);
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.translateActor.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			angle: { type: 'absolute', degrees: 0 },
			distance: 5,
			easingId: 'easing0',
			duration: 0,
			wait: true
		});
		wrapper.unmount();
	});

	it('save 路径：distance 为 0 校验失败不保存', async () => {
		const wrapper = mount(TranslateActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.translateActor.customLoad!({
			actor: { type: 'trigger' },
			angle: { type: 'absolute', degrees: 0 },
			distance: 0,
			easingId: 'easing0',
			duration: 0,
			wait: false
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.translateActor.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 actor + angle/distance + 缓动文本', () => {
		setWords();
		Command.parseActor = vi.fn((a: { type: string }) => `A:${a.type}`) as never;
		Command.parseAngle = vi.fn(() => 'ANG') as never;
		Command.parseVariableNumber = vi.fn((v: unknown) => `N:${v}`) as never;
		Command.parseEasing = vi.fn(() => 'EASING') as never;
		const contents = Command.cases.translateActor.parse!({
			actor: { type: 'trigger' },
			angle: { type: 'absolute', degrees: 0 },
			distance: 0,
			easingId: 'easing0',
			duration: 0,
			wait: false
		});
		expect(contents).toContainEqual({ text: 'A:triggerANGN:0EASING' });
	});
});
