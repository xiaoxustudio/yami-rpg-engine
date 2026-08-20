import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import PositionGetter from '@app/components/tools/PositionGetter.vue';
import { usePositionGetterWindow } from '@app/composables/usePositionGetterWindow';
import { Window } from '@app/legacy/tools/window-object.ts';
import { PositionGetter as PositionGetterController } from '@app/commands/accessors/position-accessor-window.ts';

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

describe('usePositionGetterWindow（位置访问器窗口 composable：form 状态 + open/confirm/closed）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 打开窗口、解析 read 数据填充 form 与控件 DOM 并写入回调', async () => {
		const wrapper = mount(PositionGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const positionGetter = usePositionGetterWindow();
		const target = makeTarget(() => ({ type: 'absolute', x: 3, y: -4 }));
		positionGetter.open(target as never);
		expect(Window.open).toHaveBeenCalledWith('positionGetter');
		expect(positionGetter.form.type).toBe('absolute');
		expect(positionGetter.form.x).toBe(3);
		expect(positionGetter.form.y).toBe(-4);
		expect(getFrame('positionGetter').getForm().type).toBe('absolute');
		expect(getControl('positionGetter-type').read()).toBe('absolute');
		expect(getControl('positionGetter-common-x').read()).toBe(3);
		expect(getControl('positionGetter-common-y').read()).toBe(-4);
		wrapper.unmount();
	});

	it('confirm 经 getForm 读回控件值回调并关闭窗口（object 含 objectId）', async () => {
		const wrapper = mount(PositionGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const positionGetter = usePositionGetterWindow();
		const target = makeTarget(() => ({ type: 'object', objectId: 'obj-1' }));
		positionGetter.open(target as never);
		getControl('positionGetter-type').write('object');
		getControl('positionGetter-objectId').write('obj-9');
		positionGetter.confirm();
		expect(target.input).toHaveBeenCalledWith({ type: 'object', objectId: 'obj-9' });
		expect(Window.close).toHaveBeenCalledWith('positionGetter');
		wrapper.unmount();
	});

	it('confirm 校验失败（object objectId 为空）聚焦控件且不回调不关闭', async () => {
		const wrapper = mount(PositionGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const positionGetter = usePositionGetterWindow();
		const target = makeTarget(() => ({ type: 'object', objectId: 'obj-1' }));
		positionGetter.open(target as never);
		getControl('positionGetter-type').write('object');
		getControl('positionGetter-objectId').write('');
		positionGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		expect(Window.close).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('plugin 输入在回调前包裹 getter 标识', async () => {
		const wrapper = mount(PositionGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const positionGetter = usePositionGetterWindow();
		const target = makeTarget(() => ({ type: 'mouse' }));
		(target as { isPluginInput?: boolean }).isPluginInput = true;
		positionGetter.open(target as never);
		positionGetter.confirm();
		expect(target.input).toHaveBeenCalledWith({ getter: 'position', type: 'mouse' });
		expect(Window.close).toHaveBeenCalledWith('positionGetter');
		wrapper.unmount();
	});

	it('closed 事件清除回调，后续 confirm 不再触发', async () => {
		const wrapper = mount(PositionGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const positionGetter = usePositionGetterWindow();
		const target = makeTarget(() => ({ type: 'mouse' }));
		positionGetter.open(target as never);
		getFrame('positionGetter').dispatchEvent(new CustomEvent('closed'));
		positionGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('legacy PositionGetter.open/confirm 转发 composable 并回调 target.input', async () => {
		const wrapper = mount(PositionGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({
			type: 'region',
			region: { type: 'trigger' },
			mode: 'center'
		}));
		PositionGetterController.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('positionGetter');
		expect(getControl('positionGetter-type').read()).toBe('region');
		getControl('positionGetter-region-mode').write('random');
		PositionGetterController.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({
			type: 'region',
			region: { type: 'trigger' },
			mode: 'random'
		});
		expect(Window.close).toHaveBeenCalledWith('positionGetter');
		wrapper.unmount();
	});
});
