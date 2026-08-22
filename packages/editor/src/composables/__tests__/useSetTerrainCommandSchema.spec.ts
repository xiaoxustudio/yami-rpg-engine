import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetTerrain from '@app/components/commands/SetTerrain.vue';
import { useSetTerrainCommandSchema } from '@app/composables/commands/useSetTerrainCommandSchema';
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

describe('useSetTerrainCommandSchema（setTerrain 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(SetTerrain, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetTerrainCommandSchema();
		CommandSchema.insert(target, 'setTerrain');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setTerrain');
		expect(form.position).toEqual({ type: 'absolute', x: 0, y: 0 });
		expect(form.terrain).toBe('land');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(SetTerrain, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetTerrainCommandSchema();
		CommandSchema.edit(target, {
			id: 'setTerrain',
			params: { position: { type: 'absolute', x: 1, y: 2 }, terrain: 'water' }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setTerrain');
		expect(form.position).toEqual({ type: 'absolute', x: 1, y: 2 });
		expect(form.terrain).toBe('water');
		wrapper.unmount();
	});

	it('save 路径：form 值经 Command.cases.setTerrain.save 保存', async () => {
		const wrapper = mount(SetTerrain, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetTerrainCommandSchema();
		Command.cases.setTerrain.customLoad!({
			position: { type: 'absolute', x: 0, y: 0 },
			terrain: 'land'
		});
		form.position = { type: 'absolute', x: 3, y: 4 };
		form.terrain = 'wall';
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setTerrain.save!();
		expect(saved).toHaveBeenCalledWith({
			position: { type: 'absolute', x: 3, y: 4 },
			terrain: 'wall'
		});
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 position + terrain 文本', () => {
		setWords();
		Command.parsePosition = vi.fn(() => 'POS') as never;
		const contents = Command.cases.setTerrain.parse!({
			position: { type: 'absolute', x: 0, y: 0 },
			terrain: 'land'
		});
		const text = (contents[2] as { text: string }).text;
		expect(text).toContain('POS');
		expect(text).toContain('land');
	});
});
