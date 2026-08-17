import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import AngleGetter from '@app/components/tools/AngleGetter.vue';
import { useAngleGetterWindow } from '@app/composables/useAngleGetterWindow';
import { Window } from '@app/legacy/tools/window-object.ts';
import { AngleGetter as AngleGetterController } from '@app/legacy/command/angle-accessor-window.ts';

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

describe('useAngleGetterWindow（角度访问器窗口 composable：form 状态 + open/confirm/closed）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 打开窗口、解析 read 数据填充 form 与控件 DOM 并写入回调', async () => {
		const wrapper = mount(AngleGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const angleGetter = useAngleGetterWindow();
		const target = makeTarget(() => ({ type: 'absolute', degrees: 90 }));
		angleGetter.open(target as never);
		expect(Window.open).toHaveBeenCalledWith('angleGetter');
		expect(angleGetter.form.type).toBe('absolute');
		expect(angleGetter.form.degrees).toBe(90);
		expect(getFrame('angleGetter').getForm().type).toBe('absolute');
		expect(getControl('angleGetter-type').read()).toBe('absolute');
		expect(getControl('angleGetter-common-degrees').read()).toBe(90);
		wrapper.unmount();
	});

	it('confirm 经 getForm 读回控件值回调并关闭窗口（position 含位置）', async () => {
		const wrapper = mount(AngleGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const angleGetter = useAngleGetterWindow();
		const target = makeTarget(() => ({ type: 'position' }));
		angleGetter.open(target as never);
		getControl('angleGetter-type').write('position');
		getControl('angleGetter-position-position').write({
			type: 'actor',
			actor: { type: 'trigger' }
		});
		angleGetter.confirm();
		expect(target.input).toHaveBeenCalledWith({
			type: 'position',
			position: { type: 'actor', actor: { type: 'trigger' } }
		});
		expect(Window.close).toHaveBeenCalledWith('angleGetter');
		wrapper.unmount();
	});

	it('closed 事件清除回调，后续 confirm 不再触发', async () => {
		const wrapper = mount(AngleGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const angleGetter = useAngleGetterWindow();
		const target = makeTarget(() => ({ type: 'random' }));
		angleGetter.open(target as never);
		getFrame('angleGetter').dispatchEvent(new CustomEvent('closed'));
		angleGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('legacy AngleGetter.open/confirm 转发 composable 并回调 target.input', async () => {
		const wrapper = mount(AngleGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'direction', degrees: 45 }));
		AngleGetterController.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('angleGetter');
		expect(getControl('angleGetter-type').read()).toBe('direction');
		expect(getControl('angleGetter-common-degrees').read()).toBe(45);
		getControl('angleGetter-common-degrees').write(180);
		AngleGetterController.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({ type: 'direction', degrees: 180 });
		expect(Window.close).toHaveBeenCalledWith('angleGetter');
		wrapper.unmount();
	});
});
