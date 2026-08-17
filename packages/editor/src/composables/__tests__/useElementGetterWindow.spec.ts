import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ElementGetter from '@app/components/tools/ElementGetter.vue';
import { useElementGetterWindow } from '@app/composables/useElementGetterWindow';
import { Window } from '@app/legacy/tools/window-object.ts';
import { ElementGetter as ElementGetterController } from '@app/legacy/command/element-accessor-window.ts';

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

describe('useElementGetterWindow（元素访问器窗口 composable：form 状态 + open/confirm/closed）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 打开窗口、解析 read 数据填充 form 与控件 DOM 并写入回调', async () => {
		const wrapper = mount(ElementGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const elementGetter = useElementGetterWindow();
		const target = makeTarget(() => ({
			type: 'by-index',
			parent: { type: 'trigger' },
			index: 3
		}));
		elementGetter.open(target as never);
		expect(Window.open).toHaveBeenCalledWith('elementGetter');
		expect(elementGetter.form.type).toBe('by-index');
		expect(elementGetter.form.index).toBe(3);
		expect(getFrame('elementGetter').getForm().type).toBe('by-index');
		expect(getControl('elementGetter-type').read()).toBe('by-index');
		expect(getControl('elementGetter-index').read()).toBe(3);
		wrapper.unmount();
	});

	it('confirm 经 getForm 读回控件值回调并关闭窗口（by-button-index 含 focus/index）', async () => {
		const wrapper = mount(ElementGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const elementGetter = useElementGetterWindow();
		const target = makeTarget(() => ({ type: 'by-button-index' }));
		elementGetter.open(target as never);
		getControl('elementGetter-type').write('by-button-index');
		getControl('elementGetter-ancestor').write({ type: 'actor', key: 'a1' });
		getControl('elementGetter-index').write(2);
		elementGetter.confirm();
		expect(target.input).toHaveBeenCalledWith({
			type: 'by-button-index',
			focus: { type: 'actor', key: 'a1' },
			index: 2
		});
		expect(Window.close).toHaveBeenCalledWith('elementGetter');
		wrapper.unmount();
	});

	it('confirm 校验失败（by-id presetId 为空）聚焦控件且不回调不关闭', async () => {
		const wrapper = mount(ElementGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const elementGetter = useElementGetterWindow();
		const target = makeTarget(() => ({ type: 'by-id', presetId: 'preset-1' }));
		elementGetter.open(target as never);
		getControl('elementGetter-type').write('by-id');
		getControl('elementGetter-presetId').write('');
		elementGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		expect(Window.close).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('plugin 输入在回调前包裹 getter 标识', async () => {
		const wrapper = mount(ElementGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const elementGetter = useElementGetterWindow();
		const target = makeTarget(() => ({ type: 'focus' }));
		(target as { isPluginInput?: boolean }).isPluginInput = true;
		elementGetter.open(target as never);
		elementGetter.confirm();
		expect(target.input).toHaveBeenCalledWith({ getter: 'element', type: 'focus' });
		expect(Window.close).toHaveBeenCalledWith('elementGetter');
		wrapper.unmount();
	});

	it('closed 事件清除回调，后续 confirm 不再触发', async () => {
		const wrapper = mount(ElementGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const elementGetter = useElementGetterWindow();
		const target = makeTarget(() => ({ type: 'focus' }));
		elementGetter.open(target as never);
		getFrame('elementGetter').dispatchEvent(new CustomEvent('closed'));
		elementGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('legacy ElementGetter.open/confirm 转发 composable 并回调 target.input', async () => {
		const wrapper = mount(ElementGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({
			type: 'variable',
			variable: { type: 'local', key: 'v1' }
		}));
		ElementGetterController.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('elementGetter');
		expect(getControl('elementGetter-type').read()).toBe('variable');
		expect(getControl('elementGetter-variable').read()).toEqual({
			type: 'local',
			key: 'v1'
		});
		getControl('elementGetter-variable').write({ type: 'local', key: 'v2' });
		ElementGetterController.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({
			type: 'variable',
			variable: { type: 'local', key: 'v2' }
		});
		expect(Window.close).toHaveBeenCalledWith('elementGetter');
		wrapper.unmount();
	});
});
