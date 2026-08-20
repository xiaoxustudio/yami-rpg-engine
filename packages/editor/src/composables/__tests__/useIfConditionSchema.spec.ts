import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import IfConditionWindow from '@app/components/tools/IfCondition.vue';
import {
	IfCondition,
	type IfConditionData
} from '@app/legacy/command/conditional-condition-window.ts';
import { Command } from '@app/commands/command-object.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Enum } from '@app/legacy/enum/enum-window.ts';
import { Data } from '@app/legacy/data/data-object.ts';
import { Window } from '@app/legacy/tools/window-object.ts';

vi.mock('@app/composables/useCommandColor.ts', () => ({
	setOperatorColor: (value: unknown) => `[op:${value}]`,
	setBooleanColor: (value: unknown) => `[bool:${value}]`,
	setNumberColor: (value: unknown) => `[num:${value}]`,
	setStringColor: (value: unknown) => `[str:${value}]`,
	setDelimiterColor: (value: unknown) => `[dl:${value}]`
}));

vi.mock('@app/composables/useCommandParse.ts', () => ({
	parseVariable: (variable: { key: string }, type: string) => `<var:${variable.key}:${type}>`,
	parseMultiLineString: (value: unknown) => String(value),
	parseEnumStringTag: (id: string) => `<enum:${id}>`,
	parseFileName: (id: string) => `<file:${id}>`,
	parseVariableEnum: (group: string, key: string) => `<venum:${group}:${key}>`,
	parseActor: (actor: { type: string }) => `<actor:${actor.type}>`,
	parseSkill: (skill: { type: string }) => `<skill:${skill.type}>`,
	parseState: (state: { type: string }) => `<state:${state.type}>`,
	parseEquipment: (equipment: { type: string }) => `<equipment:${equipment.type}>`,
	parseItem: (item: { type: string }) => `<item:${item.type}>`,
	parseTrigger: (trigger: { type: string }) => `<trigger:${trigger.type}>`,
	parseLight: (light: { type: string }) => `<light:${light.type}>`,
	parseElement: (element: { type: string }) => `<element:${element.type}>`,
	parseTeam: (teamId: string) => `<team:${teamId}>`,
	removeTextTags: (value: string) => value
}));

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

vi.mock('@app/i18n', () => ({
	t: (key: string) => key,
	createGetter: () => (key: string) => key,
	getLabel: () => '',
	getTip: () => '',
	getContent: () => ''
}));

const target = {
	save: vi.fn(() => ({ type: 'number' }) as never)
};

describe('useIfConditionSchema（if 条件窗口 composable：parse 树形渲染/校验/动态绑定转发）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = (variable: { key: string }) => variable.key === '';
		Window.open = vi.fn();
		Window.close = vi.fn();
		Enum.getStringItems = vi.fn(() => []) as never;
		Enum.getDefStringId = vi.fn(() => 'id0') as never;
		Data.teams = { list: [{ id: 'team0' }] } as never;
		Command.setOperatorColor = ((value: unknown) => `[op:${value}]`) as never;
		Command.setDelimiterColor = ((value: unknown) => `[dl:${value}]`) as never;
		Command.setBooleanColor = ((value: unknown) => `[bool:${value}]`) as never;
		IfCondition.target = target as never;
	});

	it('parse 树形渲染：boolean/number/string/object/actor/element 各类型', () => {
		expect(
			IfCondition.parse!({
				type: 'number',
				variable: { type: 'local', key: 'hp' },
				operation: 'greater',
				operand: { type: 'constant', value: 5 }
			} as IfConditionData)
		).toBe('<var:hp:number> [op:>] [num:5]');
		expect(
			IfCondition.parse!({
				type: 'boolean',
				variable: { type: 'local', key: 'flag' },
				operation: 'equal',
				operand: { type: 'variable', variable: { type: 'local', key: 'other' } }
			} as IfConditionData)
		).toBe('<var:flag:boolean> [op:==] <var:other:boolean>');
		expect(
			IfCondition.parse!({
				type: 'string',
				variable: { type: 'local', key: 'name' },
				operation: 'equal',
				operand: { type: 'enum', stringId: 'en0' }
			} as IfConditionData)
		).toBe('<var:name:string> [op:==] <enum:en0>');
		expect(
			IfCondition.parse!({
				type: 'object',
				variable: { type: 'local', key: 'obj' },
				operation: 'equal',
				operand: { type: 'actor', actor: { type: 'trigger' } }
			} as IfConditionData)
		).toBe('<var:obj:object> [op:==] <actor:trigger>');
		expect(
			IfCondition.parse!({
				type: 'actor',
				actor: { type: 'trigger' },
				operation: 'has-skill',
				skillId: 'skill0'
			} as IfConditionData)
		).toContain('<actor:trigger>');
		expect(
			IfCondition.parse!({
				type: 'element',
				element: { type: 'trigger' },
				operation: 'visible'
			} as IfConditionData)
		).toContain('<element:trigger>');
	});

	it('parse 树形渲染：keyboard/gamepad/mouse/list/other 各类型', () => {
		expect(
			IfCondition.parse!({
				type: 'keyboard',
				keycode: 'Enter',
				state: 'just-pressed'
			} as IfConditionData)
		).toContain('Enter');
		expect(
			IfCondition.parse!({
				type: 'gamepad',
				button: 1,
				state: 'pressed'
			} as IfConditionData)
		).toContain('B');
		expect(
			IfCondition.parse!({
				type: 'mouse',
				button: 2,
				state: 'pressed'
			} as IfConditionData)
		).toContain('command.if.mouse');
		expect(
			IfCondition.parse!({
				type: 'list',
				list: { type: 'local', key: 'list' },
				operation: 'include',
				target: { type: 'local', key: 'item' }
			} as IfConditionData)
		).toBe('<var:list:object> command.if.list.include <var:item:any>');
		expect(IfCondition.parseListOperation!({ operation: 'include' } as IfConditionData)).toBe(
			'command.if.list.include'
		);
		expect(IfCondition.parseOther!({ key: 'mouse-entered' } as IfConditionData)).toBe(
			'command.if.other.mouse-entered'
		);
	});

	it('writeHandler 按类型更新变量过滤器', async () => {
		const wrapper = mount(IfConditionWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		IfCondition.writeHandler!({ value: 'number' });
		const common = document.getElementById('if-condition-common-variable') as unknown as {
			filter: string;
		};
		expect(common.filter).toBe('number');
		IfCondition.writeHandler!({ value: 'list' });
		expect(common.filter).toBe('object');
		wrapper.unmount();
	});

	it('save 树形校验：object 类型 equal 分支组装 operand', async () => {
		const wrapper = mount(IfConditionWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		IfCondition.open!({
			type: 'object',
			variable: { type: 'local', key: 'obj' },
			operation: 'equal',
			operand: { type: 'actor', actor: { type: 'trigger' } }
		});
		await wrapper.vm.$nextTick();
		expect(IfCondition.save!()).toEqual({
			type: 'object',
			variable: { type: 'local', key: 'obj' },
			operation: 'equal',
			operand: { type: 'actor', actor: { type: 'trigger' } }
		});
		wrapper.unmount();
	});

	it('confirm 转发到 target.save', () => {
		target.save.mockClear();
		IfCondition.confirm!(new Event('click'));
		expect(target.save).toHaveBeenCalled();
	});
});
