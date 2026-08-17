import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import LightGetterWindow from '@app/components/tools/LightGetter.vue';
import ObjectGetterWindow from '@app/components/tools/ObjectGetter.vue';
import {
	useLightGetterWindow,
	useObjectGetterWindow
} from '@app/composables/usePresetGetterWindow';
import { Window } from '@app/legacy/tools/window-object.ts';
import { LightGetter, ObjectGetter } from '@app/legacy/command/preset-accessor-factory.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

vi.mock('@app/composables/usePresetObjectWindow', () => ({
	usePresetObjectWindow: () => ({
		getDefaultPresetId: vi.fn(() => 'preset-1')
	})
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

describe('usePresetGetterWindow（preset 工厂：lightGetter/objectGetter composable + 转发层）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('legacy LightGetter.open 解析 variable 数据填充 form 与控件，confirm 校验并回调关闭', async () => {
		const wrapper = mount(LightGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({
			type: 'variable',
			variable: { type: 'local', key: 'v1' }
		}));
		LightGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('lightGetter');
		const lightGetter = useLightGetterWindow();
		expect(lightGetter.form.type).toBe('variable');
		expect(lightGetter.form.variable).toEqual({ type: 'local', key: 'v1' });
		expect(getControl('lightGetter-type').read()).toBe('variable');
		expect(getControl('lightGetter-variable').read()).toEqual({ type: 'local', key: 'v1' });
		getControl('lightGetter-variable').write({ type: 'local', key: 'v2' });
		LightGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({
			type: 'variable',
			variable: { type: 'local', key: 'v2' }
		});
		expect(Window.close).toHaveBeenCalledWith('lightGetter');
		wrapper.unmount();
	});

	it('confirm 校验失败（by-id 空 presetId）聚焦控件且不回调不关闭', async () => {
		const wrapper = mount(LightGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'by-id', presetId: 'preset-1' }));
		LightGetter.open!(target as never);
		getControl('lightGetter-type').write('by-id');
		getControl('lightGetter-presetId').write('');
		LightGetter.confirm!({} as Event);
		expect(target.input).not.toHaveBeenCalled();
		expect(Window.close).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('confirm 校验失败（variable 空 key）聚焦控件且不回调', async () => {
		const wrapper = mount(LightGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({
			type: 'variable',
			variable: { type: 'local', key: 'v1' }
		}));
		LightGetter.open!(target as never);
		getControl('lightGetter-type').write('variable');
		getControl('lightGetter-variable').write({ type: 'local', key: '' });
		LightGetter.confirm!({} as Event);
		expect(target.input).not.toHaveBeenCalled();
		expect(Window.close).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('ObjectGetter 独立单例：open/confirm trigger 路径回调并关闭', async () => {
		const wrapper = mount(ObjectGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'trigger' }));
		ObjectGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('objectGetter');
		const objectGetter = useObjectGetterWindow();
		expect(objectGetter.form.type).toBe('trigger');
		ObjectGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({ type: 'trigger' });
		expect(Window.close).toHaveBeenCalledWith('objectGetter');
		wrapper.unmount();
	});
});
