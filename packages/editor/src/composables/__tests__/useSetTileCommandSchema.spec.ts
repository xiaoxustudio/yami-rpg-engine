import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetTile from '@app/components/commands/SetTile.vue';
import { useSetTileCommandSchema } from '@app/composables/commands/useSetTileCommandSchema';
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

describe('useSetTileCommandSchema（setTile 命令表单 composable：insert/edit/save/validate/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(SetTile, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetTileCommandSchema();
		CommandSchema.insert(target, 'setTile');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setTile');
		expect(form.tilemap).toEqual({ type: 'trigger' });
		expect(form.tilemapX).toBe(0);
		expect(form.tilemapY).toBe(0);
		expect(form.tilesetId).toBe('');
		expect(form.tilesetX).toBe(0);
		expect(form.tilesetY).toBe(0);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(SetTile, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetTileCommandSchema();
		CommandSchema.edit(target, {
			id: 'setTile',
			params: {
				tilemap: { type: 'player' },
				tilemapX: 5,
				tilemapY: 6,
				tilesetId: 'ts1',
				tilesetX: 1,
				tilesetY: 2
			}
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setTile');
		expect(form.tilemap).toEqual({ type: 'player' });
		expect(form.tilesetId).toBe('ts1');
		expect(form.tilemapX).toBe(5);
		expect(form.tilesetY).toBe(2);
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.setTile.save 保存', async () => {
		const wrapper = mount(SetTile, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setTile.customLoad!({
			tilemap: { type: 'trigger' },
			tilemapX: 0,
			tilemapY: 0,
			tilesetId: 'ts0',
			tilesetX: 0,
			tilesetY: 0
		});
		getControl('setTile-tilemapX').write(5);
		getControl('setTile-tilesetId').write('ts1');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setTile.save!();
		expect(saved).toHaveBeenCalledWith({
			tilemap: { type: 'trigger' },
			tilemapX: 5,
			tilemapY: 0,
			tilesetId: 'ts1',
			tilesetX: 0,
			tilesetY: 0
		});
		wrapper.unmount();
	});

	it('save 路径：tilesetId 为空校验失败不保存', async () => {
		const wrapper = mount(SetTile, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setTile.customLoad!({
			tilemap: { type: 'trigger' },
			tilemapX: 0,
			tilemapY: 0,
			tilesetId: '',
			tilesetX: 0,
			tilesetY: 0
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setTile.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 tilemap + 坐标/图集文本', () => {
		setWords();
		Command.parseTilemap = vi.fn(() => 'TM') as never;
		Command.parseVariableNumber = vi.fn((v: unknown) => `N:${v}`) as never;
		Command.parseFileName = vi.fn((v: unknown) => `F:${v}`) as never;
		const contents = Command.cases.setTile.parse!({
			tilemap: { type: 'trigger' },
			tilemapX: 1,
			tilemapY: 2,
			tilesetId: 'ts0',
			tilesetX: 3,
			tilesetY: 4
		});
		expect(contents).toContainEqual({ text: 'TMN:1N:2F:ts0N:3N:4' });
	});
});
