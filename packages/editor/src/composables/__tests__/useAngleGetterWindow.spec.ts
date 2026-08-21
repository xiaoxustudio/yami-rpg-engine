import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import AngleGetter from '@app/components/tools/AngleGetter.vue';
import { useAngleGetterWindow } from '@app/composables/useAngleGetterWindow';
import { Window } from '@app/tools/window-object.ts';
import { AngleGetter as AngleGetterController } from '@app/commands/accessors/angle-accessor-window.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

const getFrame = (id: string): HTMLElement => document.getElementById(id) as HTMLElement;

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

	it('open 打开窗口、解析 read 数据填充 form', async () => {
		const wrapper = mount(AngleGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const angleGetter = useAngleGetterWindow();
		const target = makeTarget(() => ({ type: 'absolute', degrees: 90 }));
		angleGetter.open(target as never);
		expect(Window.open).toHaveBeenCalledWith('angleGetter');
		expect(angleGetter.form.type).toBe('absolute');
		expect(angleGetter.form.degrees).toBe(90);
		wrapper.unmount();
	});

	it('confirm 经 form 读回值回调并关闭窗口（position 含位置）', async () => {
		const wrapper = mount(AngleGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const angleGetter = useAngleGetterWindow();
		const target = makeTarget(() => ({ type: 'position' }));
		angleGetter.open(target as never);
		angleGetter.form.type = 'position';
		angleGetter.form.position = { type: 'actor', actor: { type: 'trigger' } };
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
		const angleGetter = useAngleGetterWindow();
		const target = makeTarget(() => ({ type: 'direction', degrees: 45 }));
		AngleGetterController.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('angleGetter');
		expect(angleGetter.form.type).toBe('direction');
		expect(angleGetter.form.degrees).toBe(45);
		angleGetter.form.degrees = 180;
		AngleGetterController.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({ type: 'direction', degrees: 180 });
		expect(Window.close).toHaveBeenCalledWith('angleGetter');
		wrapper.unmount();
	});
});
