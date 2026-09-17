import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SwitchConditionWindow from '@app/components/tools/SwitchCondition.vue';
import { form, useSwitchConditionSchema } from '@app/composables/useSwitchConditionSchema';

const SwitchCondition = useSwitchConditionSchema();
import { Command } from '@app/commands/command-object.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Data } from '@app/data/data-object.ts';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/composables/useCommandColor.ts', () => ({
	setNumberColor: (value: unknown) => `[num:${String(value)}]`,
	setBooleanColor: (value: unknown) => `[bool:${String(value)}]`,
	setStringColor: (value: unknown) => `[str:${String(value)}]`,
	setOperatorColor: (value: unknown) => `[op:${String(value)}]`,
	setDelimiterColor: (value: unknown) => `[dl:${String(value)}]`
}));

vi.mock('@app/composables/useCommandParse.ts', () => ({
	parseMultiLineString: (value: unknown) => String(value),
	parseVariable: (variable: { key: string }, type: string) => `<var:${variable.key}:${type}>`,
	parseAttributeTag: (id: string) => `<attr:${id}>`,
	parseEnumStringTag: (id: string) => `<enum:${id}>`,
	removeTextTags: (value: string) => value
}));

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() })
}));

vi.mock('@app/i18n', () => ({
	getYamiI18n: () => ({
		global: {
			t: (key: string) =>
				key.includes('keyboard') ? 'Key' : key.includes('gamepad') ? 'Gamepad' : 'Mouse'
		}
	})
}));

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
		Command.setOperatorColor = ((value: unknown) => `[op:${String(value)}]`) as never;
		Command.setDelimiterColor = ((value: unknown) => `[dl:${String(value)}]`) as never;
		Command.setBooleanColor = ((value: unknown) => `[bool:${String(value)}]`) as never;
		SwitchCondition.target = target as never;
	});

	it('open 按条件类型分解到共享 form（number/variable/attribute 分支）', async () => {
		const wrapper = mount(SwitchConditionWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		SwitchCondition.open!({ type: 'number', value: 42 });
		expect(Window.open).toHaveBeenCalledWith('switch-condition');
		expect(form.type).toBe('number');
		expect(form.numberValue).toBe(42);
		SwitchCondition.open!({ type: 'variable', variable: { type: 'local', key: 'x' } });
		expect(form.variable).toEqual({ type: 'local', key: 'x' });
		SwitchCondition.open!({ type: 'attribute', attributeId: 'hp' });
		expect(form.attributeId).toBe('hp');
		wrapper.unmount();
	});

	it('save 从 form 读回组装条件并关闭窗口', async () => {
		const wrapper = mount(SwitchConditionWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		SwitchCondition.open!({ type: 'number', value: 7 });
		form.numberValue = 99;
		expect(SwitchCondition.save!()).toEqual({ type: 'number', value: 99 });
		expect(Window.close).toHaveBeenCalledWith('switch-condition');
		SwitchCondition.open!({ type: 'string', value: 'hello' });
		form.stringValue = 'world';
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
