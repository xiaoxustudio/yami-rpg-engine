import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import TriggerGetter from '@app/components/tools/TriggerGetter.vue';
import { useTriggerGetterWindow } from '@app/composables/useTriggerGetterWindow';
import { Window } from '@app/legacy/tools/window-object.ts';
import { TriggerGetter as TriggerGetterController } from '@app/commands/accessors/trigger-accessor-window.ts';

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

describe('useTriggerGetterWindow（触发器访问器窗口 composable：form 状态 + open/confirm/closed）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 打开窗口、解析 read 数据填充 form 与控件 DOM 并写入回调', async () => {
		const wrapper = mount(TriggerGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const triggerGetter = useTriggerGetterWindow();
		const target = makeTarget(() => ({
			type: 'variable',
			variable: { type: 'global', key: 'g1' }
		}));
		triggerGetter.open(target as never);
		expect(Window.open).toHaveBeenCalledWith('triggerGetter');
		expect(triggerGetter.form.type).toBe('variable');
		expect(triggerGetter.form.variable).toEqual({ type: 'global', key: 'g1' });
		expect(getFrame('triggerGetter').getForm().type).toBe('variable');
		expect(getControl('triggerGetter-type').read()).toBe('variable');
		expect(getControl('triggerGetter-variable').read()).toEqual({ type: 'global', key: 'g1' });
		wrapper.unmount();
	});

	it('confirm 经 getForm 读回控件值回调并关闭窗口（variable 含变量）', async () => {
		const wrapper = mount(TriggerGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const triggerGetter = useTriggerGetterWindow();
		const target = makeTarget(() => ({
			type: 'variable',
			variable: { type: 'local', key: 'v1' }
		}));
		triggerGetter.open(target as never);
		getControl('triggerGetter-type').write('variable');
		getControl('triggerGetter-variable').write({ type: 'local', key: 'v2' });
		triggerGetter.confirm();
		expect(target.input).toHaveBeenCalledWith({
			type: 'variable',
			variable: { type: 'local', key: 'v2' }
		});
		expect(Window.close).toHaveBeenCalledWith('triggerGetter');
		wrapper.unmount();
	});

	it('confirm 校验失败（variable 未选）聚焦控件且不回调不关闭', async () => {
		const wrapper = mount(TriggerGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const triggerGetter = useTriggerGetterWindow();
		const target = makeTarget(() => ({
			type: 'variable',
			variable: { type: 'local', key: 'v1' }
		}));
		triggerGetter.open(target as never);
		getControl('triggerGetter-type').write('variable');
		getControl('triggerGetter-variable').write({ type: 'local', key: '' });
		triggerGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		expect(Window.close).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('closed 事件清除回调，后续 confirm 不再触发', async () => {
		const wrapper = mount(TriggerGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const triggerGetter = useTriggerGetterWindow();
		const target = makeTarget(() => ({ type: 'latest' }));
		triggerGetter.open(target as never);
		getFrame('triggerGetter').dispatchEvent(new CustomEvent('closed'));
		triggerGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('legacy TriggerGetter.open/confirm 转发 composable 并回调 target.input', async () => {
		const wrapper = mount(TriggerGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({
			type: 'variable',
			variable: { type: 'local', key: 'v1' }
		}));
		TriggerGetterController.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('triggerGetter');
		expect(getControl('triggerGetter-type').read()).toBe('variable');
		getControl('triggerGetter-variable').write({ type: 'local', key: 'v3' });
		TriggerGetterController.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({
			type: 'variable',
			variable: { type: 'local', key: 'v3' }
		});
		expect(Window.close).toHaveBeenCalledWith('triggerGetter');
		wrapper.unmount();
	});
});
