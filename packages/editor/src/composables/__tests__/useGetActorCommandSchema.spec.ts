import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import GetActor from '@app/components/commands/GetActor.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Attribute } from '@app/legacy/attribute/attribute-window.ts';
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

describe('useGetActorCommandSchema（getActor 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = (variable: { key: string }) => variable.key === '';
		Attribute.getAttributeItems = vi.fn(() => [
			{ name: 'HP', value: 'hp' },
			{ name: 'MaxHP', value: 'maxhp' }
		]) as never;
		Attribute.getDefAttributeId = vi.fn(() => 'hp') as never;
		Data.teams = { list: [{ id: 'team0' }] } as never;
		Data.createTeamItems = vi.fn(() => []) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 area/selector/condition/activation/exclusion 选项', async () => {
		const wrapper = mount(GetActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const area = document.getElementById('getActor-area') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		const selector = document.getElementById('getActor-selector') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		const condition = document.getElementById('getActor-condition') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		const activation = document.getElementById('getActor-activation') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		const exclusion = document.getElementById('getActor-exclusion') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		expect(area.dataItems).toHaveLength(2);
		expect(selector.dataItems).toHaveLength(4);
		expect(condition.dataItems).toHaveLength(7);
		expect(activation.dataItems).toHaveLength(3);
		expect(exclusion.dataItems).toHaveLength(3);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(GetActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'getActor');
		expect(Window.open).toHaveBeenCalledWith('getActor');
		expect(getControl('getActor-variable').read()).toEqual({ type: 'local', key: '' });
		expect(getControl('getActor-area').read()).toBe('square');
		expect(getControl('getActor-size').read()).toBe(1);
		expect(getControl('getActor-radius').read()).toBe(0.5);
		expect(getControl('getActor-selector').read()).toBe('enemy');
		expect(getControl('getActor-teamId').read()).toBe('team0');
		expect(getControl('getActor-condition').read()).toBe('nearest');
		expect(getControl('getActor-activation').read()).toBe('active');
		expect(getControl('getActor-exclusion').read()).toBe('none');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM（含 selector/activation remap）', async () => {
		const wrapper = mount(GetActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'getActor',
			params: {
				variable: { type: 'local', key: 'foo' },
				position: { type: 'absolute', x: 1, y: 2 },
				area: 'circle',
				radius: 2,
				selector: 'team-member',
				teamId: 'team0',
				condition: 'max-attribute-ratio',
				attribute: 'hp',
				divisor: 'maxhp',
				activation: 'either',
				exclusion: 'actor',
				exclusionActor: { type: 'actor', key: 'a1' },
				active: false
			}
		});
		expect(Window.open).toHaveBeenCalledWith('getActor');
		expect(getControl('getActor-variable').read()).toEqual({ type: 'local', key: 'foo' });
		expect(getControl('getActor-area').read()).toBe('circle');
		expect(getControl('getActor-radius').read()).toBe(2);
		expect(getControl('getActor-selector').read()).toBe('team');
		expect(getControl('getActor-condition').read()).toBe('max-attribute-ratio');
		expect(getControl('getActor-attribute').read()).toBe('hp');
		expect(getControl('getActor-divisor').read()).toBe('maxhp');
		expect(getControl('getActor-activation').read()).toBe('either');
		expect(getControl('getActor-exclusion').read()).toBe('actor');
		expect(getControl('getActor-exclusionActor').read()).toEqual({ type: 'actor', key: 'a1' });
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.getActor.save 保存', async () => {
		const wrapper = mount(GetActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.getActor.customLoad!({
			variable: { type: 'local', key: 'foo' },
			position: { type: 'absolute', x: 1, y: 2 },
			area: 'square',
			size: 1,
			selector: 'enemy',
			teamId: 'team0',
			condition: 'nearest',
			activation: 'active',
			exclusion: 'none'
		});
		getControl('getActor-area').input('circle');
		getControl('getActor-radius').write(1.5);
		getControl('getActor-selector').input('any');
		getControl('getActor-condition').input('min-attribute-ratio');
		getControl('getActor-attribute').input('hp');
		getControl('getActor-divisor').input('maxhp');
		getControl('getActor-exclusion').input('team');
		getControl('getActor-exclusionTeamId').write('team1');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.getActor.save!();
		expect(saved).toHaveBeenCalledWith({
			variable: { type: 'local', key: 'foo' },
			position: { type: 'absolute', x: 1, y: 2 },
			area: 'circle',
			radius: 1.5,
			selector: 'any',
			condition: 'min-attribute-ratio',
			attribute: 'hp',
			divisor: 'maxhp',
			activation: 'active',
			exclusion: 'team',
			exclusionTeamId: 'team1'
		});
		wrapper.unmount();
	});

	it('save 路径：ratio divisor 未选校验失败不保存', async () => {
		const wrapper = mount(GetActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.getActor.customLoad!({
			variable: { type: 'local', key: 'foo' },
			position: { type: 'absolute', x: 1, y: 2 },
			area: 'square',
			size: 1,
			selector: 'enemy',
			condition: 'min-attribute-ratio',
			attribute: 'hp',
			divisor: '',
			activation: 'active',
			exclusion: 'none'
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.getActor.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
