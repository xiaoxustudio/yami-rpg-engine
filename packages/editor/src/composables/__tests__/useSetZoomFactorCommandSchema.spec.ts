import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetZoomFactor from '@app/components/commands/SetZoomFactor.vue';
import { useSetZoomFactorCommandSchema } from '@app/composables/commands/useSetZoomFactorCommandSchema';
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

describe('useSetZoomFactorCommandSchema（setZoomFactor 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Data.easings = [{ id: 'easing0', name: 'Linear' }] as never;
		Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'easing0' }]) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(SetZoomFactor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetZoomFactorCommandSchema();
		CommandSchema.insert(target, 'setZoomFactor');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setZoomFactor');
		expect(form.zoom).toBe(1);
		expect(form.easingId).toBe('easing0');
		expect(form.duration).toBe(0);
		expect(form.wait).toBe(false);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(SetZoomFactor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetZoomFactorCommandSchema();
		CommandSchema.edit(target, {
			id: 'setZoomFactor',
			params: { zoom: 2.5, easingId: 'e2', duration: 400, wait: true }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setZoomFactor');
		expect(form.zoom).toBe(2.5);
		expect(form.easingId).toBe('e2');
		expect(form.duration).toBe(400);
		expect(form.wait).toBe(true);
		wrapper.unmount();
	});

	it('save 路径：form 值经 Command.cases.setZoomFactor.save 保存', async () => {
		const wrapper = mount(SetZoomFactor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetZoomFactorCommandSchema();
		Command.cases.setZoomFactor.customLoad!({
			zoom: 1,
			easingId: 'easing0',
			duration: 0,
			wait: false
		});
		form.zoom = 1.5;
		form.wait = true;
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setZoomFactor.save!();
		expect(saved).toHaveBeenCalledWith({
			zoom: 1.5,
			easingId: 'easing0',
			duration: 0,
			wait: true
		});
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 zoom + easing 文本', () => {
		setWords();
		Command.parseVariableNumber = vi.fn((v: unknown) => `N:${v}`) as never;
		Command.parseEasing = vi.fn(() => 'EASING') as never;
		const contents = Command.cases.setZoomFactor.parse!({
			zoom: 1,
			easingId: 'easing0',
			duration: 0,
			wait: false
		});
		expect(contents).toContainEqual({ text: 'N:1EASING' });
	});
});
