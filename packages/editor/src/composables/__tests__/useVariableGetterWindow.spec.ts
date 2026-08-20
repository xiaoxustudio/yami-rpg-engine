import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import VariableGetterWindow from '@app/components/tools/VariableGetter.vue';
import { useVariableGetterWindow } from '@app/composables/useVariableGetterWindow';
import { Window } from '@app/legacy/tools/window-object.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Attribute } from '@app/legacy/attribute/attribute-window.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface FormFrame extends HTMLElement {
	setForm(data: Record<string, unknown>): void;
	getForm(): Record<string, unknown>;
}

interface ControlEl extends HTMLElement {
	write(value: unknown): void;
	read(): unknown;
}

const getFrame = (id: string): FormFrame => document.getElementById(id) as unknown as FormFrame;

const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

const makeTarget = (read?: () => unknown) => ({
	dataValue: undefined,
	read,
	input: vi.fn()
});

describe('useVariableGetterWindow（变量访问器窗口 composable：form 状态 + open/confirm/类型切换）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
		Window.isWindowOpen = vi.fn(() => false);
	});

	it('open 打开主窗口、解析 read 数据填充 form 与控件 DOM 并写入回调', async () => {
		const wrapper = mount(VariableGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const variableGetter = useVariableGetterWindow();
		const target = makeTarget(() => ({ type: 'local', key: 'v1' }));
		variableGetter.open(target as never);
		expect(Window.open).toHaveBeenCalledWith('variableGetter');
		expect(variableGetter.form.type).toBe('local');
		expect(variableGetter.form.commonKey).toBe('v1');
		expect(getFrame('variableGetter').getForm().type).toBe('local');
		expect(getControl('variableGetter-type').read()).toBe('local');
		expect(getControl('variableGetter-common-key').read()).toBe('v1');
		wrapper.unmount();
	});

	it('confirm 经 getForm 读回控件值回调并关闭窗口（local 路径）', async () => {
		const wrapper = mount(VariableGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const variableGetter = useVariableGetterWindow();
		const target = makeTarget(() => ({ type: 'local', key: 'v1' }));
		variableGetter.open(target as never);
		getControl('variableGetter-type').write('local');
		getControl('variableGetter-common-key').write('v2');
		variableGetter.confirm();
		expect(target.input).toHaveBeenCalledWith({ type: 'local', key: 'v2' });
		expect(Window.close).toHaveBeenCalledWith('variableGetter');
		wrapper.unmount();
	});

	it('confirm 校验失败（local 空 key）聚焦控件且不回调不关闭', async () => {
		const wrapper = mount(VariableGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const variableGetter = useVariableGetterWindow();
		const target = makeTarget(() => ({ type: 'local', key: 'v1' }));
		variableGetter.open(target as never);
		getControl('variableGetter-type').write('local');
		getControl('variableGetter-common-key').write('');
		variableGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		expect(Window.close).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('类型切换路径：typeWrite 触发 loadPresetKeys（按 filter 解析属性类型）', async () => {
		const wrapper = mount(VariableGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const variableGetter = useVariableGetterWindow();
		const getAttributeItems = vi.fn(() => [{ name: 'HP', value: 'hp' }]);
		Attribute.getAttributeItems = getAttributeItems as never;
		const target = makeTarget(() => ({ type: 'local', key: '' }));
		variableGetter.open(target as never, { filter: 'number' });
		variableGetter.typeWrite({ value: 'actor' } as Event & { value: string });
		expect(getAttributeItems).toHaveBeenCalledWith('actor', 'number');
		variableGetter.typeWrite({ value: 'element' } as Event & { value: string });
		expect(getAttributeItems).toHaveBeenCalledWith('element', 'number');
		wrapper.unmount();
	});

	it('窗口2（递归叠加）分支：filter object 限制类型集合并解析 element 数据', async () => {
		const wrapper = mount(VariableGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const variableGetter = useVariableGetterWindow();
		Attribute.getDefAttributeId = vi.fn(() => 'atk') as never;
		const target = makeTarget(() => ({
			type: 'element',
			element: { type: 'trigger' },
			key: 'def'
		}));
		variableGetter.open(target as never, { prefix: 'variableGetter2', filter: 'object' });
		expect(variableGetter.form.type).toBe('element');
		expect(variableGetter.form.element).toEqual({ type: 'trigger' });
		expect(variableGetter.form.presetKey).toBe('def');
		expect(Window.open).toHaveBeenCalledWith('variableGetter2');
		expect(Attribute.getDefAttributeId).toHaveBeenCalledWith('element', 'object');
		wrapper.unmount();
	});

	it('plugin 输入在回调前包裹 getter 标识（plugin.ts 契约冒烟）', async () => {
		const wrapper = mount(VariableGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const variableGetter = useVariableGetterWindow();
		const target = makeTarget(() => ({ type: 'self' }));
		(target as { isPluginInput?: boolean }).isPluginInput = true;
		variableGetter.open(target as never);
		variableGetter.confirm();
		expect(target.input).toHaveBeenCalledWith({ getter: 'variable', type: 'self' });
		expect(Window.close).toHaveBeenCalledWith('variableGetter');
		expect(VariableGetter.checkDataForPlugin!({ getter: 'variable' })).toBe(true);
		expect(VariableGetter.checkDataForPlugin!({ getter: 'actor' })).toBe(false);
		expect(VariableGetter.createDefaultForPlugin!()).toEqual({
			getter: 'variable',
			type: 'local',
			key: ''
		});
		expect(VariableGetter.isNone!({ key: '' })).toBe(true);
		wrapper.unmount();
	});

	it('closed 事件清除状态，后续 confirm 不再触发', async () => {
		const wrapper = mount(VariableGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const variableGetter = useVariableGetterWindow();
		const target = makeTarget(() => ({ type: 'self' }));
		variableGetter.open(target as never);
		getFrame('variableGetter').dispatchEvent(new CustomEvent('closed'));
		variableGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('legacy VariableGetter.open/confirm 转发 composable 并回调 target.input', async () => {
		const wrapper = mount(VariableGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'local', key: 'v1' }));
		VariableGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('variableGetter');
		expect(getControl('variableGetter-type').read()).toBe('local');
		expect(getControl('variableGetter-common-key').read()).toBe('v1');
		getControl('variableGetter-common-key').write('v2');
		VariableGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({ type: 'local', key: 'v2' });
		expect(Window.close).toHaveBeenCalledWith('variableGetter');
		wrapper.unmount();
	});

	it('legacy open 在主窗口已打开时叠加打开窗口2', async () => {
		const wrapper = mount(VariableGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Window.isWindowOpen = vi.fn((id: string) => id === 'variableGetter');
		const target = makeTarget(() => ({ type: 'local', key: 'v1' }));
		VariableGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('variableGetter2');
		wrapper.unmount();
	});
});
