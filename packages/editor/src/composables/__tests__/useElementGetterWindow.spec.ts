import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ElementGetter from '@app/components/tools/ElementGetter.vue';
import { useElementGetterWindow } from '@app/composables/useElementGetterWindow';
import { Window } from '@app/tools/window-object.ts';
import { ElementGetter as ElementGetterController } from '@app/commands/accessors/element-accessor-window.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

const getFrame = (id: string): HTMLElement => document.getElementById(id) as HTMLElement;

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

	it('open 打开窗口、解析 read 数据填充 form', async () => {
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
		wrapper.unmount();
	});

	it('confirm 经 form 读回值回调并关闭窗口（by-button-index 含 focus/index）', async () => {
		const wrapper = mount(ElementGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const elementGetter = useElementGetterWindow();
		const target = makeTarget(() => ({ type: 'by-button-index' }));
		elementGetter.open(target as never);
		elementGetter.form.type = 'by-button-index';
		elementGetter.form.ancestor = { type: 'actor', key: 'a1' } as {
			type: string;
			key?: string;
		};
		elementGetter.form.index = 2;
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
		elementGetter.form.type = 'by-id';
		elementGetter.form.presetId = '';
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
		const elementGetter = useElementGetterWindow();
		const target = makeTarget(() => ({
			type: 'variable',
			variable: { type: 'local', key: 'v1' }
		}));
		ElementGetterController.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('elementGetter');
		expect(elementGetter.form.type).toBe('variable');
		expect(elementGetter.form.variable).toEqual({ type: 'local', key: 'v1' });
		elementGetter.form.variable = { type: 'local', key: 'v2' };
		ElementGetterController.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({
			type: 'variable',
			variable: { type: 'local', key: 'v2' }
		});
		expect(Window.close).toHaveBeenCalledWith('elementGetter');
		wrapper.unmount();
	});
});
