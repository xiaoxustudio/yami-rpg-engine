import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SwitchConditionWindow from '@app/components/tools/SwitchCondition.vue';
import { SwitchCondition } from '@app/legacy/command/match-condition-window.ts';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { Data } from '@app/legacy/data/data-object.ts';
import { Window } from '@app/legacy/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

vi.mock('@app/i18n', () => ({
	t: (key: string) =>
		key.includes('keyboard') ? 'Key' : key.includes('gamepad') ? 'Gamepad' : 'Mouse',
	createGetter: () => (key: string) => key
}));

interface ControlEl extends HTMLElement {
	read(): unknown;
	write(value: unknown): void;
	input(value: unknown): void;
}

const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

const target = {
	save: vi.fn(() => ({ type: 'number', value: 1 }) as never)
};

describe('useSwitchConditionSchema（switch 条件窗口 composable：open/save/parse/confirm 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = (variable: { key: string }) => variable.key === '';
		Window.open = vi.fn();
		Window.close = vi.fn();
		Data.attribute = { context: { getAttribute: () => null } } as never;
		Command.setNumberColor = ((value: unknown) => `[num:${value}]`) as never;
		Command.setBooleanColor = ((value: unknown) => `[bool:${value}]`) as never;
		Command.setStringColor = ((value: unknown) => `[str:${value}]`) as never;
		Command.setOperatorColor = ((value: unknown) => `[op:${value}]`) as never;
		Command.setDelimiterColor = ((value: unknown) => `[dl:${value}]`) as never;
		Command.parseMultiLineString = ((value: unknown) => String(value)) as never;
		Command.parseVariable = ((variable: { key: string }, type: string) =>
			`<var:${variable.key}:${type}>`) as never;
		Command.parseAttributeTag = ((id: string) => `<attr:${id}>`) as never;
		Command.parseEnumStringTag = ((id: string) => `<enum:${id}>`) as never;
		Command.removeTextTags = ((value: string) => value) as never;
		SwitchCondition.target = target as never;
	});

	it('open 按条件类型分解到控件 DOM（number/variable/attribute 分支）', async () => {
		const wrapper = mount(SwitchConditionWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		SwitchCondition.open!({ type: 'number', value: 42 });
		expect(Window.open).toHaveBeenCalledWith('switch-condition');
		expect(getControl('switch-condition-type').read()).toBe('number');
		expect(getControl('switch-condition-number-value').read()).toBe(42);
		SwitchCondition.open!({ type: 'variable', variable: { type: 'local', key: 'x' } });
		expect(getControl('switch-condition-variable-variable').read()).toEqual({
			type: 'local',
			key: 'x'
		});
		SwitchCondition.open!({ type: 'attribute', attributeId: 'hp' });
		expect(getControl('switch-condition-attribute-attributeId').read()).toBe('hp');
		wrapper.unmount();
	});

	it('save 从控件读回组装条件并关闭窗口', async () => {
		const wrapper = mount(SwitchConditionWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		SwitchCondition.open!({ type: 'number', value: 7 });
		getControl('switch-condition-number-value').write(99);
		expect(SwitchCondition.save!()).toEqual({ type: 'number', value: 99 });
		expect(Window.close).toHaveBeenCalledWith('switch-condition');
		SwitchCondition.open!({ type: 'string', value: 'hello' });
		getControl('switch-condition-string-value').write('world');
		expect(SwitchCondition.save!()).toEqual({ type: 'string', value: 'world' });
		wrapper.unmount();
	});

	it('save 校验失败返回控件焦点且不关闭窗口', async () => {
		const wrapper = mount(SwitchConditionWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		SwitchCondition.open!({ type: 'variable', variable: { type: 'local', key: '' } });
		expect(SwitchCondition.save!()).toBeUndefined();
		expect(Window.close).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('parse 渲染各类型条件文本（number/string/keyboard/variable）', () => {
		expect(SwitchCondition.parse!({ type: 'number', value: 5 })).toBe('[num:5]');
		expect(SwitchCondition.parse!({ type: 'string', value: 'hi' })).toBe('[str:"hi"]');
		expect(SwitchCondition.parse!({ type: 'keyboard', keycode: 'Enter' })).toContain('Enter');
		expect(
			SwitchCondition.parse!({ type: 'variable', variable: { type: 'local', key: 'x' } })
		).toBe('<var:x:any>');
	});

	it('confirm 转发到 target.save', () => {
		target.save.mockClear();
		SwitchCondition.confirm!(new Event('click'));
		expect(target.save).toHaveBeenCalled();
	});
});
