import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import GetActor from '@app/components/commands/GetActor.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Attribute } from '@app/attribute/attribute-window.ts';
import { Data } from '@app/data/data-object.ts';
import { Window } from '@app/tools/window-object.ts';
import { useGetActorCommandSchema } from '@app/composables/commands/useGetActorCommandSchema';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

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

	const mountWindow = async () => {
		const wrapper = mount(GetActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		return wrapper;
	};

	it('onMounted loadItems 填充 area/selector/condition/activation/exclusion 选项', async () => {
		const wrapper = await mountWindow();
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

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = await mountWindow();
		const { form } = useGetActorCommandSchema();
		CommandSchema.insert(target, 'getActor');
		expect(Window.open).toHaveBeenCalledWith('getActor');
		expect(form.variable).toEqual({ type: 'local', key: '' });
		expect(form.area).toBe('square');
		expect(form.size).toBe(1);
		expect(form.radius).toBe(0.5);
		expect(form.selector).toBe('enemy');
		expect(form.teamId).toBe('team0');
		expect(form.condition).toBe('nearest');
		expect(form.activation).toBe('active');
		expect(form.exclusion).toBe('none');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form（含 selector/activation remap）', async () => {
		const wrapper = await mountWindow();
		const { form } = useGetActorCommandSchema();
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
		expect(form.variable).toEqual({ type: 'local', key: 'foo' });
		expect(form.area).toBe('circle');
		expect(form.radius).toBe(2);
		expect(form.selector).toBe('team');
		expect(form.condition).toBe('max-attribute-ratio');
		expect(form.attribute).toBe('hp');
		expect(form.divisor).toBe('maxhp');
		expect(form.activation).toBe('either');
		expect(form.exclusion).toBe('actor');
		expect(form.exclusionActor).toEqual({ type: 'actor', key: 'a1' });
		wrapper.unmount();
	});

	it('save 路径：用户改 form 后经 Command.cases.getActor.save 保存', async () => {
		const wrapper = await mountWindow();
		const { form } = useGetActorCommandSchema();
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
		form.area = 'circle';
		form.radius = 1.5;
		form.selector = 'any';
		form.condition = 'min-attribute-ratio';
		form.attribute = 'hp';
		form.divisor = 'maxhp';
		form.exclusion = 'team';
		form.exclusionTeamId = 'team1';
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
		const wrapper = await mountWindow();
		const { form } = useGetActorCommandSchema();
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
