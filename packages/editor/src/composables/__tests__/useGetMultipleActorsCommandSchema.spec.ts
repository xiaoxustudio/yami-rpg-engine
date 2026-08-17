import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import GetMultipleActors from '@app/components/commands/GetMultipleActors.vue';
import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from '@app/legacy/module/command/schema.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { Data } from '@app/legacy/data/data-object.ts';
import { Window } from '@app/legacy/tools/window-object.ts';

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

describe('useGetMultipleActorsCommandSchema（getMultipleActors 命令表单 composable：insert/edit/save 裁剪路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = vi.fn((variable: unknown) => {
			return !variable || (variable as { key?: string })?.key === '';
		}) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
		Data.teams = { list: [{ id: 'team0' }] } as never;
	});

	it('onMounted loadItems 填充 area/selector/activation 选项', async () => {
		const wrapper = mount(GetMultipleActors, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		expect(
			(
				document.getElementById('getMultipleActors-area') as unknown as {
					dataItems?: Array<{ value: string }>;
				}
			).dataItems
		).toHaveLength(2);
		expect(
			(
				document.getElementById('getMultipleActors-selector') as unknown as {
					dataItems?: Array<{ value: string }>;
				}
			).dataItems
		).toHaveLength(4);
		expect(
			(
				document.getElementById('getMultipleActors-activation') as unknown as {
					dataItems?: Array<{ value: string }>;
				}
			).dataItems
		).toHaveLength(3);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(GetMultipleActors, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'getMultipleActors');
		expect(Window.open).toHaveBeenCalledWith('getMultipleActors');
		expect(getControl('getMultipleActors-variable').read()).toEqual({ type: 'local', key: '' });
		expect(getControl('getMultipleActors-area').read()).toBe('rectangle');
		expect(getControl('getMultipleActors-width').read()).toBe(1);
		expect(getControl('getMultipleActors-height').read()).toBe(1);
		expect(getControl('getMultipleActors-radius').read()).toBe(0.5);
		expect(getControl('getMultipleActors-selector').read()).toBe('enemy');
		expect(getControl('getMultipleActors-activation').read()).toBe('active');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(GetMultipleActors, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'getMultipleActors',
			params: {
				variable: { type: 'local', key: 'list' },
				position: { type: 'absolute', x: 1, y: 2 },
				area: 'circle',
				radius: 3,
				selector: 'any',
				activation: 'inactive'
			}
		});
		expect(Window.open).toHaveBeenCalledWith('getMultipleActors');
		expect(getControl('getMultipleActors-variable').read()).toEqual({
			type: 'local',
			key: 'list'
		});
		expect(getControl('getMultipleActors-area').read()).toBe('circle');
		expect(getControl('getMultipleActors-radius').read()).toBe(3);
		expect(getControl('getMultipleActors-selector').read()).toBe('any');
		expect(getControl('getMultipleActors-activation').read()).toBe('inactive');
		wrapper.unmount();
	});

	it('save 路径：rectangle + team 组合保存 area/width/height/teamId 并裁剪 radius', async () => {
		const wrapper = mount(GetMultipleActors, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.getMultipleActors.customLoad!({
			variable: { type: 'local', key: 'list' },
			position: { type: 'absolute', x: 0, y: 0 },
			area: 'rectangle',
			width: 2,
			height: 3,
			radius: 0.5,
			selector: 'friend',
			teamId: 'team1',
			activation: 'active'
		});
		getControl('getMultipleActors-width').write(4);
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.getMultipleActors.save!();
		expect(saved).toHaveBeenCalledWith({
			variable: { type: 'local', key: 'list' },
			position: { type: 'absolute', x: 0, y: 0 },
			area: 'rectangle',
			width: 4,
			height: 3,
			selector: 'friend',
			teamId: 'team1',
			activation: 'active'
		});
		wrapper.unmount();
	});

	it('save 路径：circle + any 组合保存 radius 并裁剪 width/height/teamId', async () => {
		const wrapper = mount(GetMultipleActors, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.getMultipleActors.customLoad!({
			variable: { type: 'local', key: 'list' },
			position: { type: 'absolute', x: 0, y: 0 },
			area: 'circle',
			radius: 3,
			selector: 'any',
			activation: 'either'
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.getMultipleActors.save!();
		expect(saved).toHaveBeenCalledWith({
			variable: { type: 'local', key: 'list' },
			position: { type: 'absolute', x: 0, y: 0 },
			area: 'circle',
			radius: 3,
			selector: 'any',
			activation: 'either'
		});
		wrapper.unmount();
	});

	it('save 路径：variable 无效校验失败不保存', async () => {
		const wrapper = mount(GetMultipleActors, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.getMultipleActors.customLoad!({
			variable: { type: 'local', key: '' },
			position: { type: 'absolute', x: 0, y: 0 },
			area: 'rectangle',
			width: 1,
			height: 1,
			selector: 'enemy',
			activation: 'active'
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.getMultipleActors.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
