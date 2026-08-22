import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import DeleteTile from '@app/components/commands/DeleteTile.vue';
import { useDeleteTileCommandSchema } from '@app/composables/commands/useDeleteTileCommandSchema';
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

describe('useDeleteTileCommandSchema（deleteTile 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(DeleteTile, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useDeleteTileCommandSchema();
		CommandSchema.insert(target, 'deleteTile');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('deleteTile');
		expect(form.tilemap).toEqual({ type: 'trigger' });
		expect(form.tilemapX).toBe(0);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(DeleteTile, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useDeleteTileCommandSchema();
		CommandSchema.edit(target, {
			id: 'deleteTile',
			params: { tilemap: { type: 'player' }, tilemapX: 3, tilemapY: 4 }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('deleteTile');
		expect(form.tilemapX).toBe(3);
		expect(form.tilemapY).toBe(4);
		wrapper.unmount();
	});

	it('save 路径：form 改动经 Command.cases.deleteTile.save 保存', async () => {
		const wrapper = mount(DeleteTile, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useDeleteTileCommandSchema();
		Command.cases.deleteTile.customLoad!({
			tilemap: { type: 'trigger' },
			tilemapX: 0,
			tilemapY: 0
		});
		form.tilemapX = 5;
		form.tilemapY = 6;
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.deleteTile.save!();
		expect(saved).toHaveBeenCalledWith({
			tilemap: { type: 'trigger' },
			tilemapX: 5,
			tilemapY: 6
		});
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 tilemap 文本', () => {
		setWords();
		Command.parseTilemap = vi.fn(() => 'TM') as never;
		Command.parseVariableNumber = vi.fn((v: unknown) => `N:${v}`) as never;
		const contents = Command.cases.deleteTile.parse!({
			tilemap: { type: 'trigger' },
			tilemapX: 1,
			tilemapY: 2
		});
		expect(contents[0]).toHaveProperty('color');
		expect(contents[2]).toHaveProperty('text');
	});
});
