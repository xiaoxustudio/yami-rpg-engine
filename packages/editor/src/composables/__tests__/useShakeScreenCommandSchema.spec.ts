import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ShakeScreen from '@app/components/commands/ShakeScreen.vue';
import { useShakeScreenCommandSchema } from '@app/composables/commands/useShakeScreenCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Data } from '@app/data/data-object.ts';
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

describe('useShakeScreenCommandSchema（shakeScreen 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Data.easings = [{ id: 'easing0', name: 'Linear' }] as never;
		Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'easing0' }]) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(ShakeScreen, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useShakeScreenCommandSchema();
		CommandSchema.insert(target, 'shakeScreen');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('shakeScreen');
		expect(form.mode).toBe('random');
		expect(form.power).toBe(5);
		expect(form.speed).toBe(10);
		expect(form.easingId).toBe('easing0');
		expect(form.duration).toBe(200);
		expect(form.wait).toBe(false);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(ShakeScreen, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useShakeScreenCommandSchema();
		CommandSchema.edit(target, {
			id: 'shakeScreen',
			params: {
				mode: 'vertical',
				power: 8,
				speed: 4,
				easingId: 'e2',
				duration: 500,
				wait: true
			}
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('shakeScreen');
		expect(form.mode).toBe('vertical');
		expect(form.power).toBe(8);
		expect(form.speed).toBe(4);
		expect(form.easingId).toBe('e2');
		expect(form.duration).toBe(500);
		expect(form.wait).toBe(true);
		wrapper.unmount();
	});

	it('save 路径：form 值经 Command.cases.shakeScreen.save 保存', async () => {
		const wrapper = mount(ShakeScreen, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useShakeScreenCommandSchema();
		Command.cases.shakeScreen.customLoad!({
			mode: 'random',
			power: 5,
			speed: 10,
			easingId: 'easing0',
			duration: 200,
			wait: false
		});
		form.mode = 'horizontal';
		form.duration = 800;
		form.wait = true;
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.shakeScreen.save!();
		expect(saved).toHaveBeenCalledWith({
			mode: 'horizontal',
			power: 5,
			speed: 10,
			easingId: 'easing0',
			duration: 800,
			wait: true
		});
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染模式 + 强度 + 缓动文本', () => {
		setWords();
		Command.setNumberColor = vi.fn((v: unknown) => `C:${v}`) as never;
		Command.parseEasing = vi.fn(() => 'EASING') as never;
		const contents = Command.cases.shakeScreen.parse!({
			mode: 'random',
			power: 5,
			speed: 10,
			easingId: 'easing0',
			duration: 200,
			wait: false
		});
		const text = (contents[2] as { text: string }).text;
		expect(text).toContain('random');
		expect(text).toContain('C:5');
		expect(text).toContain('C:10');
		expect(text).toContain('EASING');
	});
});
