import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import AncestorGetter from '@app/components/tools/AncestorGetter.vue';
import { useAncestorGetterWindow } from '@app/composables/useAncestorGetterWindow';
import { Window } from '@app/legacy/tools/window-object.ts';
import { AncestorGetter as AncestorGetterController } from '@app/commands/accessors/ancestor-accessor-window.ts';

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

describe('useAncestorGetterWindow（祖先元素访问器窗口 composable：form 状态 + open/confirm/closed）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 打开窗口、解析 read 数据填充 form 与控件 DOM 并写入回调', async () => {
		const wrapper = mount(AncestorGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const ancestorGetter = useAncestorGetterWindow();
		const target = makeTarget(() => ({ type: 'latest' }));
		ancestorGetter.open(target as never);
		expect(Window.open).toHaveBeenCalledWith('ancestorGetter');
		expect(ancestorGetter.form.type).toBe('latest');
		expect(getFrame('ancestorGetter').getForm().type).toBe('latest');
		expect(getControl('ancestorGetter-type').read()).toBe('latest');
		wrapper.unmount();
	});

	it('confirm 经 getForm 读回控件值回调并关闭窗口（by-id 含 presetId）', async () => {
		const wrapper = mount(AncestorGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const ancestorGetter = useAncestorGetterWindow();
		const target = makeTarget(() => ({ type: 'by-id' }));
		ancestorGetter.open(target as never);
		getControl('ancestorGetter-type').write('by-id');
		getControl('ancestorGetter-presetId').write('preset-9');
		ancestorGetter.confirm();
		expect(target.input).toHaveBeenCalledWith({ type: 'by-id', presetId: 'preset-9' });
		expect(Window.close).toHaveBeenCalledWith('ancestorGetter');
		wrapper.unmount();
	});

	it('confirm 校验失败（by-id presetId 为空）聚焦控件且不回调不关闭', async () => {
		const wrapper = mount(AncestorGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const ancestorGetter = useAncestorGetterWindow();
		const target = makeTarget(() => ({ type: 'by-id', presetId: 'preset-1' }));
		ancestorGetter.open(target as never);
		getControl('ancestorGetter-type').write('by-id');
		getControl('ancestorGetter-presetId').write('');
		ancestorGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		expect(Window.close).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('closed 事件清除回调，后续 confirm 不再触发', async () => {
		const wrapper = mount(AncestorGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const ancestorGetter = useAncestorGetterWindow();
		const target = makeTarget(() => ({ type: 'latest' }));
		ancestorGetter.open(target as never);
		getFrame('ancestorGetter').dispatchEvent(new CustomEvent('closed'));
		ancestorGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('legacy AncestorGetter.open/confirm 转发 composable 并回调 target.input', async () => {
		const wrapper = mount(AncestorGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({
			type: 'variable',
			variable: { type: 'local', key: 'v1' }
		}));
		AncestorGetterController.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('ancestorGetter');
		expect(getControl('ancestorGetter-type').read()).toBe('variable');
		getControl('ancestorGetter-variable').write({ type: 'local', key: 'v2' });
		AncestorGetterController.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({
			type: 'variable',
			variable: { type: 'local', key: 'v2' }
		});
		expect(Window.close).toHaveBeenCalledWith('ancestorGetter');
		wrapper.unmount();
	});
});
